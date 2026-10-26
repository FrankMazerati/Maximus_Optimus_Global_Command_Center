# Build 028 — Supabase Database & Authorization Audit (Initial Read-Only Findings)

**Project:** IntelliStack_Systems_Optimus_Maximus  
**Project ref:** fzwbvccvqnbvzbqfgiep  
**Audit date:** 2026-10-25  
**Scope:** Read-only catalog inspection, RLS/policy inventory, foreign-key/constraint review, Supabase security/performance advisors, and selected authorization-function review.  
**Status:** Initial findings; not a complete penetration test or certification. No database schema/data was changed during this audit.

## Executive summary

The project has a substantial existing foundation: 91 public tables, all 91 currently report RLS enabled, and existing organization, tenant, profile, role, group, department, organizational-unit, device, integration-connection, and audit structures are present. Initial data-consistency checks returned zero organization/tenant mismatches across profiles, groups, devices, and profile-role rows in the checked joins.

However, RLS being enabled is not sufficient to establish security. The current Supabase security advisor reports 24 tables with RLS enabled but no policies; it also reports four SECURITY DEFINER functions executable by authenticated users and disabled leaked-password protection. The performance advisor reports 23 foreign-key constraints without covering indexes. These need review and remediation by priority.

## Confirmed inventory observations

- Public tables: **91**.
- Public tables with RLS enabled: **91**.
- Public tables with RLS disabled: **0**.
- Public tables with RLS enabled and no policies: **24**.
- Public views returned by the inspected pg_views query: **0**.
- Security advisor: **24** RLS-enabled/no-policy findings.
- Security advisor: **4** authenticated-executable SECURITY DEFINER functions.
- Security advisor: leaked-password protection is disabled.
- Performance advisor: **23** unindexed foreign-key findings.
- Edge Functions listing returned an empty list.
- Migration history listing returned 32 migration entries (through 20261023214729 add_simple_character_codes at time of inspection).

RLS-enabled tables without policies ordinarily deny access to API roles through RLS, even when SQL grants exist. This is fail-closed from a row-access perspective, but may break expected application workflows. It is not a reason to add broad policies automatically. Each table needs an intended data classification, owner, read/write use cases, and tested policy.

## Findings and priority

### P0 — Security-definer function review

The advisor identified these functions as executable by authenticated and defined as SECURITY DEFINER:
- public.kb_can_manage()
- public.kb_can_read_base(base_id uuid)
- public.kb_is_super_admin()
- public.marketplace_request_deal_quote(p_cart_id uuid, p_discount_percent numeric, p_reason text)

They are not executable by anon according to the inspected privilege query. That is useful but does not settle whether authenticated execution is safe. SECURITY DEFINER functions execute with the owner's privileges, so their body-level authorization, fixed search path, object references, and callable surface must be reviewed. The functions currently set search_path=public, pg_temp; this deserves hardening review (fully qualify objects and avoid placing a writable schema or pg_temp ahead of trusted objects). Do not revoke or rewrite them blindly: existing policies may depend on them.

Specific concern requiring test:
- kb_can_read_base(base_id) returns true for active public_internal knowledge bases without a user/organization scope predicate; for department visibility, the inspected body checks only that the caller has an active profile, not that they belong to the base's department/organization. This may be intentional if those visibility labels mean global internal access, but it must be reconciled with the product's intended visibility model before the function is considered safe. Test as two users in different organizations and departments.
- kb_is_super_admin() treats the super_admin role as a broad platform role based on profile status and role timing. Confirm that only trusted server-side administration can assign this role and that customers cannot self-escalate.
- marketplace_request_deal_quote(...) includes meaningful checks for authenticated user, own active cart, organization/tenant matching, and approved active pricing in the inspected definition. Still test its authorization and concurrency boundaries, approval flow, and all mutation side effects before considering it production safe.

### P1 — RLS policy coverage gaps

The following 24 tables currently have RLS enabled and no policies:
- access_requests
- assistant_ticket_actions
- assistants
- candidate_profiles
- candidate_skills
- idea_ledger_entries
- intellisphere_apps
- job_alert_preferences
- job_applications
- job_matches
- job_postings
- marketplace_companies
- marketplace_match_settings
- marketplace_reviews
- permission_scope_grants
- permissions
- role_permissions
- service_catalog
- situation_runs
- situations
- skills
- tester_feedback
- ticket_handoffs
- work_assignments

The privilege inspection indicates these tables have table-level grants for anon and authenticated on several/all common commands, but the absence of RLS policies should deny row access to those roles. Treat that as a potential availability/feature defect and a policy-design task, not proof of an exposed-data leak. Validate each table's purpose, whether it should be API-accessible at all, and the exact least-privilege policy. Revoke unnecessary grants from anon/client roles where appropriate, rather than relying on RLS alone.

### P1 — Identity, role and tenant isolation

Relevant existing tables include organizations, tenants, profiles, roles, profile_roles, permissions, role_permissions, permission_scope_grants, groups, group_memberships, departments, organizational_units, devices, integration_connections, and audit_events.

Observed policies are not uniform: for example, profiles and profile_roles have self-read policies, organizations has a membership read policy, tenants has a membership/admin read policy, groups has an organization/tenant read policy, and devices/integration connections have role-based policies. This is a useful base but does not prove the complete authorization model.

Read-only consistency checks found **0** mismatches for:
- profile tenant vs tenant organization;
- group tenant vs tenant organization;
- device tenant vs tenant organization;
- profile-role tenant vs tenant organization.

These checks only cover existing rows and the listed joins; they do not prove constraints prevent future mismatches or validate every table. Review composite foreign keys/constraints or trusted mutation logic so a row cannot reference an organization and a tenant belonging to different organizations. Check that a device's assigned profile and organizational unit are in the same tenant/organization. Check that group memberships cannot connect a user to another tenant's group.

The current profiles_read_self policy only allows users to read their own profile. Any employee-directory browse/search requirement will need a deliberately scoped policy/API, not a broad expansion to all authenticated users.

### P1 — Authentication hardening

The Supabase advisor reports **leaked-password protection disabled**. Enable this in Auth configuration after confirming the intended password-based login experience and recovery flow. This is a project setting, not a SQL table change. Also review MFA requirements for privileged roles, session/token lifetime, recovery abuse protections, email confirmation, and account lockout/rate limiting.

### P2 — Performance and integrity

The performance advisor reports **23 foreign keys without covering indexes**. Review the list and add indexes only where query patterns, cascade operations, and table sizes justify them. Prioritize foreign keys on identity, tenant, group membership, device assignment, audit, ticket, and provisioning relationships; avoid duplicate indexes.

Existing uniqueness constraints observed include:
- unique employee global ID on profiles;
- organization-scoped group key;
- organization-scoped department name;
- organization-scoped organizational-unit path;
- organization-scoped tenant slug;
- unique permission key;
- role-permission-scope uniqueness.

These are useful but do not replace required uniqueness for external provider identity mappings, idempotency keys, or provisioning source records, which must be designed if not already represented elsewhere.

### P2 — Audit and operations

The audit table supports organization/tenant and actor references plus action, resource, outcome, request ID, and event data. Review who can insert/update/delete audit rows, ensure ordinary users cannot forge privileged events, and avoid secrets or unnecessary sensitive data in event payloads. Confirm retention and export policy, backup/restore, and monitoring. Edge Functions listing was empty; this does not mean no backend exists, only that no Supabase Edge Functions were returned by that tool.

## Relationship and policy verification still required

This initial pass did not yet test every relationship or endpoint. Before any production schema changes, continue with:
1. Inventory all foreign keys and identify organization/tenant cross-reference patterns, nullable tenant scopes, cascade-delete risks, and unvalidated constraints.
2. Review all RLS policy expressions and policy combinations, including permissive-policy OR behavior and UPDATE USING/WITH CHECK.
3. Inventory table/sequence/function/schema privileges for anon, authenticated, and service roles; review views/materialized views and RPC exposure.
4. Review all SECURITY DEFINER and trigger functions, search paths, ownership, execute grants, and mutation side effects.
5. Inspect triggers and event triggers; confirm rls_auto_enable is only an RLS enablement safeguard and not mistaken for policy creation.
6. Run test cases as anon, ordinary user, tenant admin, organization admin, security admin, and platform admin using test identities; verify negative cross-tenant attempts fail.
7. Check storage buckets and object policies, Auth configuration, secrets exposure, and frontend use of privileged keys.
8. Inspect the application code and API calls to map every data pathway to the policies it depends on.
9. Run data-integrity checks for orphaned references, duplicate logical identities, circular organization/department/OU hierarchies, and cascade-delete impact.
10. Add migrations only after each proposed policy/schema change is reviewed and backed by reproducible tests.

## Remediation strategy

1. Freeze destructive schema changes while the audit is in progress.
2. Triage security-definer knowledge-base functions and privilege assignment paths first.
3. Classify the 24 no-policy tables; remove unnecessary client grants or create narrowly scoped policies backed by tests.
4. Harden and test tenant/organization consistency in relationships and writes.
5. Enable leaked-password protection and review privileged-user MFA/session settings.
6. Add justified indexes from the 23-item performance report.
7. Build a repeatable authorization test matrix and run advisors again after changes.
8. Add directory-specific tables only after confirming no equivalent existing table is suitable.

## Scope limitations

- No database writes or schema changes were performed in this audit.
- No policy was changed, and no function was modified or revoked.
- No live authentication session or application API was exercised as different users.
- No penetration test, external vulnerability scan, load test, or 100,000-user test was performed.
- The Supabase advisors are automated signals, not a complete security verdict.
- Findings are time-sensitive; rerun catalog queries and advisors immediately before applying remediation.


### P1 — Excessive table-level grants to anonymous role

A follow-up privilege inventory found table-level grants on **86 of 91 public tables for the anon role** (602 grant entries across those tables), **91 of 91 for authenticated** (620 entries), and **91 of 91 for service_role** (637 entries). This is not by itself proof of data exposure because RLS policies still govern row access for roles subject to RLS, and the anonymous role does not bypass RLS. However, broad grants are unnecessary attack surface and make mistakes in future policies more consequential.

Action: generate a per-table privilege matrix, determine which tables truly need anonymous access, and revoke unnecessary anon grants (and unnecessary client privileges) through reviewed migrations. Keep RLS as a separate required control. Test any intended public catalog/landing-page reads explicitly after privilege changes. Do not perform a blanket revoke without mapping current application behavior.
