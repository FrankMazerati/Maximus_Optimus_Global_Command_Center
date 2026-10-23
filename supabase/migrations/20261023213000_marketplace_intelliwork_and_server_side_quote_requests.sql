-- IntelliWork catalog addition and safer server-side deal quote lifecycle.
-- Prices remain draft and checkout remains disabled until pricing/provider approval.
alter table public.marketplace_deal_quotes
  alter column quote_number set default (
    'Q-' || to_char(clock_timestamp() at time zone 'UTC', 'YYYYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  );

insert into public.marketplace_products
(product_key, sku, name, short_description, full_description, category_id, subcategory, icon_key, theme_key,
 included_features, addons, faq, documentation_urls, dependencies, incompatibilities, compatible_products,
 package_keys, promotion_eligible, bogo_eligible, support_level, provisioning_mode, version, visibility,
 active_status, available_tenant_ids, visible_role_keys, capabilities, sort_order,
 pricing_model, purchase_readiness, readiness_notes, checkout_enabled, pricing_unit_label)
select 'intelliwork','IS-WORK-001','IntelliWork',
 'Contractor, gig-work, and workforce coordination workflows.',
 'IntelliWork supports contractor onboarding, work opportunities, assignments, availability, timesheets, and workforce coordination. Legal, payroll, classification, payments, and compliance capabilities must be explicitly validated before activation.',
 category_id,'workforce','briefcase-business','workforce',
 jsonb_build_array('Contractor onboarding workflow','Work opportunity and assignment tracking','Availability and work status','Workforce coordination'),
 '[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,
 jsonb_build_array('intellihire','global-identity','intellipay','intellitax'),
 to_jsonb(array['premium','enterprise','full-experience']::text[]),true,false,'standard','manual_review','1.0',
 'public','active','{}'::uuid[],'{}'::text[],
 '{"workforce":{"contractor_coordination":true,"payroll":false,"tax_filing":false,"payment_processing":false}}'::jsonb,
 180,'organization_monthly','needs_review',
 'Proposed organization-level planning price; contractor counts, legal scope, compliance, and third-party costs require validation.',
 false,'per organization / month'
from public.marketplace_products where product_key='intellihire'
on conflict (product_key) do update set
 name=excluded.name, short_description=excluded.short_description, full_description=excluded.full_description,
 package_keys=excluded.package_keys, included_features=excluded.included_features, capabilities=excluded.capabilities,
 pricing_model=excluded.pricing_model, purchase_readiness='needs_review', readiness_notes=excluded.readiness_notes,
 checkout_enabled=false, updated_at=now();

insert into public.marketplace_price_versions
(product_id,price_key,currency,region,monthly_company_price,annual_company_price,setup_fee,status,version_number,
 eligibility,pricing_model,pricing_unit_label,benchmark_notes,approval_status,effective_from)
select p.id,'product-intelliwork-2026-v1','USD','US',79,790,0,'draft',1,
 jsonb_build_object('purchase_readiness','needs_review','checkout_enabled',false,'billing_unit','per organization / month'),
 'organization_monthly','per organization / month',
 'Planning estimate only. Validate contractor volume, legal/compliance scope, payment/tax boundaries, and operating costs before approval.',
 'pending',now()
from public.marketplace_products p
where p.product_key='intelliwork'
and not exists(select 1 from public.marketplace_price_versions v where v.price_key='product-intelliwork-2026-v1');

update public.marketplace_packages
set included_product_keys=case when not ('intelliwork'=any(included_product_keys))
 then array_append(included_product_keys,'intelliwork') else included_product_keys end,
 updated_at=now()
where package_key in ('premium','enterprise','full-experience');

insert into public.marketplace_audit_events(event_key,resource_type,result,details)
values('marketplace.catalog.intelliwork_added','marketplace_products','success',
 jsonb_build_object('product_key','intelliwork','price_key','product-intelliwork-2026-v1',
 'pricing_status','draft','checkout_enabled',false));

create or replace function public.marketplace_request_deal_quote(
 p_cart_id uuid, p_discount_percent numeric, p_reason text
) returns public.marketplace_deal_quotes
language plpgsql security definer set search_path=public,pg_temp
as $$
declare
 v_user_id uuid:=auth.uid();
 v_cart public.marketplace_carts%rowtype;
 v_list_total numeric(12,2);
 v_quote public.marketplace_deal_quotes%rowtype;
 v_products text[];
begin
 if v_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if p_discount_percent is null or p_discount_percent<0 or p_discount_percent>30 then
   raise exception 'Discount must be between 0 and 30 percent' using errcode='22023';
 end if;
 if p_reason is null or length(trim(p_reason))<8 then
   raise exception 'Provide a meaningful reason for the requested concession' using errcode='22023';
 end if;
 select * into v_cart from public.marketplace_carts
 where id=p_cart_id and user_id=v_user_id and status='active' for update;
 if not found then raise exception 'Active cart not found for current user' using errcode='P0002'; end if;
 if v_cart.organization_id is null then
   raise exception 'An organization is required for organization-level pricing' using errcode='22023';
 end if;
 select coalesce(sum(pv.monthly_company_price*ci.quantity),0),array_agg(distinct p.product_key)
 into v_list_total,v_products
 from public.marketplace_cart_items ci
 join public.marketplace_products p on p.id=ci.product_id
 join lateral (
   select price.monthly_company_price from public.marketplace_price_versions price
   where price.product_id=p.id and price.status='active' and price.approval_status='approved'
     and price.effective_from<=now() and (price.effective_until is null or price.effective_until>now())
   order by price.effective_from desc,price.version_number desc limit 1
 ) pv on true
 where ci.cart_id=v_cart.id;
 if v_list_total<=0 or coalesce(array_length(v_products,1),0)=0 then
   raise exception 'No approved, active product pricing is available for this cart; checkout and quotes remain unavailable until pricing is approved' using errcode='55000';
 end if;
 insert into public.marketplace_deal_quotes
 (user_id,organization_id,tenant_id,cart_id,package_key,product_keys,currency,list_monthly_total,
  proposed_monthly_total,discount_percent,reason,status,approval_required,pricing_snapshot)
 values(v_user_id,v_cart.organization_id,v_cart.tenant_id,v_cart.id,v_cart.package_key,v_products,
  v_cart.currency,v_list_total,round(v_list_total*(1-p_discount_percent/100),2),p_discount_percent,
  trim(p_reason),'pending_approval',true,
  jsonb_build_object('source','approved_active_price_versions','calculated_at',now(),
   'cart_id',v_cart.id,'package_key',v_cart.package_key,'product_keys',v_products,'monthly_list_total',v_list_total))
 returning * into v_quote;
 insert into public.marketplace_audit_events
 (organization_id,tenant_id,actor_user_id,event_key,resource_type,resource_id,result,details)
 values(v_cart.organization_id,v_cart.tenant_id,v_user_id,'marketplace.deal_quote.requested',
  'marketplace_deal_quotes',v_quote.id,'success',
  jsonb_build_object('quote_number',v_quote.quote_number,'discount_percent',p_discount_percent,
   'list_monthly_total',v_list_total,'proposed_monthly_total',v_quote.proposed_monthly_total));
 return v_quote;
end;
$$;

revoke all on function public.marketplace_request_deal_quote(uuid,numeric,text) from public,anon;
grant execute on function public.marketplace_request_deal_quote(uuid,numeric,text) to authenticated;

drop policy if exists marketplace_deal_quotes_owner_insert on public.marketplace_deal_quotes;
drop policy if exists marketplace_deal_quotes_owner_update_draft on public.marketplace_deal_quotes;
create policy marketplace_deal_quotes_owner_insert on public.marketplace_deal_quotes
 for insert to authenticated with check(user_id=auth.uid() and status='draft' and approval_required=true);
create policy marketplace_deal_quotes_owner_update_draft on public.marketplace_deal_quotes
 for update to authenticated using(user_id=auth.uid() and status='draft')
 with check(user_id=auth.uid() and status='draft' and approval_required=true);
