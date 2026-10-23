-- Harden quote RPC against cross-organization carts and partially priced carts.
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
 v_item_count integer;
 v_priced_item_count integer;
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
 if not exists (
   select 1 from public.profiles pr where pr.id=v_user_id
     and pr.organization_id=v_cart.organization_id
     and (v_cart.tenant_id is null or pr.tenant_id=v_cart.tenant_id)
 ) then
   raise exception 'Cart organization or tenant is not authorized for this user' using errcode='42501';
 end if;
 select count(*) into v_item_count from public.marketplace_cart_items ci where ci.cart_id=v_cart.id;
 select count(*),coalesce(sum(pv.monthly_company_price*ci.quantity),0),array_agg(distinct p.product_key)
 into v_priced_item_count,v_list_total,v_products
 from public.marketplace_cart_items ci
 join public.marketplace_products p on p.id=ci.product_id
 join lateral (
   select price.monthly_company_price from public.marketplace_price_versions price
   where price.product_id=p.id and price.status='active' and price.approval_status='approved'
     and price.effective_from<=now() and (price.effective_until is null or price.effective_until>now())
   order by price.effective_from desc,price.version_number desc limit 1
 ) pv on true where ci.cart_id=v_cart.id;
 if v_item_count=0 or v_priced_item_count<>v_item_count or v_list_total<=0 then
   raise exception 'Cart must contain only products with approved, active pricing; no quote or checkout can proceed' using errcode='55000';
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
