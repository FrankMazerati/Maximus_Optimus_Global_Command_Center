-- Approval gate for sensitive ticket actions; additive and tenant-scoped.
create table if not exists public.ticket_approval_requests (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 tenant_id uuid references public.tenants(id) on delete cascade,
 ticket_id uuid not null references public.tickets(id) on delete cascade,
 requested_by uuid not null references public.profiles(id) on delete restrict,
 approver_profile_id uuid references public.profiles(id) on delete set null,
 permission_key text not null,
 reason text not null,
 status text not null default 'pending' check(status in ('pending','approved','denied','cancelled')),
 decision_reason text,
 requested_at timestamptz not null default now(),
 decided_at timestamptz
);
create index if not exists ticket_approval_requests_pending_idx on public.ticket_approval_requests(organization_id,tenant_id,status,requested_at);
alter table public.ticket_approval_requests enable row level security;
revoke all on public.ticket_approval_requests from anon,authenticated;
grant select,insert,update on public.ticket_approval_requests to authenticated;
drop policy if exists ticket_approval_read_scope on public.ticket_approval_requests;
create policy ticket_approval_read_scope on public.ticket_approval_requests for select to authenticated
using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=ticket_approval_requests.organization_id and (ticket_approval_requests.tenant_id is null or p.tenant_id=ticket_approval_requests.tenant_id)));
drop policy if exists ticket_approval_request_self on public.ticket_approval_requests;
create policy ticket_approval_request_self on public.ticket_approval_requests for insert to authenticated
with check(requested_by=(select auth.uid()) and status='pending' and approver_profile_id is null and exists(
 select 1 from public.profiles p join public.tickets t on t.id=ticket_approval_requests.ticket_id
 where p.id=(select auth.uid()) and p.organization_id=ticket_approval_requests.organization_id and p.organization_id=t.organization_id
 and (ticket_approval_requests.tenant_id is null or p.tenant_id=ticket_approval_requests.tenant_id) and (t.tenant_id is null or p.tenant_id=t.tenant_id)
));
drop policy if exists ticket_approval_decision_manager on public.ticket_approval_requests;
create policy ticket_approval_decision_manager on public.ticket_approval_requests for update to authenticated
using(status='pending' and exists(select 1 from public.profiles p join public.profile_roles pr on pr.profile_id=p.id join public.roles r on r.id=pr.role_id where p.id=(select auth.uid()) and p.organization_id=ticket_approval_requests.organization_id and (ticket_approval_requests.tenant_id is null or p.tenant_id=ticket_approval_requests.tenant_id) and pr.is_active and (pr.expires_at is null or pr.expires_at>now()) and r.role_key in ('super_admin','global_admin','organization_admin','service_desk_manager','it_manager')))
with check(status in ('approved','denied') and approver_profile_id=(select auth.uid()) and decided_at is not null and decision_reason is not null and length(trim(decision_reason))>=4 and exists(select 1 from public.profiles p join public.profile_roles pr on pr.profile_id=p.id join public.roles r on r.id=pr.role_id where p.id=(select auth.uid()) and p.organization_id=ticket_approval_requests.organization_id and (ticket_approval_requests.tenant_id is null or p.tenant_id=ticket_approval_requests.tenant_id) and pr.is_active and (pr.expires_at is null or pr.expires_at>now()) and r.role_key in ('super_admin','global_admin','organization_admin','service_desk_manager','it_manager')));

-- Resolution is blocked until all defined remediation steps are completed.
create or replace function public.guard_ticket_resolution()
returns trigger language plpgsql set search_path=''
as $$
begin
 if new.status::text in ('resolved','closed') and old.status::text not in ('resolved','closed') then
   if coalesce(new.total_steps,0)>0 and exists(select 1 from public.ticket_steps s where s.ticket_id=new.id and s.step_status<>'completed') then
     raise exception 'Ticket cannot be resolved while required remediation steps remain incomplete' using errcode='23514';
   end if;
   if nullif(trim(coalesce(new.resolution_summary,'')),'') is null then
     raise exception 'A resolution summary is required before resolving or closing a ticket' using errcode='23514';
   end if;
 end if;
 if new.category in ('Identity','Access','Security Access') and new.status::text in ('in_progress','resolved','closed')
   and old.status::text not in ('in_progress','resolved','closed') then
   if not exists(select 1 from public.ticket_approval_requests a where a.ticket_id=new.id and a.organization_id=new.organization_id and a.status='approved') then
     raise exception 'Sensitive access ticket requires an approved authorization request before work can proceed' using errcode='42501';
   end if;
 end if;
 return new;
end;
$$;
revoke all on function public.guard_ticket_resolution() from public,anon,authenticated;
drop trigger if exists guard_ticket_resolution_before_update on public.tickets;
create trigger guard_ticket_resolution_before_update before update of status,resolution_summary on public.tickets for each row execute function public.guard_ticket_resolution();
