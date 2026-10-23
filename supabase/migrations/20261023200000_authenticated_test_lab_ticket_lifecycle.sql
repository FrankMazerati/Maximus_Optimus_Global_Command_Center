-- Authenticated test lab: lifecycle, escalation, and acceptance-run ledgers.
-- Additive migration; no demo users or tickets are inserted.
create table if not exists public.ticket_lifecycle_events (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 tenant_id uuid references public.tenants(id) on delete cascade,
 ticket_id uuid not null references public.tickets(id) on delete cascade,
 actor_profile_id uuid references public.profiles(id) on delete set null,
 event_key text not null check (event_key in ('created','triaged','assigned','in_progress','waiting','approval_requested','approval_granted','approval_denied','escalated','resolved','reopened','closed','commented')),
 from_status text, to_status text, reason text, metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists ticket_lifecycle_events_ticket_created_idx on public.ticket_lifecycle_events(ticket_id,created_at desc);
create index if not exists ticket_lifecycle_events_scope_idx on public.ticket_lifecycle_events(organization_id,tenant_id,created_at desc);

create table if not exists public.ticket_escalations (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 tenant_id uuid references public.tenants(id) on delete cascade,
 ticket_id uuid not null references public.tickets(id) on delete cascade,
 level smallint not null default 1 check (level between 1 and 4),
 escalation_reason text not null,
 status text not null default 'open' check (status in ('open','acknowledged','resolved','cancelled')),
 escalated_by uuid references public.profiles(id) on delete set null,
 assigned_to uuid references public.profiles(id) on delete set null,
 due_at timestamptz, acknowledged_at timestamptz, resolved_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists ticket_escalations_open_due_idx on public.ticket_escalations(status,due_at) where status in ('open','acknowledged');
create index if not exists ticket_escalations_scope_idx on public.ticket_escalations(organization_id,tenant_id,created_at desc);

create table if not exists public.acceptance_test_runs (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid references public.organizations(id) on delete cascade,
 tenant_id uuid references public.tenants(id) on delete cascade,
 requested_by uuid references auth.users(id) on delete set null,
 suite_key text not null,
 status text not null default 'running' check (status in ('running','passed','failed','blocked')),
 checks jsonb not null default '[]'::jsonb, summary jsonb not null default '{}'::jsonb,
 started_at timestamptz not null default now(), completed_at timestamptz
);

alter table public.ticket_lifecycle_events enable row level security;
alter table public.ticket_escalations enable row level security;
alter table public.acceptance_test_runs enable row level security;
revoke all on public.ticket_lifecycle_events,public.ticket_escalations,public.acceptance_test_runs from anon,authenticated;
grant select,insert on public.ticket_lifecycle_events to authenticated;
grant select,insert,update on public.ticket_escalations to authenticated;
grant select,insert,update on public.acceptance_test_runs to authenticated;

drop policy if exists ticket_lifecycle_read_scope on public.ticket_lifecycle_events;
create policy ticket_lifecycle_read_scope on public.ticket_lifecycle_events for select to authenticated
using (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=ticket_lifecycle_events.organization_id and (ticket_lifecycle_events.tenant_id is null or p.tenant_id=ticket_lifecycle_events.tenant_id)));
drop policy if exists ticket_lifecycle_insert_authorized on public.ticket_lifecycle_events;
create policy ticket_lifecycle_insert_authorized on public.ticket_lifecycle_events for insert to authenticated
with check (actor_profile_id=(select auth.uid()) and exists(
 select 1 from public.profiles p join public.tickets t on t.id=ticket_lifecycle_events.ticket_id
 where p.id=(select auth.uid()) and p.organization_id=ticket_lifecycle_events.organization_id and p.organization_id=t.organization_id
 and (ticket_lifecycle_events.tenant_id is null or p.tenant_id=ticket_lifecycle_events.tenant_id) and (t.tenant_id is null or p.tenant_id=t.tenant_id)
 and (t.requester_profile_id=p.id or t.assigned_profile_id=p.id or exists(
  select 1 from public.profile_roles pr join public.roles r on r.id=pr.role_id where pr.profile_id=p.id and pr.is_active and (pr.expires_at is null or pr.expires_at>now())
  and r.role_key in ('super_admin','global_admin','organization_admin','service_desk_manager','it_manager')
 ))));

drop policy if exists ticket_escalations_read_scope on public.ticket_escalations;
create policy ticket_escalations_read_scope on public.ticket_escalations for select to authenticated
using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=ticket_escalations.organization_id and (ticket_escalations.tenant_id is null or p.tenant_id=ticket_escalations.tenant_id)));
drop policy if exists ticket_escalations_insert_authorized on public.ticket_escalations;
create policy ticket_escalations_insert_authorized on public.ticket_escalations for insert to authenticated
with check(escalated_by=(select auth.uid()) and exists(
 select 1 from public.profiles p join public.tickets t on t.id=ticket_escalations.ticket_id where p.id=(select auth.uid())
 and p.organization_id=ticket_escalations.organization_id and p.organization_id=t.organization_id
 and (ticket_escalations.tenant_id is null or p.tenant_id=ticket_escalations.tenant_id) and (t.tenant_id is null or p.tenant_id=t.tenant_id)
 and (t.requester_profile_id=p.id or t.assigned_profile_id=p.id or exists(
  select 1 from public.profile_roles pr join public.roles r on r.id=pr.role_id where pr.profile_id=p.id and pr.is_active and (pr.expires_at is null or pr.expires_at>now())
  and r.role_key in ('super_admin','global_admin','organization_admin','service_desk_manager','it_manager','technician')
 ))));
drop policy if exists ticket_escalations_update_managers_or_assignee on public.ticket_escalations;
create policy ticket_escalations_update_managers_or_assignee on public.ticket_escalations for update to authenticated
using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=ticket_escalations.organization_id and (ticket_escalations.tenant_id is null or p.tenant_id=ticket_escalations.tenant_id) and (ticket_escalations.assigned_to=p.id or exists(
 select 1 from public.profile_roles pr join public.roles r on r.id=pr.role_id where pr.profile_id=p.id and pr.is_active and (pr.expires_at is null or pr.expires_at>now()) and r.role_key in ('super_admin','global_admin','organization_admin','service_desk_manager','it_manager')
)))) with check(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=ticket_escalations.organization_id and (ticket_escalations.tenant_id is null or p.tenant_id=ticket_escalations.tenant_id) and (ticket_escalations.assigned_to=p.id or exists(
 select 1 from public.profile_roles pr join public.roles r on r.id=pr.role_id where pr.profile_id=p.id and pr.is_active and (pr.expires_at is null or pr.expires_at>now()) and r.role_key in ('super_admin','global_admin','organization_admin','service_desk_manager','it_manager')
))));

drop policy if exists acceptance_runs_read_scope on public.acceptance_test_runs;
create policy acceptance_runs_read_scope on public.acceptance_test_runs for select to authenticated
using(organization_id is null or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=acceptance_test_runs.organization_id and (acceptance_test_runs.tenant_id is null or p.tenant_id=acceptance_test_runs.tenant_id)));
drop policy if exists acceptance_runs_insert_self on public.acceptance_test_runs;
create policy acceptance_runs_insert_self on public.acceptance_test_runs for insert to authenticated
with check(requested_by=(select auth.uid()) and (organization_id is null or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=acceptance_test_runs.organization_id and (acceptance_test_runs.tenant_id is null or p.tenant_id=acceptance_test_runs.tenant_id))));
drop policy if exists acceptance_runs_update_self on public.acceptance_test_runs;
create policy acceptance_runs_update_self on public.acceptance_test_runs for update to authenticated using(requested_by=(select auth.uid())) with check(requested_by=(select auth.uid()));
