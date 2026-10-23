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
