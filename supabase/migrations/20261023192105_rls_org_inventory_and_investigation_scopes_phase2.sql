-- Organization, inventory, files, groups, and investigation read scopes.
-- These policies use the authenticated profile as the trusted identity anchor.

CREATE POLICY organizations_read_membership ON public.organizations
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=organizations.id));
CREATE POLICY tenants_read_org_membership ON public.tenants
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=tenants.organization_id AND (p.tenant_id=tenants.id OR p.tenant_id IS NULL)));
CREATE POLICY departments_read_org_scope ON public.departments
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=departments.organization_id));
CREATE POLICY organizational_units_read_org_scope ON public.organizational_units
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=organizational_units.organization_id));
CREATE POLICY groups_read_org_tenant_scope ON public.groups
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=groups.organization_id AND (groups.tenant_id IS NULL OR p.tenant_id=groups.tenant_id)));
CREATE POLICY group_memberships_read_self_or_org_admin ON public.group_memberships
FOR SELECT TO authenticated USING (profile_id=(SELECT auth.uid()) OR EXISTS (
 SELECT 1 FROM public.groups g JOIN public.profiles p ON p.id=(SELECT auth.uid())
 JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE g.id=group_memberships.group_id AND g.organization_id=p.organization_id AND (g.tenant_id IS NULL OR g.tenant_id=p.tenant_id)
 AND pr.is_active AND (pr.expires_at IS NULL OR pr.expires_at>now()) AND r.role_key IN ('super_admin','global_admin','organization_admin','it_manager')));
CREATE POLICY network_assets_read_org_tenant ON public.network_assets
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=network_assets.organization_id AND (network_assets.tenant_id IS NULL OR p.tenant_id=network_assets.tenant_id)));
CREATE POLICY network_segments_read_org_tenant ON public.network_segments
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=network_segments.organization_id AND (network_segments.tenant_id IS NULL OR p.tenant_id=network_segments.tenant_id)));
CREATE POLICY firewalls_read_asset_scope ON public.firewalls
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.network_assets a JOIN public.profiles p ON p.id=(SELECT auth.uid()) WHERE a.id=firewalls.network_asset_id AND a.organization_id=p.organization_id AND (a.tenant_id IS NULL OR a.tenant_id=p.tenant_id)));
CREATE POLICY files_metadata_read_scope ON public.files_metadata
FOR SELECT TO authenticated USING (uploaded_by=(SELECT auth.uid()) OR (visibility='public_internal' AND EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=files_metadata.organization_id
 AND (files_metadata.tenant_id IS NULL OR p.tenant_id=files_metadata.tenant_id))));
CREATE POLICY files_metadata_insert_owner_scope ON public.files_metadata
FOR INSERT TO authenticated WITH CHECK (uploaded_by=(SELECT auth.uid()) AND EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=files_metadata.organization_id
 AND (files_metadata.tenant_id IS NULL OR p.tenant_id=files_metadata.tenant_id)));
CREATE POLICY investigations_read_org_tenant_scope ON public.investigations
FOR SELECT TO authenticated USING (EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=investigations.organization_id
 AND (investigations.tenant_id IS NULL OR p.tenant_id=investigations.tenant_id)
 AND (investigations.lead_profile_id=p.id OR investigations.created_by=p.id OR EXISTS (
  SELECT 1 FROM public.profile_roles pr JOIN public.roles r ON r.id=pr.role_id WHERE pr.profile_id=p.id AND pr.is_active
  AND (pr.expires_at IS NULL OR pr.expires_at>now()) AND r.role_key IN ('super_admin','global_admin','organization_admin','security_admin','it_manager')))));
CREATE POLICY investigation_findings_read_lead_or_admin ON public.investigation_findings
FOR SELECT TO authenticated USING (EXISTS (
 SELECT 1 FROM public.investigations i JOIN public.profiles p ON p.id=(SELECT auth.uid())
 WHERE i.id=investigation_findings.investigation_id AND i.organization_id=p.organization_id AND (i.tenant_id IS NULL OR i.tenant_id=p.tenant_id)
 AND (i.lead_profile_id=p.id OR i.created_by=p.id OR EXISTS (
  SELECT 1 FROM public.profile_roles pr JOIN public.roles r ON r.id=pr.role_id WHERE pr.profile_id=p.id AND pr.is_active
  AND (pr.expires_at IS NULL OR pr.expires_at>now()) AND r.role_key IN ('super_admin','global_admin','organization_admin','security_admin','it_manager')))));
