# Security and Authorization Baseline

Verified: 2026-10-23
Project ref: `odgahlgnvhpluapfhlpt`

## Baseline

- Row-level security is enabled on the 29 application tables in the public schema.
- 70 RLS policies were verified across those tables.
- Supabase security advisor returned no findings after policy setup and helper-function hardening.
- Authorization helper functions live in the non-exposed `private` schema, not the public REST API schema.
- Organization-scoped reads require both membership and the appropriate permission; write paths use separate permission-gated policies.
- MSP client access is allowed only for an active, approved, unexpired client assignment, and `private.has_permission` checks the requested permission against that assignment's explicit scope array.
- MSP users do not gain general access to customer profiles, departments, work items, workflows, change requests or approvals merely because they have a client assignment.
- Audit events and ticket history have no client update/delete policies.
- App settings have no client write policy.
- Sensitive operations such as group changes, device management, cyber incident management, vulnerability remediation, approvals and change approvals require specific permissions.
- 78 MSP assignments are approved and time-bounded for synthetic testing. Assignment creation, approval, expiry and revocation still require an audited server-side workflow; clients cannot directly insert or update assignment rows.
- No broad anonymous access policy was created.

## Important limits

The RLS policies are a baseline, not a claim that every workflow is production-ready. There are currently no Supabase Auth user accounts created by the synthetic seed; the profile rows are test data only. The policy model must be validated using real authenticated test users before the frontend relies on it.

The performance advisor currently reports informational unused-index findings because the dataset has not yet been exercised by representative frontend queries. Reassess query plans after integration; this is not a claim of zero performance work remaining.

## Safe test rules

1. Create dedicated test Auth users only through the approved test-user workflow.
2. Link each test Auth user to exactly one intended profile.
3. Verify a user can read only their organization and explicitly authorized membership scopes.
4. Test denied access directly against Supabase APIs, not only hidden/disabled UI controls.
5. Test privilege escalation, profile updates, tenant ID tampering, group membership changes, exports, and approval bypass.
6. Test MSP access for an allowed permission, an out-of-scope permission, an unassigned client, and an expired/revoked assignment.
7. Never use production credentials, real employee data, or real endpoint actions in the synthetic tenant tests.
8. Keep the Supabase service-role key server-side only.
9. Record the migration and deployed commit used for each acceptance test.

## Zero-trust job-title and role policies

- A dedicated `job_title_permission_policies` table stores an explicit allow/deny decision for each permission against each existing job-title + role combination.
- Initial policy rows were generated from the existing role-permission baseline. Existing role grants are not silently broadened; missing role grants become explicit denials.
- A profile insert or role/job-title change automatically creates the corresponding policy rows for its job-title + role combination.
- The permission evaluator now requires the role grant and matching job-title policy for ordinary access. An approved temporary access request can add a narrowly scoped, time-limited permission without changing the user's permanent role.
- Current verification: 1,921 profiles, 34 permissions, 2,652 job-title/role/permission policy rows, and zero profiles missing a policy set.
- This is a policy baseline, not proof that every profile has a corresponding Supabase Auth login. Auth-user linking and authenticated end-to-end tests remain required.

## HelpBuddy access request workflow

- The Ticket Situation Simulator now includes a HelpBuddy access-request panel: permission, team/company scope, business justification, optional ticket/project reference, and duration from 1 hour through 30 days.
- Requests are created through `public.request_access`; the request does not grant access until an authorized approver approves it.
- Decisions go through `public.decide_access_request`, which rejects self-approval, validates organization membership, applies team/company approval rules, and requires Super Admin / IT Admin / Tenant Admin approval for privileged or critical permissions.
- Approved access has a fixed start and expiry time. The effective permission check requires an active organization scope and an unexpired approved grant.
- Request, approval, and denial events are appended to `audit_events`. Access request rows are protected by RLS and approval visibility is scoped by requester, approver, manager/team relationship, and authorized administrators.
- Database security advisor check after these changes: no findings. The performance advisor reports informational unused-index notices for the not-yet-exercised application dataset; the new foreign-key indexes and auth-initplan warning were addressed, and the advisor should be rerun after frontend testing.

## Access request acceptance tests still required

1. An ordinary employee can request a denied permission and sees it remain denied until approval.
2. A user cannot approve their own request.
3. A manager can approve a valid team-scoped request only for an eligible report/team member.
4. A company-scoped request follows the company approval route.
5. A privileged/critical permission cannot be approved by an ordinary manager.
6. An approved permission works only for the requester, target organization, approved scope, and active time window.
7. The permission is denied again after expiry or revocation.
8. A different tenant cannot read or decide the request.
9. Every request and decision appears in audit history.
10. UI hiding is not treated as authorization; verify every case through authenticated API/RLS calls.

