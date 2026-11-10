-- Resume a technician-owned mission when the original requester replies.
alter table public.ticket_lifecycle_events
  drop constraint if exists ticket_lifecycle_events_event_key_check;
alter table public.ticket_lifecycle_events
  add constraint ticket_lifecycle_events_event_key_check check (
    event_key = any (array[
      'created','triaged','assigned','dispatch_offered','offer_declined',
      'requester_information_requested','requester_replied','in_progress','waiting',
      'approval_requested','approval_granted','approval_denied',
      'escalated','resolved','reopened','closed','commented'
    ]::text[])
  );

create or replace function public.dispatch_resume_after_requester_reply()
returns trigger
language plpgsql
security definer
set search_path=pg_catalog,public,dispatch,pg_temp
as $function$
declare
  v_ticket public.tickets%rowtype;
begin
  if new.channel <> 'customer' or new.visibility <> 'customer' or new.author_profile_id is null then
    return new;
  end if;

  select * into v_ticket
  from public.tickets
  where id=new.ticket_id
  for update;

  if not found
     or v_ticket.requester_profile_id is distinct from new.author_profile_id
     or v_ticket.status <> 'waiting'
     or v_ticket.waiting_on <> 'requester'
     or v_ticket.assigned_profile_id is null then
    return new;
  end if;

  update public.tickets
  set status='offered',
      waiting_on='none',
      requester_wait_seconds=requester_wait_seconds
        + greatest(0,extract(epoch from (now()-coalesce(requester_wait_started_at,now())))::bigint),
      requester_wait_started_at=null,
      updated_at=now()
  where id=v_ticket.id
  returning * into v_ticket;

  update public.ticket_offers
  set offer_status='offered',responded_at=null,response_note=null
  where ticket_id=v_ticket.id
    and offered_to_profile_id=v_ticket.assigned_profile_id
    and offer_status='info_requested';

  insert into public.ticket_sla_clock_events(
    organization_id,tenant_id,ticket_id,actor_profile_id,event_type,occurred_at,metadata
  ) values (
    v_ticket.organization_id,v_ticket.tenant_id,v_ticket.id,new.author_profile_id,
    'requester_wait_ended',now(),jsonb_build_object('message_id',new.id,'resumed_owner',v_ticket.assigned_profile_id)
  );

  insert into public.ticket_lifecycle_events(
    organization_id,tenant_id,ticket_id,actor_profile_id,event_key,from_status,to_status,reason,metadata
  ) values (
    v_ticket.organization_id,v_ticket.tenant_id,v_ticket.id,new.author_profile_id,
    'requester_replied','waiting','offered','Original requester supplied the requested clarification',
    jsonb_build_object('message_id',new.id,'resumed_owner',v_ticket.assigned_profile_id)
  );

  insert into public.notification_events(
    organization_id,recipient_profile_id,event_type,title,body,target_path
  ) values (
    v_ticket.organization_id,v_ticket.assigned_profile_id,'ticket.requester_replied',
    'Requester replied — mission resumed',
    'The original requester has supplied the requested information. Review the updated conversation and continue the mission.',
    '/mission-control?ticket='||v_ticket.id::text
  );

  perform public.intellisync_emit_event(
    v_ticket.organization_id,v_ticket.tenant_id,new.author_profile_id,
    'ticket.updated','ticket',v_ticket.id::text,
    'requester-replied:'||new.id::text,'confidential',
    jsonb_build_object(
      'dispatch_event','mission.requester_replied',
      'ticket_id',v_ticket.id,
      'message_id',new.id,
      'resumed_owner',v_ticket.assigned_profile_id
    ),
    null,null,now()
  );

  return new;
end;
$function$;

create trigger ticket_dispatch_resume_after_requester_reply
after insert on public.ticket_conversation_messages
for each row execute function public.dispatch_resume_after_requester_reply();

revoke all on function public.dispatch_resume_after_requester_reply() from public,anon,authenticated;

do $do$
declare v_table text;
begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') then
    foreach v_table in array array[
      'public.notification_events',
      'public.ticket_offers',
      'public.tickets',
      'public.ticket_conversation_messages',
      'public.ticket_lifecycle_events'
    ] loop
      if not exists(
        select 1 from pg_publication_tables
        where pubname='supabase_realtime'
          and schemaname=split_part(v_table,'.',1)
          and tablename=split_part(v_table,'.',2)
      ) then
        execute format('alter publication supabase_realtime add table %s',v_table);
      end if;
    end loop;
  end if;
end
$do$;
