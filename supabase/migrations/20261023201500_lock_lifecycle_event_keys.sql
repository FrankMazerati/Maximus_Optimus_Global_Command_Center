-- Tighten lifecycle event writes so requesters cannot self-approve sensitive actions.
drop policy if exists ticket_lifecycle_insert_authorized on public.ticket_lifecycle_events;
create policy ticket_lifecycle_insert_authorized on public.ticket_lifecycle_events for insert to authenticated
with check (
 actor_profile_id=(select auth.uid()) and exists(
  select 1 from public.profiles p join public.tickets t on t.id=ticket_lifecycle_events.ticket_id
  where p.id=(select auth.uid()) and p.organization_id=ticket_lifecycle_events.organization_id
    and p.organization_id=t.organization_id
    and (ticket_lifecycle_events.tenant_id is null or p.tenant_id=ticket_lifecycle_events.tenant_id)
    and (t.tenant_id is null or p.tenant_id=t.tenant_id)
    and (
      (ticket_lifecycle_events.event_key in ('created','commented') and (t.requester_profile_id=p.id or t.assigned_profile_id=p.id or exists(
        select 1 from public.profile_roles pr join public.roles r on r.id=pr.role_id where pr.profile_id=p.id and pr.is_active and (pr.expires_at is null or pr.expires_at>now()) and r.role_key in ('super_admin','global_admin','organization_admin','service_desk_manager','it_manager','technician')
      )))
      or
      (ticket_lifecycle_events.event_key in ('triaged','assigned','in_progress','waiting','resolved','reopened','closed','escalated') and (t.assigned_profile_id=p.id or exists(
        select 1 from public.profile_roles pr join public.roles r on r.id=pr.role_id where pr.profile_id=p.id and pr.is_active and (pr.expires_at is null or pr.expires_at>now()) and r.role_key in ('super_admin','global_admin','organization_admin','service_desk_manager','it_manager','technician')
      )))
      or
      (ticket_lifecycle_events.event_key in ('approval_granted','approval_denied') and exists(
        select 1 from public.profile_roles pr join public.roles r on r.id=pr.role_id where pr.profile_id=p.id and pr.is_active and (pr.expires_at is null or pr.expires_at>now()) and r.role_key in ('super_admin','global_admin','organization_admin','service_desk_manager','it_manager')
      ))
      or
      (ticket_lifecycle_events.event_key='approval_requested' and t.requester_profile_id=p.id)
    )
 ));
