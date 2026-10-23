-- HelpBuddy persistence foundation. Apply only after confirming the canonical Supabase project.
-- This supplements the existing tickets/workflows tables; it does not replace them.
create table if not exists public.helpbuddy_work_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  ticket_id uuid references public.tickets(id) on delete set null,
  request_id text not null unique,
  created_by uuid not null references auth.users(id) on delete restrict,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null check (char_length(title) between 4 and 180),
  description text not null default '',
  status text not null default 'submitted' check (status in ('submitted','in_progress','waiting_on_me','waiting_on_others','completed','closed','cancelled')),
  current_checkpoint text not null default 'triage' check (current_checkpoint in ('triage','remediation','security_access','manager_review','closed')),
  required_role text,
  required_permission text,
  approval_request jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.helpbuddy_work_events (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid not null references public.helpbuddy_work_items(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists helpbuddy_work_items_scope_updated_idx
  on public.helpbuddy_work_items (organization_id, tenant_id, updated_at desc);
create index if not exists helpbuddy_work_items_assigned_idx
  on public.helpbuddy_work_items (assigned_to, status, updated_at desc);
create index if not exists helpbuddy_work_events_item_created_idx
  on public.helpbuddy_work_events (work_item_id, created_at);

alter table public.helpbuddy_work_items enable row level security;
alter table public.helpbuddy_work_events enable row level security;

revoke all on table public.helpbuddy_work_items from anon, authenticated;
revoke all on table public.helpbuddy_work_events from anon, authenticated;
grant select, insert, update on table public.helpbuddy_work_items to authenticated;
grant select, insert on table public.helpbuddy_work_events to authenticated;

-- Organization membership is sourced from the authenticated user's server-managed profile.
-- Tenant membership is enforced when a work item has a tenant_id.
create policy helpbuddy_work_items_read_scope on public.helpbuddy_work_items
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.organization_id = helpbuddy_work_items.organization_id
      and (helpbuddy_work_items.tenant_id is null or p.tenant_id = helpbuddy_work_items.tenant_id)
  ));

create policy helpbuddy_work_items_insert_scope on public.helpbuddy_work_items
  for insert to authenticated
  with check (created_by = (select auth.uid()) and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.organization_id = helpbuddy_work_items.organization_id
      and (helpbuddy_work_items.tenant_id is null or p.tenant_id = helpbuddy_work_items.tenant_id)
  ));

create policy helpbuddy_work_items_update_scope on public.helpbuddy_work_items
  for update to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.organization_id = helpbuddy_work_items.organization_id
      and (helpbuddy_work_items.tenant_id is null or p.tenant_id = helpbuddy_work_items.tenant_id)
      and (helpbuddy_work_items.created_by = p.id or helpbuddy_work_items.assigned_to = p.id)
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.organization_id = helpbuddy_work_items.organization_id
      and (helpbuddy_work_items.tenant_id is null or p.tenant_id = helpbuddy_work_items.tenant_id)
      and (helpbuddy_work_items.created_by = p.id or helpbuddy_work_items.assigned_to = p.id)
  ));

create policy helpbuddy_work_events_read_scope on public.helpbuddy_work_events
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.organization_id = helpbuddy_work_events.organization_id
      and (helpbuddy_work_events.tenant_id is null or p.tenant_id = helpbuddy_work_events.tenant_id)
  ));

create policy helpbuddy_work_events_insert_scope on public.helpbuddy_work_events
  for insert to authenticated
  with check (actor_id = (select auth.uid()) and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.organization_id = helpbuddy_work_events.organization_id
      and (helpbuddy_work_events.tenant_id is null or p.tenant_id = helpbuddy_work_events.tenant_id)
  ));

create or replace function public.helpbuddy_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.helpbuddy_touch_updated_at() from public, anon, authenticated;

drop trigger if exists helpbuddy_work_items_touch_updated_at on public.helpbuddy_work_items;
create trigger helpbuddy_work_items_touch_updated_at
before update on public.helpbuddy_work_items
for each row execute function public.helpbuddy_touch_updated_at();
