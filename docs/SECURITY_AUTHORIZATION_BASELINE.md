# Security and Authorization Baseline

Verified: 2026-10-23
Project ref: `odgahlgnvhpluapfhlpt`

## Baseline

- Row-level security is enabled on the 28 application tables in the public schema.
- 69 RLS policies were verified across those tables after splitting read and write policies.
- Supabase security advisor returned no findings after policy setup and helper-function hardening.
- Authorization helper functions live in the non-exposed `private` schema, not the public REST API schema.
- Policies scope organization-owned records through the authenticated profile and active tenant memberships.
- Role permissions are checked separately from organization membership.
- Audit events and ticket history have no client update/delete policies.
- App settings have no client write policy.
- Sensitive operations such as group changes, device management, cyber incident management, vulnerability remediation, approvals and change approvals require specific permissions.
- No broad anonymous access policy was created.

## Important limits

The RLS policies are a baseline, not a claim that every workflow is production-ready. There are currently no Supabase Auth user accounts created by the synthetic seed; the profile rows are test data only. The policy model must be validated using real authenticated test users before the frontend relies on it.

The MSP has its own organization and 200 synthetic staff profiles. The MSP is not automatically granted access to any customer tenant. Cross-client support must require an explicit, time-bounded client assignment, approved scope and audited access; a group label alone is not authorization.

The performance advisor currently reports informational unused-index findings because the dataset has not yet been exercised by representative frontend queries. Reassess query plans after integration; this is not a claim of zero performance work remaining.

## Safe test rules

1. Create dedicated test Auth users only through the approved test-user workflow.
2. Link each test Auth user to exactly one intended profile.
3. Verify a user can read only their organization and explicitly authorized membership scopes.
4. Test denied access directly against Supabase APIs, not only hidden/disabled UI controls.
5. Test privilege escalation, profile updates, tenant ID tampering, group membership changes, exports, and approval bypass.
6. Never use production credentials, real employee data, or real endpoint actions in the synthetic tenant tests.
7. Keep the Supabase service-role key server-side only.
8. Record the migration and deployed commit used for each acceptance test.
