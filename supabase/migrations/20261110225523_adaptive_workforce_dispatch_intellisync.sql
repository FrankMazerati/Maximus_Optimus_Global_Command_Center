-- Maximus Adaptive Workforce Intelligence + IntelliSync event integration
-- Existing public tickets, offers, workforce, notifications and IntelliSync records remain authoritative.

create schema if not exists dispatch;
revoke all on schema dispatch from public, anon, authenticated;
grant usage on schema dispatch to service_role;

create table if not exists dispatch.workforce_links (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  workforce_person_id uuid not null unique references public.workforce_people(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  experience_months integer not null default 0 check (experience_months >= 0),
  dispatch_level text not null default 'L1' check (dispatch_level in ('L1','L2','L3','lead','manager')),
  linked_by uuid references public.profiles(id) on delete set null,
  linked_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dispatch.presence (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  availability_status text not null default 'offline'
    check (availability_status in ('available','busy','in_meeting','away','offline')),
  availability_mode text not null default 'automatic'
    check (availability_mode in ('automatic','manual')),
  current_activity text,
  current_context_key text,
  context_switches_30m integer not null default 0 check (context_switches_30m >= 0),
  estimated_remaining_minutes integer check (estimated_remaining_minutes is null or estimated_remaining_minutes >= 0),
  last_activity_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dispatch.profile_skills (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  proficiency smallint not null default 1 check (proficiency between 1 and 5),
  verified_at timestamptz,
  last_used_at timestamptz,
  primary key (profile_id, skill_id)
);

create table if not exists dispatch.ticket_skill_requirements (
  ticket_id uuid primary key references public.tickets(id) on delete cascade,
  required_skill_keys text[] not null default '{}',
  complexity smallint not null default 2 check (complexity between 1 and 5),
  location_required boolean not null default false,
  required_location text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists dispatch.decisions (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  actor_profile_id uuid not null references public.profiles(id),
  engine_version text not null default 'adaptive-context-v1',
  outcome text not null check (outcome in ('offered','no_eligible_candidates','already_assigned','already_offered')),
  context_snapshot jsonb not null default '{}',
  dynamic_weights jsonb not null default '{}',
  explanation text not null,
  created_at timestamptz not null default now()
);

create table if not exists dispatch.candidate_evaluations (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references dispatch.decisions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  eligible boolean not null,
  rank integer,
  fit_score numeric(7,3),
  factors jsonb not null default '{}',
  explanation text not null,
  created_at timestamptz not null default now(),
  unique (decision_id, profile_id)
);

create index if not exists dispatch_presence_org_availability_idx
  on dispatch.presence (organization_id, tenant_id, availability_status, last_activity_at desc);
create index if not exists dispatch_decisions_ticket_created_idx
  on dispatch.decisions (ticket_id, created_at desc);
create index if not exists dispatch_candidate_evaluations_profile_created_idx
  on dispatch.candidate_evaluations (profile_id, created_at desc);
create index if not exists ticket_offers_open_recipient_idx
  on public.ticket_offers (offered_to_profile_id, offered_at desc)
  where offer_status = 'offered';

alter table dispatch.workforce_links enable row level security;
alter table dispatch.presence enable row level security;
alter table dispatch.profile_skills enable row level security;
alter table dispatch.ticket_skill_requirements enable row level security;
alter table dispatch.decisions enable row level security;
alter table dispatch.candidate_evaluations enable row level security;

revoke all on all tables in schema dispatch from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema dispatch to service_role;
alter default privileges in schema dispatch revoke all on tables from public, anon, authenticated;
alter default privileges in schema dispatch grant select, insert, update, delete on tables to service_role;

alter table public.ticket_lifecycle_events
  drop constraint if exists ticket_lifecycle_events_event_key_check;
alter table public.ticket_lifecycle_events
  add constraint ticket_lifecycle_events_event_key_check check (
    event_key = any (array[
      'created','triaged','assigned','dispatch_offered','offer_declined',
      'requester_information_requested','in_progress','waiting',
      'approval_requested','approval_granted','approval_denied',
      'escalated','resolved','reopened','closed','commented'
    ]::text[])
  );

CREATE OR REPLACE FUNCTION public.dispatch_link_workforce_profile(p_profile_id uuid, p_workforce_person_id uuid, p_organization_id uuid, p_tenant_id uuid, p_experience_months integer, p_dispatch_level text, p_linked_by uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'dispatch', 'public', 'pg_temp'
AS $function$
begin
  if p_experience_months < 0 or p_experience_months > 720
    or p_dispatch_level not in ('L1','L2','L3','lead','manager') then
    raise exception 'Invalid workforce link values' using errcode='22023';
  end if;
  if not exists(select 1 from public.profiles p join public.workforce_people w
    on w.id=p_workforce_person_id and w.organization_id=p.organization_id and w.tenant_id=p.tenant_id
    where p.id=p_profile_id and p.organization_id=p_organization_id and p.tenant_id=p_tenant_id) then
    raise exception 'Profile and workforce record must share organization and tenant' using errcode='42501';
  end if;
  insert into dispatch.workforce_links(
    profile_id,workforce_person_id,organization_id,tenant_id,experience_months,dispatch_level,linked_by,updated_at
  ) values (
    p_profile_id,p_workforce_person_id,p_organization_id,p_tenant_id,p_experience_months,p_dispatch_level,p_linked_by,now()
  ) on conflict(profile_id) do update set
    workforce_person_id=excluded.workforce_person_id,
    organization_id=excluded.organization_id,
    tenant_id=excluded.tenant_id,
    experience_months=excluded.experience_months,
    dispatch_level=excluded.dispatch_level,
    linked_by=excluded.linked_by,
    linked_at=now(),updated_at=now();
  return jsonb_build_object('success',true,'profile_id',p_profile_id,'workforce_person_id',p_workforce_person_id);
end $function$


CREATE OR REPLACE FUNCTION public.dispatch_offer_ticket(p_ticket_id uuid, p_actor_profile_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'dispatch', 'pg_temp'
AS $function$
declare
  v_ticket public.tickets%rowtype;
  v_actor public.profiles%rowtype;
  v_decision_id uuid;
  v_priority_pressure numeric;
  v_required_skills text[] := '{}';
  v_complexity integer := 2;
  v_candidate_count integer := 0;
  v_offer_count integer := 0;
  v_candidates jsonb := '[]'::jsonb;
  v_dynamic_weights jsonb;
begin
  select * into v_actor
  from public.profiles
  where id = p_actor_profile_id and member_status = 'active';

  if not found or v_actor.organization_id is null then
    raise exception 'Active actor profile required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profile_roles pr
    join public.roles r on r.id = pr.role_id
    where pr.profile_id = p_actor_profile_id
      and pr.is_active
      and (pr.starts_at is null or pr.starts_at <= now())
      and (pr.expires_at is null or pr.expires_at > now())
      and r.role_key = any(array[
        'super_admin','global_admin','organization_admin','service_desk_manager',
        'help_desk_supervisor','it_manager','help_desk_l1','help_desk_l2','help_desk_l3'
      ])
  ) then
    raise exception 'Actor is not authorized to dispatch help desk work' using errcode = '42501';
  end if;

  select * into v_ticket
  from public.tickets
  where id = p_ticket_id
    and organization_id = v_actor.organization_id
    and (tenant_id is null or tenant_id = v_actor.tenant_id)
  for update;

  if not found then
    raise exception 'Ticket not found in actor scope' using errcode = 'P0002';
  end if;

  if v_ticket.assigned_profile_id is not null
     or v_ticket.status not in ('new','offered') then
    insert into dispatch.decisions (
      ticket_id, organization_id, tenant_id, actor_profile_id, outcome,
      context_snapshot, explanation
    ) values (
      v_ticket.id, v_ticket.organization_id, v_ticket.tenant_id, p_actor_profile_id,
      'already_assigned',
      jsonb_build_object('status', v_ticket.status, 'assigned_profile_id', v_ticket.assigned_profile_id),
      'No offer was created because the ticket is already assigned or is outside the dispatchable lifecycle.'
    ) returning id into v_decision_id;

    return jsonb_build_object('outcome','already_assigned','decision_id',v_decision_id,'offers',0);
  end if;

  if exists (select 1 from public.ticket_offers o where o.ticket_id = p_ticket_id and o.offer_status = 'offered') then
    insert into dispatch.decisions (
      ticket_id, organization_id, tenant_id, actor_profile_id, outcome,
      context_snapshot, explanation
    ) values (
      v_ticket.id, v_ticket.organization_id, v_ticket.tenant_id, p_actor_profile_id,
      'already_offered',
      jsonb_build_object('status', v_ticket.status),
      'An active offer already exists; duplicate dispatch was suppressed.'
    ) returning id into v_decision_id;

    return jsonb_build_object('outcome','already_offered','decision_id',v_decision_id,'offers',0);
  end if;

  select coalesce(required_skill_keys, '{}'), complexity
    into v_required_skills, v_complexity
  from dispatch.ticket_skill_requirements
  where ticket_id = p_ticket_id;

  if v_required_skills is null then v_required_skills := '{}'; end if;
  if v_complexity is null then v_complexity := 2; end if;

  v_priority_pressure := case v_ticket.priority::text
    when 'critical' then 1.00
    when 'high' then 0.78
    when 'medium' then 0.48
    else 0.25
  end;

  /*
   * The engine derives the current weighting profile from this ticket's urgency,
   * skill scarcity, candidate workload distribution and live context-switching.
   * There is no administrator-managed fixed ranking-weight table.
   */
  with eligible as (
    select
      p.id as profile_id,
      p.organization_id,
      p.tenant_id,
      coalesce(wl.experience_months,0) as experience_months,
      coalesce(wl.dispatch_level,'L1') as dispatch_level,
      pr.availability_status,
      pr.current_activity,
      pr.current_context_key,
      pr.context_switches_30m,
      pr.last_activity_at,
      coalesce(loads.active_count,0) as active_count,
      coalesce(skill.skill_ratio, case when cardinality(v_required_skills)=0 then 0.70 else 0 end) as skill_ratio,
      coalesce(skill.skill_average,0) as skill_average,
      coalesce(skill.skill_coverage,0) as skill_coverage
    from public.profiles p
    join dispatch.workforce_links wl on wl.profile_id = p.id
    join dispatch.presence pr on pr.profile_id = p.id
      and pr.availability_status = 'available'
      and pr.last_activity_at >= now() - interval '10 minutes'
    join public.profile_roles roles on roles.profile_id = p.id
      and roles.is_active
      and (roles.starts_at is null or roles.starts_at <= now())
      and (roles.expires_at is null or roles.expires_at > now())
    join public.roles role_catalog on role_catalog.id = roles.role_id
      and role_catalog.role_key = any(array['help_desk_l1','help_desk_l2','help_desk_l3','service_desk_analyst','technician'])
    left join lateral (
      select count(*)::integer as active_count
      from public.tickets t
      where t.assigned_profile_id = p.id
        and t.status in ('accepted','in_progress','waiting','escalated')
    ) loads on true
    left join lateral (
      select
        count(*) filter (where s.skill_key = any(v_required_skills))::integer as skill_coverage,
        case when cardinality(v_required_skills)=0 then 0.70
          else count(*) filter (where s.skill_key = any(v_required_skills))::numeric / cardinality(v_required_skills) end as skill_ratio,
        coalesce(avg(ps.proficiency) filter (where s.skill_key = any(v_required_skills)),0)::numeric as skill_average
      from dispatch.profile_skills ps
      join public.skills s on s.id = ps.skill_id
      where ps.profile_id = p.id
    ) skill on true
    where p.member_status = 'active'
      and p.organization_id = v_ticket.organization_id
      and (v_ticket.tenant_id is null or p.tenant_id = v_ticket.tenant_id)
      and wl.organization_id = v_ticket.organization_id
      and (v_ticket.tenant_id is null or wl.tenant_id = v_ticket.tenant_id)
      and (cardinality(v_required_skills)=0 or coalesce(skill.skill_coverage,0)=cardinality(v_required_skills))
    group by p.id, p.organization_id, p.tenant_id, wl.experience_months, wl.dispatch_level,
      pr.availability_status, pr.current_activity, pr.current_context_key,
      pr.context_switches_30m, pr.last_activity_at, loads.active_count,
      skill.skill_ratio, skill.skill_average, skill.skill_coverage
  ),
  population as (
    select
      count(*)::numeric as n,
      coalesce(avg(active_count),0)::numeric as avg_load,
      coalesce(avg(context_switches_30m),0)::numeric as avg_switches,
      coalesce(avg(skill_ratio),0)::numeric as avg_skill_fit
    from eligible
  ),
  scored as (
    select
      e.*,
      (0.28 + v_priority_pressure * 0.22 + (1 - least(p.avg_skill_fit,1)) * 0.18) as skill_weight,
      (0.22 + least(e.active_count::numeric / greatest(p.avg_load + 1,1),1) * 0.25 + least(p.avg_switches / 10,0.15)) as load_weight,
      (0.12 + v_priority_pressure * 0.18 + least(v_complexity::numeric / 5,0.15)) as experience_weight,
      (0.10 + greatest(0,1 - extract(epoch from (now()-e.last_activity_at))/600) * 0.12) as freshness_weight,
      (1 / (1 + e.active_count::numeric)) as load_fit,
      (1 / (1 + e.context_switches_30m::numeric / 3)) as context_fit,
      least(e.experience_months::numeric / greatest(v_complexity * 12,12),1) as experience_fit,
      greatest(0,1 - extract(epoch from (now()-e.last_activity_at))/600) as freshness_fit,
      (case when cardinality(v_required_skills)=0 then 0.70 else e.skill_ratio * least(e.skill_average / 5,1) end) as effective_skill_fit
    from eligible e cross join population p
  ),
  weighted as (
    select s.*,
      (
        s.effective_skill_fit * s.skill_weight
        + s.load_fit * s.load_weight
        + s.experience_fit * s.experience_weight
        + s.freshness_fit * s.freshness_weight
        + s.context_fit * (0.08 + least(s.context_switches_30m::numeric / 10,0.20))
      ) / nullif(
        s.skill_weight + s.load_weight + s.experience_weight + s.freshness_weight
        + (0.08 + least(s.context_switches_30m::numeric / 10,0.20)),0
      ) * 100 as fit_score
    from scored s
  )
  select
    count(*)::integer,
    jsonb_agg(jsonb_build_object(
      'profile_id',profile_id,
      'fit_score',round(fit_score,3),
      'active_count',active_count,
      'context_switches_30m',context_switches_30m,
      'skill_ratio',round(effective_skill_fit,3),
      'experience_months',experience_months,
      'dispatch_level',dispatch_level,
      'weights',jsonb_build_object(
        'skill',round(skill_weight,3),'workload',round(load_weight,3),
        'experience',round(experience_weight,3),'freshness',round(freshness_weight,3)
      ),
      'factors',jsonb_build_object(
        'current_activity',current_activity,
        'current_context_key',current_context_key,
        'last_activity_at',last_activity_at,
        'load_fit',round(load_fit,3),
        'context_fit',round(context_fit,3),
        'experience_fit',round(experience_fit,3),
        'freshness_fit',round(freshness_fit,3),
        'skill_coverage',skill_coverage,
        'required_skill_count',cardinality(v_required_skills)
      )
    ) order by fit_score desc, active_count asc, last_activity_at desc)
  into v_candidate_count, v_candidates
  from weighted;

  v_dynamic_weights := jsonb_build_object(
    'priority_pressure',v_priority_pressure,
    'ticket_complexity',v_complexity,
    'required_skill_keys',to_jsonb(v_required_skills),
    'derived_from','live ticket context + current eligible workforce distribution',
    'fixed_admin_weights',false
  );

  insert into dispatch.decisions (
    ticket_id, organization_id, tenant_id, actor_profile_id, outcome,
    context_snapshot, dynamic_weights, explanation
  ) values (
    v_ticket.id, v_ticket.organization_id, v_ticket.tenant_id, p_actor_profile_id,
    case when coalesce(v_candidate_count,0)=0 then 'no_eligible_candidates' else 'offered' end,
    jsonb_build_object(
      'priority',v_ticket.priority::text,'status',v_ticket.status::text,
      'evaluated_at',now(),'candidate_count',coalesce(v_candidate_count,0),
      'availability_rule','explicit available presence; online alone is not sufficient'
    ),
    v_dynamic_weights,
    case when coalesce(v_candidate_count,0)=0
      then 'No linked, active, explicitly available support profiles with fresh presence and valid skill/role records were found. No assignment was fabricated.'
      else 'Candidates were ranked using ticket urgency and current workforce context. Two offers are created at most; acceptance remains a separate action.'
    end
  ) returning id into v_decision_id;

  insert into dispatch.candidate_evaluations (
    decision_id, profile_id, eligible, rank, fit_score, factors, explanation
  )
  select
    v_decision_id,
    (c->>'profile_id')::uuid,
    true,
    ordinality::integer,
    (c->>'fit_score')::numeric,
    c,
    'Eligible at evaluation time; rank reflects current workload, context switching, skill fit, experience and presence freshness.'
  from jsonb_array_elements(coalesce(v_candidates,'[]'::jsonb)) with ordinality as x(c,ordinality);

  if coalesce(v_candidate_count,0)=0 then
    return jsonb_build_object(
      'outcome','no_eligible_candidates',
      'decision_id',v_decision_id,
      'offers',0,
      'explanation','No eligible linked workforce profiles with current availability were found. Link real authenticated workforce profiles and record their live availability before dispatch.'
    );
  end if;

  with top_candidates as (
    select
      (c->>'profile_id')::uuid as profile_id,
      (c->>'fit_score')::numeric as fit_score,
      ordinality::integer as rank
    from jsonb_array_elements(v_candidates) with ordinality as x(c,ordinality)
    where ordinality <= 2
  ),
  inserted as (
    insert into public.ticket_offers(ticket_id,offered_to_profile_id,offer_status)
    select p_ticket_id, profile_id, 'offered'
    from top_candidates
    returning offered_to_profile_id
  )
  select count(*)::integer into v_offer_count from inserted;

  update public.tickets
  set status = 'offered', updated_at = now()
  where id = p_ticket_id and assigned_profile_id is null and status in ('new','offered');

  insert into public.ticket_lifecycle_events (
    organization_id,tenant_id,ticket_id,actor_profile_id,event_key,from_status,to_status,reason,metadata
  ) values (
    v_ticket.organization_id,v_ticket.tenant_id,v_ticket.id,p_actor_profile_id,
    'dispatch_offered',v_ticket.status::text,'offered',
    'Adaptive dispatch created candidate offers',
    jsonb_build_object('decision_id',v_decision_id,'offer_count',v_offer_count,'engine_version','adaptive-context-v1')
  );

  insert into public.notification_events(organization_id,recipient_profile_id,event_type,title,body,target_path)
  select
    v_ticket.organization_id,
    (c->>'profile_id')::uuid,
    'mission.offer',
    'New mission available',
    format('Ticket #%s: %s. Review the mission and accept, decline, or request more information.',v_ticket.ticket_number,v_ticket.title),
    '/mission-control?ticket='||v_ticket.id::text
  from jsonb_array_elements(v_candidates) with ordinality as x(c,ordinality)
  where ordinality <= 2;

  perform public.intellisync_emit_event(
    v_ticket.organization_id,
    v_ticket.tenant_id,
    p_actor_profile_id,
    'ticket.updated',
    'ticket',
    v_ticket.id::text,
    'adaptive-dispatch:'||v_decision_id::text,
    'confidential',
    jsonb_build_object(
      'dispatch_event','mission.offers_created',
      'decision_id',v_decision_id,
      'offer_count',v_offer_count,
      'engine_version','adaptive-context-v1'
    ),
    v_decision_id,
    null,
    now()
  );

  return jsonb_build_object(
    'outcome','offered',
    'decision_id',v_decision_id,
    'offers',v_offer_count,
    'candidates',v_candidates,
    'explanation','Offers were sent to the top two eligible candidates. No work ownership changes until a recipient accepts.'
  );
end;
$function$


CREATE OR REPLACE FUNCTION public.dispatch_respond_to_offer(p_offer_id uuid, p_actor_profile_id uuid, p_response text, p_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'dispatch', 'pg_temp'
AS $function$
declare
  v_offer public.ticket_offers%rowtype;
  v_ticket public.tickets%rowtype;
  v_actor public.profiles%rowtype;
  v_other_count integer;
  v_event_id uuid;
begin
  if p_response not in ('accept','decline','request_info') then
    raise exception 'Response must be accept, decline, or request_info' using errcode='22023';
  end if;
  if p_response='request_info' and length(trim(coalesce(p_note,''))) < 4 then
    raise exception 'A requester-facing clarification message is required' using errcode='22023';
  end if;

  select * into v_actor from public.profiles
  where id=p_actor_profile_id and member_status='active';
  if not found then raise exception 'Active actor profile required' using errcode='42501'; end if;

  select * into v_offer from public.ticket_offers
  where id=p_offer_id and offered_to_profile_id=p_actor_profile_id and offer_status='offered'
  for update;
  if not found then raise exception 'Offer is no longer available to this profile' using errcode='40001'; end if;

  select * into v_ticket from public.tickets where id=v_offer.ticket_id for update;
  if not found or v_ticket.organization_id<>v_actor.organization_id
    or (v_ticket.tenant_id is not null and v_ticket.tenant_id<>v_actor.tenant_id) then
    raise exception 'Ticket is outside actor scope' using errcode='42501';
  end if;

  if p_response='accept' then
    if v_ticket.assigned_profile_id is not null then
      raise exception 'Another worker already owns this mission' using errcode='40001';
    end if;
    update public.tickets set assigned_profile_id=p_actor_profile_id,status='accepted',updated_at=now()
    where id=v_ticket.id;
    update public.ticket_offers set offer_status='accepted',responded_at=now(),response_note=null
    where id=p_offer_id;
    update public.ticket_offers set offer_status='superseded',responded_at=now()
    where ticket_id=v_ticket.id and id<>p_offer_id and offer_status='offered';
    insert into public.ticket_lifecycle_events(
      organization_id,tenant_id,ticket_id,actor_profile_id,event_key,from_status,to_status,reason,metadata
    ) values (
      v_ticket.organization_id,v_ticket.tenant_id,v_ticket.id,p_actor_profile_id,
      'assigned',v_ticket.status::text,'accepted','Mission accepted by the offered technician',
      jsonb_build_object('offer_id',p_offer_id,'acceptance_is_not_work_started',true)
    );
    insert into public.notification_events(organization_id,recipient_profile_id,event_type,title,body,target_path)
    select v_ticket.organization_id,offered_to_profile_id,'mission.offer_superseded',
      'Mission claimed by another technician','This mission was accepted by another eligible technician.',
      '/mission-control?ticket='||v_ticket.id::text
    from public.ticket_offers
    where ticket_id=v_ticket.id and offered_to_profile_id<>p_actor_profile_id;
  elsif p_response='decline' then
    update public.ticket_offers set offer_status='declined',responded_at=now(),response_note=left(coalesce(p_note,''),2000)
    where id=p_offer_id;
    select count(*) into v_other_count from public.ticket_offers
      where ticket_id=v_ticket.id and offer_status='offered';
    if v_other_count=0 and v_ticket.assigned_profile_id is null then
      update public.tickets set status='new',updated_at=now() where id=v_ticket.id;
    end if;
    insert into public.ticket_lifecycle_events(
      organization_id,tenant_id,ticket_id,actor_profile_id,event_key,from_status,to_status,reason,metadata
    ) values (
      v_ticket.organization_id,v_ticket.tenant_id,v_ticket.id,p_actor_profile_id,
      'offer_declined',v_ticket.status::text,v_ticket.status::text,
      coalesce(nullif(trim(p_note),''),'Offer declined'),jsonb_build_object('offer_id',p_offer_id)
    );
  else
    if v_ticket.requester_profile_id is null then
      raise exception 'This ticket has no requester profile for clarification' using errcode='22023';
    end if;
    if coalesce(v_ticket.tenant_id,v_actor.tenant_id) is null then
      raise exception 'A tenant scope is required for requester conversation' using errcode='22023';
    end if;
    update public.tickets
    set assigned_profile_id=p_actor_profile_id,status='waiting',waiting_on='requester',
        requester_wait_started_at=now(),updated_at=now()
    where id=v_ticket.id;
    update public.ticket_offers set offer_status='info_requested',responded_at=now(),response_note=left(p_note,2000)
    where id=p_offer_id;
    insert into public.ticket_conversation_messages(
      organization_id,tenant_id,ticket_id,author_profile_id,channel,body,visibility,recipient_profile_id
    ) values (
      v_ticket.organization_id,coalesce(v_ticket.tenant_id,v_actor.tenant_id),v_ticket.id,
      p_actor_profile_id,'customer',trim(p_note),'customer',v_ticket.requester_profile_id
    );
    insert into public.notification_events(organization_id,recipient_profile_id,event_type,title,body,target_path)
    values (
      v_ticket.organization_id,v_ticket.requester_profile_id,'ticket.requester_information_requested',
      'More information requested','Your support technician needs clarification: '||left(trim(p_note),500),
      '/help-buddy?ticket='||v_ticket.id::text
    );
    insert into public.ticket_lifecycle_events(
      organization_id,tenant_id,ticket_id,actor_profile_id,event_key,from_status,to_status,reason,metadata
    ) values (
      v_ticket.organization_id,v_ticket.tenant_id,v_ticket.id,p_actor_profile_id,
      'requester_information_requested',v_ticket.status::text,'waiting',
      'Technician requested clarification from the original requester',
      jsonb_build_object('offer_id',p_offer_id,'ownership_retained_by',p_actor_profile_id)
    );
  end if;

  perform public.intellisync_emit_event(
    v_ticket.organization_id,v_ticket.tenant_id,p_actor_profile_id,
    'ticket.updated','ticket',v_ticket.id::text,
    'dispatch-response:'||p_offer_id::text||':'||p_response,
    'confidential',
    jsonb_build_object('dispatch_event','mission.'||p_response,'offer_id',p_offer_id,'ticket_id',v_ticket.id),
    null,null,now()
  );

  return jsonb_build_object('success',true,'response',p_response,'ticket_id',v_ticket.id);
end;
$function$


CREATE OR REPLACE FUNCTION public.dispatch_set_profile_skills(p_profile_id uuid, p_organization_id uuid, p_tenant_id uuid, p_skill_keys text[], p_proficiency integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'dispatch', 'public', 'pg_temp'
AS $function$
declare v_count integer;
begin
  if p_proficiency < 1 or p_proficiency > 5 then raise exception 'Proficiency must be 1 to 5' using errcode='22023'; end if;
  if not exists(select 1 from public.profiles where id=p_profile_id and organization_id=p_organization_id and tenant_id=p_tenant_id) then
    raise exception 'Profile scope mismatch' using errcode='42501';
  end if;
  if exists(select 1 from unnest(coalesce(p_skill_keys,'{}')) k
    where not exists(select 1 from public.skills s where s.skill_key=k)) then
    raise exception 'Unknown skill key' using errcode='22023';
  end if;
  delete from dispatch.profile_skills where profile_id=p_profile_id;
  insert into dispatch.profile_skills(profile_id,skill_id,proficiency,verified_at)
  select p_profile_id,s.id,p_proficiency,now()
  from public.skills s where s.skill_key=any(coalesce(p_skill_keys,'{}'));
  get diagnostics v_count=row_count;
  return jsonb_build_object('success',true,'skills_saved',v_count);
end $function$


CREATE OR REPLACE FUNCTION public.dispatch_set_ticket_requirements(p_ticket_id uuid, p_organization_id uuid, p_tenant_id uuid, p_required_skill_keys text[], p_complexity integer, p_updated_by uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'dispatch', 'public', 'pg_temp'
AS $function$
begin
  if p_complexity < 1 or p_complexity > 5 then raise exception 'Complexity must be 1 to 5' using errcode='22023'; end if;
  if not exists(select 1 from public.tickets where id=p_ticket_id and organization_id=p_organization_id
    and (tenant_id is null or tenant_id=p_tenant_id)) then
    raise exception 'Ticket scope mismatch' using errcode='42501';
  end if;
  if exists(select 1 from unnest(coalesce(p_required_skill_keys,'{}')) k
    where not exists(select 1 from public.skills s where s.skill_key=k)) then
    raise exception 'Unknown required skill key' using errcode='22023';
  end if;
  insert into dispatch.ticket_skill_requirements(ticket_id,required_skill_keys,complexity,updated_by,updated_at)
  values(p_ticket_id,coalesce(p_required_skill_keys,'{}'),p_complexity,p_updated_by,now())
  on conflict(ticket_id) do update set
    required_skill_keys=excluded.required_skill_keys,complexity=excluded.complexity,
    updated_by=excluded.updated_by,updated_at=now();
  return jsonb_build_object('success',true,'required_skill_keys',to_jsonb(coalesce(p_required_skill_keys,'{}')));
end $function$


CREATE OR REPLACE FUNCTION public.dispatch_upsert_presence(p_profile_id uuid, p_organization_id uuid, p_tenant_id uuid, p_availability_status text, p_availability_mode text, p_current_activity text, p_current_context_key text, p_context_switches_30m integer, p_estimated_remaining_minutes integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'dispatch', 'public', 'pg_temp'
AS $function$
begin
  if p_availability_status not in ('available','busy','in_meeting','away','offline')
     or p_availability_mode not in ('automatic','manual')
     or p_context_switches_30m < 0 or p_context_switches_30m > 100
     or p_estimated_remaining_minutes < 0 then
    raise exception 'Invalid workforce presence payload' using errcode='22023';
  end if;
  if not exists(select 1 from public.profiles p where p.id=p_profile_id
    and p.organization_id=p_organization_id and p.tenant_id=p_tenant_id and p.member_status='active') then
    raise exception 'Presence profile scope mismatch' using errcode='42501';
  end if;
  insert into dispatch.presence(
    profile_id,organization_id,tenant_id,availability_status,availability_mode,
    current_activity,current_context_key,context_switches_30m,
    estimated_remaining_minutes,last_activity_at,updated_at
  ) values (
    p_profile_id,p_organization_id,p_tenant_id,p_availability_status,p_availability_mode,
    p_current_activity,p_current_context_key,p_context_switches_30m,
    p_estimated_remaining_minutes,now(),now()
  ) on conflict(profile_id) do update set
    availability_status=excluded.availability_status,
    availability_mode=excluded.availability_mode,
    current_activity=excluded.current_activity,
    current_context_key=excluded.current_context_key,
    context_switches_30m=excluded.context_switches_30m,
    estimated_remaining_minutes=excluded.estimated_remaining_minutes,
    last_activity_at=now(),updated_at=now();
  return jsonb_build_object('success',true,'availability_status',p_availability_status);
end $function$


revoke all on function public.dispatch_offer_ticket(uuid,uuid) from public, anon, authenticated;
revoke all on function public.dispatch_respond_to_offer(uuid,uuid,text,text) from public, anon, authenticated;
revoke all on function public.dispatch_upsert_presence(uuid,uuid,uuid,text,text,text,text,integer,integer) from public, anon, authenticated;
revoke all on function public.dispatch_link_workforce_profile(uuid,uuid,uuid,uuid,integer,text,uuid) from public, anon, authenticated;
revoke all on function public.dispatch_set_profile_skills(uuid,uuid,uuid,text[],integer) from public, anon, authenticated;
revoke all on function public.dispatch_set_ticket_requirements(uuid,uuid,uuid,text[],integer,uuid) from public, anon, authenticated;

grant execute on function public.dispatch_offer_ticket(uuid,uuid) to service_role;
grant execute on function public.dispatch_respond_to_offer(uuid,uuid,text,text) to service_role;
grant execute on function public.dispatch_upsert_presence(uuid,uuid,uuid,text,text,text,text,integer,integer) to service_role;
grant execute on function public.dispatch_link_workforce_profile(uuid,uuid,uuid,uuid,integer,text,uuid) to service_role;
grant execute on function public.dispatch_set_profile_skills(uuid,uuid,uuid,text[],integer) to service_role;
grant execute on function public.dispatch_set_ticket_requirements(uuid,uuid,uuid,text[],integer,uuid) to service_role;
