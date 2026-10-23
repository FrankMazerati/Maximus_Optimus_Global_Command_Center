grant select, insert, update on public.workflows to authenticated;
drop policy if exists workflows_read_scope on public.workflows;
create policy workflows_read_scope on public.workflows for select to authenticated using (
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=workflows.organization_id and (workflows.tenant_id is null or p.tenant_id=workflows.tenant_id))
);
drop policy if exists workflows_insert_scope on public.workflows;
create policy workflows_insert_scope on public.workflows for insert to authenticated with check (
 created_by=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=workflows.organization_id and (workflows.tenant_id is null or p.tenant_id=workflows.tenant_id))
);
grant select, insert, update on public.workflow_runs to authenticated;
drop policy if exists workflow_runs_read_scope on public.workflow_runs;
create policy workflow_runs_read_scope on public.workflow_runs for select to authenticated using (
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=workflow_runs.organization_id and (workflow_runs.tenant_id is null or p.tenant_id=workflow_runs.tenant_id))
);
drop policy if exists workflow_runs_insert_scope on public.workflow_runs;
create policy workflow_runs_insert_scope on public.workflow_runs for insert to authenticated with check (
 started_by=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=workflow_runs.organization_id and (workflow_runs.tenant_id is null or p.tenant_id=workflow_runs.tenant_id))
);
