-- Synthetic dataset for a disposable/test environment only.
-- Do not run against production. This seed creates one clearly labelled demo org,
-- one tenant, sample devices, 25 tickets, and two workflow definitions.
-- Requires the ticket-number sequence migration first. No real people or credentials.

insert into public.organizations (name, legal_name, organization_type, slug, status, settings)
values ('DEMO — IntelliStack Systems Lab', 'DEMO — IntelliStack Systems Lab', 'demo', 'demo-intellistack-lab', 'active', '{"synthetic":true,"environment":"demo"}'::jsonb)
on conflict (slug) do update set name=excluded.name, legal_name=excluded.legal_name, settings=excluded.settings;

insert into public.tenants (organization_id, name, slug, status, settings)
select o.id, 'DEMO Tenant Alpha', 'demo-tenant-alpha', 'active', '{"synthetic":true}'::jsonb
from public.organizations o where o.slug='demo-intellistack-lab'
on conflict (slug) do update set name=excluded.name, organization_id=excluded.organization_id, settings=excluded.settings;

insert into public.devices (id, organization_id, tenant_id, device_name, device_type, manufacturer, model, operating_system, os_version, management_source, inventory)
select ('10000000-0000-4000-8000-' || lpad(to_hex(n),12,'0'))::uuid, o.id, t.id,
       'DEMO-ENDPOINT-' || lpad(n::text,3,'0'), 'endpoint',
       case when n % 2 = 0 then 'Microsoft' else 'Dell' end,
       case when n % 2 = 0 then 'Virtual Workstation' else 'Latitude Demo' end,
       case when n % 2 = 0 then 'Windows' else 'Linux' end,
       case when n % 2 = 0 then '11 Demo' else 'LTS Demo' end,
       'synthetic-seed', jsonb_build_object('synthetic',true,'seed_batch','command-center-v1')
from generate_series(1,12) as n
cross join public.organizations o
join public.tenants t on t.organization_id=o.id
where o.slug='demo-intellistack-lab' and t.slug='demo-tenant-alpha'
on conflict (id) do update set device_name=excluded.device_name, inventory=excluded.inventory;

insert into public.tickets (id, organization_id, tenant_id, title, description, category, priority, status, source, current_step, total_steps)
select ('20000000-0000-4000-8000-' || lpad(to_hex(n),12,'0'))::uuid, o.id, t.id,
       case n % 5
         when 0 then 'DEMO — VPN connectivity failure #' || n
         when 1 then 'DEMO — Account access request #' || n
         when 2 then 'DEMO — Endpoint health review #' || n
         when 3 then 'DEMO — Network performance investigation #' || n
         else 'DEMO — Service request #' || n
       end,
       'Synthetic training record. No real user or production system is involved. Seed batch: command-center-v1.',
       case n % 5 when 0 then 'Network' when 1 then 'Identity' when 2 then 'Endpoint' when 3 then 'Network' else 'Service Request' end,
       case n % 4 when 0 then 'critical' when 1 then 'high' when 2 then 'medium' else 'low' end::public.ticket_priority,
       case n % 4 when 0 then 'new' when 1 then 'in_progress' when 2 then 'waiting' else 'offered' end::public.ticket_status,
       'synthetic-seed', 1, 5
from generate_series(1,25) as n
cross join public.organizations o
join public.tenants t on t.organization_id=o.id
where o.slug='demo-intellistack-lab' and t.slug='demo-tenant-alpha'
on conflict (id) do update set title=excluded.title, description=excluded.description, category=excluded.category, priority=excluded.priority, status=excluded.status;

insert into public.workflows (id, organization_id, tenant_id, workflow_key, name, description, status, version, definition)
select '30000000-0000-4000-8000-000000000001'::uuid, o.id, t.id,
       'demo_vpn_failure', 'DEMO — VPN connectivity remediation',
       'Synthetic workflow definition for validation only.', 'active', 1,
       '{"synthetic":true,"steps":["Confirm requester and device","Check approved service status","Run non-destructive diagnostics","Request approval for privileged changes","Verify and document resolution"]}'::jsonb
from public.organizations o join public.tenants t on t.organization_id=o.id
where o.slug='demo-intellistack-lab' and t.slug='demo-tenant-alpha'
on conflict (id) do update set definition=excluded.definition, status=excluded.status, version=excluded.version;

insert into public.workflows (id, organization_id, tenant_id, workflow_key, name, description, status, version, definition)
select '30000000-0000-4000-8000-000000000002'::uuid, o.id, t.id,
       'demo_account_access', 'DEMO — Account access request',
       'Synthetic workflow definition for validation only.', 'active', 1,
       '{"synthetic":true,"steps":["Verify requester identity","Confirm least-privilege scope","Obtain required approval","Apply authorized access","Verify and audit"]}'::jsonb
from public.organizations o join public.tenants t on t.organization_id=o.id
where o.slug='demo-intellistack-lab' and t.slug='demo-tenant-alpha'
on conflict (id) do update set definition=excluded.definition, status=excluded.status, version=excluded.version;
