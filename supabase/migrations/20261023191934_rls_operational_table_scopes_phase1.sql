-- Table-by-table operational RLS scope (applied to project migration version 20261023191934).
-- Identity anchor: profiles.id = auth.uid(). Client policies never grant service-role privileges.

CREATE POLICY assistant_sessions_owner_scope ON public.assistant_sessions
FOR ALL TO authenticated USING (profile_id=(SELECT auth.uid()) AND EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active'
 AND p.organization_id=assistant_sessions.organization_id
 AND (assistant_sessions.tenant_id IS NULL OR p.tenant_id=assistant_sessions.tenant_id)))
WITH CHECK (profile_id=(SELECT auth.uid()) AND EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active'
 AND p.organization_id=assistant_sessions.organization_id
 AND (assistant_sessions.tenant_id IS NULL OR p.tenant_id=assistant_sessions.tenant_id)));

CREATE POLICY assistant_messages_session_owner_scope ON public.assistant_messages
FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.assistant_sessions s WHERE s.id=assistant_messages.session_id AND s.profile_id=(SELECT auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.assistant_sessions s WHERE s.id=assistant_messages.session_id AND s.profile_id=(SELECT auth.uid())));

CREATE POLICY calendar_events_read_org_or_creator ON public.calendar_events
FOR SELECT TO authenticated USING (EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active'
 AND p.organization_id=calendar_events.organization_id
 AND (calendar_events.created_by=p.id OR calendar_events.visibility='organization')));
CREATE POLICY calendar_events_create_self ON public.calendar_events
FOR INSERT TO authenticated WITH CHECK (created_by=(SELECT auth.uid()) AND EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active'
 AND p.organization_id=calendar_events.organization_id));
CREATE POLICY calendar_events_update_self ON public.calendar_events
FOR UPDATE TO authenticated USING (created_by=(SELECT auth.uid()) AND EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active'
 AND p.organization_id=calendar_events.organization_id))
WITH CHECK (created_by=(SELECT auth.uid()) AND EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active'
 AND p.organization_id=calendar_events.organization_id));
CREATE POLICY calendar_events_delete_self ON public.calendar_events
FOR DELETE TO authenticated USING (created_by=(SELECT auth.uid()));

CREATE POLICY devices_read_org_tenant ON public.devices
FOR SELECT TO authenticated USING (EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active'
 AND p.organization_id=devices.organization_id AND (devices.tenant_id IS NULL OR p.tenant_id=devices.tenant_id)));
CREATE POLICY devices_manage_admins ON public.devices
FOR ALL TO authenticated USING (EXISTS (
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

CREATE POLICY integration_connections_admin_scope ON public.integration_connections
FOR ALL TO authenticated USING (EXISTS (
 SELECT 1 FROM public.profiles p JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=integration_connections.organization_id
 AND (integration_connections.tenant_id IS NULL OR p.tenant_id=integration_connections.tenant_id)
 AND pr.is_active AND (pr.expires_at IS NULL OR pr.expires_at>now())
 AND r.role_key IN ('super_admin','global_admin','organization_admin','security_admin','it_manager')))
WITH CHECK (EXISTS (
 SELECT 1 FROM public.profiles p JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=integration_connections.organization_id
 AND (integration_connections.tenant_id IS NULL OR p.tenant_id=integration_connections.tenant_id)
 AND pr.is_active AND (pr.expires_at IS NULL OR pr.expires_at>now())
 AND r.role_key IN ('super_admin','global_admin','organization_admin','security_admin','it_manager')));

CREATE POLICY audit_events_read_admin_scope ON public.audit_events
FOR SELECT TO authenticated USING (EXISTS (
 SELECT 1 FROM public.profiles p JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE p.id=(SELECT auth.uid()) AND p.member_status='active' AND p.organization_id=audit_events.organization_id
 AND (audit_events.tenant_id IS NULL OR p.tenant_id=audit_events.tenant_id)
 AND pr.is_active AND (pr.expires_at IS NULL OR pr.expires_at>now())
 AND r.role_key IN ('super_admin','global_admin','organization_admin','security_admin','it_manager','auditor')));

CREATE POLICY notification_events_recipient_read ON public.notification_events
FOR SELECT TO authenticated USING (recipient_profile_id=(SELECT auth.uid()) AND EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active'
 AND p.organization_id=notification_events.organization_id));
CREATE POLICY notification_events_recipient_update ON public.notification_events
FOR UPDATE TO authenticated USING (recipient_profile_id=(SELECT auth.uid()) AND EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active'
 AND p.organization_id=notification_events.organization_id))
WITH CHECK (recipient_profile_id=(SELECT auth.uid()) AND EXISTS (
 SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.member_status='active'
 AND p.organization_id=notification_events.organization_id));

CREATE POLICY theme_preferences_owner_scope ON public.theme_preferences
FOR ALL TO authenticated USING (profile_id=(SELECT auth.uid()))
WITH CHECK (profile_id=(SELECT auth.uid()));
CREATE POLICY employee_rewards_owner_read ON public.employee_rewards
FOR SELECT TO authenticated USING (profile_id=(SELECT auth.uid()));

CREATE POLICY ticket_device_links_read_ticket_scope ON public.ticket_device_links
FOR SELECT TO authenticated USING (EXISTS (
 SELECT 1 FROM public.tickets t JOIN public.profiles p ON p.id=(SELECT auth.uid())
 WHERE t.id=ticket_device_links.ticket_id AND t.organization_id=p.organization_id
 AND (t.tenant_id IS NULL OR t.tenant_id=p.tenant_id)));
CREATE POLICY ticket_device_links_insert_operator_scope ON public.ticket_device_links
FOR INSERT TO authenticated WITH CHECK (linked_by=(SELECT auth.uid()) AND EXISTS (
 SELECT 1 FROM public.tickets t JOIN public.profiles p ON p.id=(SELECT auth.uid())
 JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE t.id=ticket_device_links.ticket_id AND t.organization_id=p.organization_id
 AND (t.tenant_id IS NULL OR t.tenant_id=p.tenant_id) AND pr.is_active
 AND (pr.expires_at IS NULL OR pr.expires_at>now())
 AND r.role_key IN ('super_admin','global_admin','organization_admin','it_manager','service_desk_manager','technician')));

CREATE POLICY ticket_offers_recipient_or_operator_read ON public.ticket_offers
FOR SELECT TO authenticated USING (offered_to_profile_id=(SELECT auth.uid()) OR EXISTS (
 SELECT 1 FROM public.tickets t JOIN public.profiles p ON p.id=(SELECT auth.uid())
 JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE t.id=ticket_offers.ticket_id AND t.organization_id=p.organization_id
 AND (t.tenant_id IS NULL OR t.tenant_id=p.tenant_id) AND pr.is_active
 AND (pr.expires_at IS NULL OR pr.expires_at>now())
 AND r.role_key IN ('super_admin','global_admin','organization_admin','service_desk_manager','it_manager')));
CREATE POLICY ticket_offers_recipient_or_operator_update ON public.ticket_offers
FOR UPDATE TO authenticated USING (offered_to_profile_id=(SELECT auth.uid()) OR EXISTS (
 SELECT 1 FROM public.tickets t JOIN public.profiles p ON p.id=(SELECT auth.uid())
 JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE t.id=ticket_offers.ticket_id AND t.organization_id=p.organization_id
 AND (t.tenant_id IS NULL OR t.tenant_id=p.tenant_id) AND pr.is_active
 AND (pr.expires_at IS NULL OR pr.expires_at>now())
 AND r.role_key IN ('super_admin','global_admin','organization_admin','service_desk_manager','it_manager')))
WITH CHECK (offered_to_profile_id=(SELECT auth.uid()) OR EXISTS (
 SELECT 1 FROM public.tickets t JOIN public.profiles p ON p.id=(SELECT auth.uid())
 JOIN public.profile_roles pr ON pr.profile_id=p.id JOIN public.roles r ON r.id=pr.role_id
 WHERE t.id=ticket_offers.ticket_id AND t.organization_id=p.organization_id
 AND (t.tenant_id IS NULL OR t.tenant_id=p.tenant_id) AND pr.is_active
 AND (pr.expires_at IS NULL OR pr.expires_at>now())
 AND r.role_key IN ('super_admin','global_admin','organization_admin','service_desk_manager','it_manager')));
