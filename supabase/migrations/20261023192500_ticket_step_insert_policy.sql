grant insert on public.ticket_steps to authenticated;
drop policy if exists ticket_steps_insert_ticket_scope on public.ticket_steps;
create policy ticket_steps_insert_ticket_scope on public.ticket_steps for insert to authenticated with check (
 exists(select 1 from public.tickets t join public.profiles p on p.id=(select auth.uid())
 where t.id=ticket_steps.ticket_id and t.organization_id=p.organization_id
 and (t.tenant_id is null or p.tenant_id=t.tenant_id)
 and (t.requester_profile_id=p.id or t.assigned_profile_id=p.id))
);
