-- Initial policies for the first authenticated HelpBuddy path.
-- This is deliberately scoped and does not blanket-enable access across the schema.
grant select on public.profiles, public.profile_roles, public.roles to authenticated;
drop policy if exists profiles_read_self on public.profiles;
create policy profiles_read_self on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists profile_roles_read_self on public.profile_roles;
create policy profile_roles_read_self on public.profile_roles for select to authenticated using (profile_id = (select auth.uid()));
drop policy if exists roles_read_assigned on public.roles;
create policy roles_read_assigned on public.roles for select to authenticated using (
  exists (select 1 from public.profile_roles pr where pr.role_id = roles.id and pr.profile_id = (select auth.uid()) and pr.is_active = true and (pr.expires_at is null or pr.expires_at > now()))
);

grant select, insert, update on public.tickets to authenticated;
drop policy if exists tickets_read_scope on public.tickets;
create policy tickets_read_scope on public.tickets for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.organization_id = tickets.organization_id and (tickets.tenant_id is null or p.tenant_id = tickets.tenant_id))
);
drop policy if exists tickets_insert_requester on public.tickets;
create policy tickets_insert_requester on public.tickets for insert to authenticated with check (
  requester_profile_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.organization_id = tickets.organization_id and (tickets.tenant_id is null or p.tenant_id = tickets.tenant_id))
);
drop policy if exists tickets_update_requester_or_assignee on public.tickets;
create policy tickets_update_requester_or_assignee on public.tickets for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.organization_id = tickets.organization_id and (tickets.tenant_id is null or p.tenant_id = tickets.tenant_id) and (tickets.requester_profile_id = p.id or tickets.assigned_profile_id = p.id))
) with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.organization_id = tickets.organization_id and (tickets.tenant_id is null or p.tenant_id = tickets.tenant_id) and (tickets.requester_profile_id = p.id or tickets.assigned_profile_id = p.id))
);

grant select, insert, update on public.ticket_steps to authenticated;
drop policy if exists ticket_steps_read_ticket_scope on public.ticket_steps;
create policy ticket_steps_read_ticket_scope on public.ticket_steps for select to authenticated using (
  exists (select 1 from public.tickets t join public.profiles p on p.id = (select auth.uid()) where t.id = ticket_steps.ticket_id and t.organization_id = p.organization_id and (t.tenant_id is null or p.tenant_id = t.tenant_id))
);
drop policy if exists ticket_steps_update_assignee on public.ticket_steps;
create policy ticket_steps_update_assignee on public.ticket_steps for update to authenticated using (
  exists (select 1 from public.tickets t join public.profiles p on p.id = (select auth.uid()) where t.id = ticket_steps.ticket_id and t.assigned_profile_id = p.id and t.organization_id = p.organization_id and (t.tenant_id is null or p.tenant_id = t.tenant_id))
) with check (
  exists (select 1 from public.tickets t join public.profiles p on p.id = (select auth.uid()) where t.id = ticket_steps.ticket_id and t.assigned_profile_id = p.id and t.organization_id = p.organization_id and (t.tenant_id is null or p.tenant_id = t.tenant_id))
);

grant select, insert on public.audit_events to authenticated;
drop policy if exists audit_events_read_scope on public.audit_events;
create policy audit_events_read_scope on public.audit_events for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.organization_id = audit_events.organization_id and (audit_events.tenant_id is null or p.tenant_id = audit_events.tenant_id))
);
drop policy if exists audit_events_insert_self on public.audit_events;
create policy audit_events_insert_self on public.audit_events for insert to authenticated with check (
  actor_auth_user_id = (select auth.uid()) and actor_profile_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.organization_id = audit_events.organization_id and (audit_events.tenant_id is null or p.tenant_id = audit_events.tenant_id))
);
