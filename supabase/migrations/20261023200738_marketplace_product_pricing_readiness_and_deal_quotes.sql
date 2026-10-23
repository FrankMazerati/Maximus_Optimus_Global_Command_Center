-- Product pricing, purchase readiness, and controlled save-the-deal foundation.
-- Prices are planning hypotheses and remain draft; checkout is disabled until commercial approval
-- and a verified payment-provider integration exist.

alter table public.marketplace_products
  add column if not exists pricing_model text not null default 'organization_monthly',
  add column if not exists purchase_readiness text not null default 'needs_review',
  add column if not exists readiness_notes text,
  add column if not exists checkout_enabled boolean not null default false,
  add column if not exists pricing_unit_label text not null default 'per organization / month',
  add column if not exists pricing_reviewed_at timestamptz;

alter table public.marketplace_price_versions
  add column if not exists pricing_model text not null default 'organization_monthly',
  add column if not exists pricing_unit_label text not null default 'per organization / month',
  add column if not exists benchmark_notes text,
  add column if not exists margin_floor numeric,
  add column if not exists approval_status text not null default 'pending'
    check (approval_status in ('pending','approved','rejected','expired')),
  add column if not exists approved_by uuid references auth.users(id),
  add column if not exists approved_at timestamptz;

create table if not exists public.marketplace_deal_quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id),
  tenant_id uuid references public.tenants(id),
  cart_id uuid references public.marketplace_carts(id),
  package_key text,
  product_keys text[] not null default '{}',
  currency char(3) not null default 'USD',
  list_monthly_total numeric not null check (list_monthly_total >= 0),
  proposed_monthly_total numeric not null check (proposed_monthly_total >= 0),
  discount_percent numeric not null default 0 check (discount_percent >= 0 and discount_percent <= 30),
  reason text not null,
  status text not null default 'draft' check (status in ('draft','pending_approval','approved','rejected','accepted','expired','converted')),
  approval_required boolean not null default true,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  pricing_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (proposed_monthly_total <= list_monthly_total)
);
alter table public.marketplace_deal_quotes enable row level security;
drop policy if exists marketplace_deal_quotes_owner_read on public.marketplace_deal_quotes;
create policy marketplace_deal_quotes_owner_read on public.marketplace_deal_quotes for select to authenticated using (user_id=auth.uid());
drop policy if exists marketplace_deal_quotes_owner_insert on public.marketplace_deal_quotes;
create policy marketplace_deal_quotes_owner_insert on public.marketplace_deal_quotes for insert to authenticated with check (user_id=auth.uid() and status='draft' and approval_required=true);
drop policy if exists marketplace_deal_quotes_owner_update_draft on public.marketplace_deal_quotes;
create policy marketplace_deal_quotes_owner_update_draft on public.marketplace_deal_quotes for update to authenticated using (user_id=auth.uid() and status='draft') with check (user_id=auth.uid() and status='draft' and approval_required=true);

with proposed(product_key, monthly, annual, model, unit_label, note, readiness) as (
 values
 ('global-identity',149::numeric,1490::numeric,'organization_monthly','per organization / month','Proposed platform identity foundation; compare to identity-suite pricing only after scope validation.','needs_review'),
 ('intellitax',39,390,'organization_monthly','per organization / month','Proposed add-on; tax compliance scope and liability boundaries require review.','coming_soon'),
 ('intellipay',49,490,'organization_monthly','per organization / month','Proposed add-on; payment processing and provider fees are excluded.','coming_soon'),
 ('intellihire',79,790,'organization_monthly','per organization / month','Proposed recruiting/workforce module; not priced per recruiter yet.','needs_review'),
 ('helpbuddy',99,990,'organization_monthly','per organization / month','Proposed configured AI assistant; model usage limits and provider costs must be defined.','needs_review'),
 ('trinity',79,790,'organization_monthly','per organization / month','Proposed assistant capability; final feature scope and usage limits require validation.','needs_review'),
 ('optimus',79,790,'organization_monthly','per organization / month','Proposed service-desk assistant capability; AI usage limits require validation.','needs_review'),
 ('maximus',129,1290,'organization_monthly','per organization / month','Proposed command-center intelligence add-on; AI usage limits and admin controls require validation.','needs_review'),
 ('help-desk',99,990,'organization_monthly','per organization / month','Organization-level planning price, not per-agent pricing; compare against service desk scope.','needs_review'),
 ('security-operations',199,1990,'organization_monthly','per organization / month','Proposed workflow platform price; excludes managed SOC services and third-party security licenses.','needs_review'),
 ('network-operations',149,1490,'organization_monthly','per organization / month','Proposed monitoring workflow price; device/asset limits and integrations require validation.','needs_review'),
 ('intellichat',49,490,'organization_monthly','per organization / month','Proposed collaboration add-on; storage, retention and user limits require validation.','needs_review'),
 ('knowledge-base',39,390,'organization_monthly','per organization / month','Proposed knowledge base add-on; storage and author limits require validation.','needs_review'),
 ('workflow-automation',99,990,'organization_monthly','per organization / month','Proposed automation add-on; execution limits and external connector costs require validation.','coming_soon')
)
update public.marketplace_products p
set pricing_model=proposed.model, pricing_unit_label=proposed.unit_label,
    purchase_readiness=proposed.readiness, readiness_notes=proposed.note,
    checkout_enabled=false, updated_at=now()
from proposed where p.product_key=proposed.product_key;

with proposed(product_key, monthly, annual, model, unit_label, note) as (
 values
 ('global-identity',149::numeric,1490::numeric,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('intellitax',39,390,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('intellipay',49,490,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('intellihire',79,790,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('helpbuddy',99,990,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('trinity',79,790,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('optimus',79,790,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('maximus',129,1290,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('help-desk',99,990,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('security-operations',199,1990,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('network-operations',149,1490,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('intellichat',49,490,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('knowledge-base',39,390,'organization_monthly','per organization / month','Planning estimate; not approved'),
 ('workflow-automation',99,990,'organization_monthly','per organization / month','Planning estimate; not approved')
)
insert into public.marketplace_price_versions
(product_id,price_key,currency,region,monthly_company_price,annual_company_price,setup_fee,status,version_number,eligibility,pricing_model,pricing_unit_label,benchmark_notes,approval_status,effective_from)
select p.id, 'product-'||p.product_key||'-2026-v1','USD','US',proposed.monthly,proposed.annual,0,'draft',1,
 jsonb_build_object('purchase_readiness',p.purchase_readiness,'checkout_enabled',false,'billing_unit',proposed.unit_label),
 proposed.model,proposed.unit_label,proposed.note,'pending',now()
from proposed join public.marketplace_products p on p.product_key=proposed.product_key
where not exists(select 1 from public.marketplace_price_versions pv where pv.price_key='product-'||p.product_key||'-2026-v1');

insert into public.marketplace_price_versions
(package_key,price_key,currency,region,monthly_company_price,annual_company_price,setup_fee,status,version_number,eligibility,pricing_model,pricing_unit_label,benchmark_notes,approval_status,effective_from)
select p.package_key,'package-'||p.package_key||'-2026-v1','USD','US',p.monthly_company_price,p.annual_company_price,0,'draft',1,
 jsonb_build_object('included_products',p.included_product_keys,'checkout_enabled',false,'pricing_status','draft'),
 'organization_monthly','per organization / month','Bundle planning estimate; validate included-product list and margins before approval','pending',now()
from public.marketplace_packages p
where not exists(select 1 from public.marketplace_price_versions pv where pv.price_key='package-'||p.package_key||'-2026-v1');

insert into public.marketplace_promotions
(promotion_key,name,description,promotion_type,rules,eligible_product_keys,eligible_package_keys,promo_code,currency,starts_at,ends_at,max_redemptions,redemption_count,eligibility,status)
values
('welcome-platform-10','New Customer Platform Offer','Draft offer for qualified new customers. Activate only after commercial approval.','percent',
 '{"discount_percent":10,"max_discount_percent":10,"requires_new_customer":true,"stackable":false,"approval_required":true}'::jsonb,
 array['global-identity','intellihire','helpbuddy','trinity','optimus','maximus','help-desk','security-operations','network-operations','intellichat','knowledge-base']::text[],
 array['launch','basic','growth','premium','enterprise','full-experience']::text[],
 'WELCOME10','USD',now(),now()+interval '30 days',100,0,
 '{"new_customer_only":true,"max_uses_per_customer":1,"checkout_enabled":false}'::jsonb,'draft'),
('save-the-deal','Save-the-Deal Quote','Internal sales concession workflow; customer-specific quotes require approval and must have a real expiry.','percent',
 '{"max_discount_percent":30,"requires_reason":true,"approval_required":true,"no_stack":true,"no_fake_urgency":true}'::jsonb,
 array['global-identity','intellitax','intellipay','intellihire','helpbuddy','trinity','optimus','maximus','help-desk','security-operations','network-operations','intellichat','knowledge-base','workflow-automation']::text[],
 array['launch','basic','growth','premium','enterprise','full-experience']::text[],
 null,'USD',now(),now()+interval '90 days',500,0,
 '{"quote_required":true,"approval_required":true,"max_discount_percent":30,"checkout_enabled":false}'::jsonb,'draft'),
('annual-commitment-10','Annual Commitment Offer','Draft annual-billing offer; discount must be validated against approved list pricing.','percent',
 '{"discount_percent":10,"billing_cycle":"annual","stackable":false,"approval_required":true}'::jsonb,
 array['global-identity','intellihire','helpbuddy','trinity','optimus','maximus','help-desk','security-operations','network-operations','intellichat','knowledge-base','workflow-automation']::text[],
 array['launch','basic','growth','premium','enterprise','full-experience']::text[],
 'ANNUAL10','USD',now(),now()+interval '90 days',250,0,
 '{"billing_cycle":"annual","checkout_enabled":false,"approval_required":true}'::jsonb,'draft')
on conflict (promotion_key) do update set description=excluded.description,rules=excluded.rules,eligible_product_keys=excluded.eligible_product_keys,eligible_package_keys=excluded.eligible_package_keys,ends_at=excluded.ends_at,eligibility=excluded.eligibility,status='draft',updated_at=now();

create index if not exists idx_marketplace_price_versions_product_active on public.marketplace_price_versions(product_id,status,approval_status,effective_from);
create index if not exists idx_marketplace_price_versions_package_active on public.marketplace_price_versions(package_key,status,approval_status,effective_from);
create index if not exists idx_marketplace_deal_quotes_user_status on public.marketplace_deal_quotes(user_id,status,expires_at);
