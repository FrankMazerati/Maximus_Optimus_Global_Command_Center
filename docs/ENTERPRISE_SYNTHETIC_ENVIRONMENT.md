# Build 001 — Synthetic Enterprise Environment

Verified: 2026-10-23
Supabase project ref: `odgahlgnvhpluapfhlpt`
GitHub repository: `FrankMazerati/Maximus_Optimus_Global_Command_Center`

## Scope and truth labels

This is a synthetic development/test environment. Company names Microsoft, Amazon, Google, Facebook and Tesla are labels for isolated fictional test tenants only. No real company accounts, live endpoint telemetry, real security detections, or external integrations were created by this seed.

## Target organizations

- IntelliStack Systems, Incorporated — 500 employee profiles plus 6 pre-existing contractor profiles in the IntelliStack organization.
- Microsoft (Synthetic Test Tenant) — 200 profiles.
- Amazon (Synthetic Test Tenant) — 200 profiles.
- Google (Synthetic Test Tenant) — 200 profiles.
- Facebook (Synthetic Test Tenant) — 200 profiles.
- Tesla (Synthetic Test Tenant) — 200 profiles.
- Harborstone Manufacturing (Synthetic Test Tenant) — 200 profiles.
- Northbridge Managed Services (Synthetic MSP) — 200 profiles.

The six customer tenants are Microsoft, Amazon, Google, Facebook, Tesla, and Harborstone Manufacturing. Northbridge is a separate MSP service-provider organization. Three older small demo tenants (Northstar Property Group, BluePeak Logistics, Cedarstone Advisory) remain intact for backward compatibility; they were not deleted.

## Verified record counts

| Area | Count |
|---|---:|
| Organizations, including older demo organizations | 11 |
| Profiles, all organizations | 1,921 |
| Roles | 35 |
| Permissions | 34 |
| Role-permission mappings | 1,190 |
| Departments | 90 |
| Tenant memberships | 1,421 |
| Profiles with a manager relationship | 1,918 |
| Directory groups | 86 |
| Directory group memberships | 5,314 |
| Device inventory records | 1,900 |
| Asset registry records | 2,000 |
| Devices linked to an asset record | 1,900 |
| Device software inventory records | 765 |
| Service desk tickets | 713 |
| Synthetic cyber incidents | 280 |
| Synthetic vulnerability findings | 640 |
| Ticket comments | 79 |
| Ticket history entries | 713 |
| Change requests | 24 |
| Approval records | 16 |
| Explicit MSP client assignments | 78 active, approved, time-bounded |
| Knowledge articles | 7 initial draft/sample articles |
| Integration registry entries | 11 |
| RLS policies across public application tables | 70 across 29 tables |

The core eight target organizations were individually checked: IntelliStack has 506 profiles (500 employee profiles plus 6 existing contractors), 500 device records, 600 asset records (including the original 100 pilot assets), 188 tickets, 35 cyber incidents and 80 vulnerability findings. Each of the six customer tenants and the MSP has 200 profiles, 200 devices, 200 asset records, 75 tickets, 35 cyber incidents and 80 vulnerability findings.

## Core data areas

- Organizations, departments, profiles, Global User IDs, manager relationships, tenant memberships
- Roles, permissions, role-permission mapping
- Directory groups and group membership
- Device inventory, asset registry and synthetic software inventory
- Service desk tickets, comments and ticket history
- Cyber incidents and vulnerability findings
- Change requests and approval records
- Work items, workflow templates/runs/steps
- Knowledge articles, notifications, audit events
- Integration registry and app settings
- MSP client assignment records with explicit permission scopes and expiry

## Supabase migrations applied

- `20261023054916_initial_command_center_environment`
- `20261023055251_expand_synthetic_enterprise_ecosystem`
- `20261023055338_tenant_scoped_authorization_policies`
- `20261023055421_harden_policy_helpers_and_role_coverage`
- `20261023055524_optimize_enterprise_rls_and_indexes`
- `20261023055630_complete_asset_hierarchy_and_msp_scope`
- `20261023055653_enforce_explicit_msp_permission_scopes`

## Still required before the environment is application-ready

- Link selected synthetic profiles to dedicated Supabase Auth test users or implement a server-side-only Explorer preview. Synthetic profiles are not login accounts.
- Test actual authenticated queries and cross-tenant denial using controlled test identities.
- Test the MSP scope array enforcement and assignment expiry/revocation through authenticated API tests.
- Implement and test approval state transitions, ticket dispatch atomicity, immutable audit writes, and workflow lifecycle logic.
- Verify the frontend's Supabase project URL and publishable key; never put service-role secrets in client code.
- Verify the current Vercel project, deployment branch and deployed commit.
- Keep integrations marked sample/unavailable/not configured until each is genuinely connected and verified.
- Performance advisor currently reports informational unused indexes on a new, not-yet-queried dataset; re-evaluate after real application query patterns exist.
