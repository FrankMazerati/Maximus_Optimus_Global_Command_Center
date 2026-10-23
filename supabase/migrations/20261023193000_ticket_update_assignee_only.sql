drop policy if exists tickets_update_requester_or_assignee on public.tickets;
create policy tickets_update_assignee_only on public.tickets for update to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.organization_id = tickets.organization_id and (tickets.tenant_id is null or p.tenant_id = tickets.tenant_id) and tickets.assigned_profile_id = p.id))
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.organization_id = tickets.organization_id and (tickets.tenant_id is null or p.tenant_id = tickets.tenant_id) and tickets.assigned_profile_id = p.id));
