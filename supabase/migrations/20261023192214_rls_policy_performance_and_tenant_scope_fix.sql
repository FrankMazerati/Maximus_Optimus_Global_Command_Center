-- Reduce duplicate permissive device SELECT policies and tighten tenant enumeration.
DROP POLICY devices_manage_admins ON public.devices;
CREATE POLICY devices_insert_admins ON public.devices FOR INSERT TO authenticated
WITH CHECK (EXISTS (
 SELECT 1 FROM public.profiles p JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=devices.organization_id
 AND (devices.tenant_id IS NULL OR p.tenant_id=devices.tenant_id) AND pr.is_active
 AND (pr.expires_at IS NULL OR pr.expires_at>now())
 AND r.role_key IN ('super_admin','global_admin','organization_admin','it_manager','service_desk_manager')));
CREATE POLICY devices_update_admins ON public.devices FOR UPDATE TO authenticated
USING (EXISTS (
 SELECT 1 FROM public.profiles p JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=devices.organization_id
 AND (devices.tenant_id IS NULL OR p.tenant_id=devices.tenant_id) AND pr.is_active
 AND (pr.expires_at IS NULL OR pr.expires_at>now())
 AND r.role_key IN ('super_admin','global_admin','organization_admin','it_manager','service_desk_manager')))
WITH CHECK (EXISTS (
 SELECT 1 FROM public.profiles p JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=devices.organization_id
 AND (devices.tenant_id IS NULL OR p.tenant_id=devices.tenant_id) AND pr.is_active
 AND (pr.expires_at IS NULL OR pr.expires_at>now())
 AND r.role_key IN ('super_admin','global_admin','organization_admin','it_manager','service_desk_manager')));
CREATE POLICY devices_delete_admins ON public.devices FOR DELETE TO authenticated
USING (EXISTS (
 SELECT 1 FROM public.profiles p JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=devices.organization_id
 AND (devices.tenant_id IS NULL OR p.tenant_id=devices.tenant_id) AND pr.is_active
 AND (pr.expires_at IS NULL OR pr.expires_at>now())
 AND r.role_key IN ('super_admin','global_admin','organization_admin','it_manager','service_desk_manager')));

DROP POLICY tenants_read_org_membership ON public.tenants;
CREATE POLICY tenants_read_membership_or_admin ON public.tenants FOR SELECT TO authenticated USING (
 EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active'
 AND p.organization_id=tenants.organization_id AND p.tenant_id=tenants.id)
 OR EXISTS (
 SELECT 1 FROM public.profiles p JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=tenants.organization_id
 AND pr.is_active AND (pr.expires_at IS NULL OR pr.expires_at>now())
 AND r.role_key IN ('super_admin','global_admin','organization_admin')));
