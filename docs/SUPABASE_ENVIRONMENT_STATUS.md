# Supabase Environment Status — Build 001

Verified: 2026-10-23

## Connected project
- Organization: Maximus-Optimus
- Project: Maximus-Oprimus's Project
- Project ref: odgahlgnvhpluapfhlpt
- Region: us-east-1
- Status at verification: ACTIVE_HEALTHY

## Database migration
- Migration: `20261023054916_initial_command_center_environment`
- Applied through the connected Supabase integration and verified by querying the database.

## Seeded synthetic environment
- Organizations: 4 (IntelliStack Chicago pilot plus Northstar Property Group, BluePeak Logistics, Cedarstone Advisory)
- Departments: 13
- Profiles: 121 (100 internal Chicago pilot employees, 15 tenant test users, 6 time-limited contractor test profiles)
- Roles: 16
- Permissions: 19
- Role-permission mappings: 304
- Tenant memberships: 21
- Sample assets: 100
- Sample tickets: 8
- Sample work items: 5
- Workflow templates: 7
- Knowledge articles: 7 draft/sample articles
- Notifications: 4 sample notifications
- Audit events: 3 seed events
- Integration registry entries: 11
- App settings: 6

## Security boundary
All application tables have row-level security (RLS) enabled. Client-facing policies have intentionally **not yet** been created, so application client access remains deny-by-default until the authorization model is implemented and tested. Do not turn on broad policies simply to make the UI work.

The seed records are synthetic and are not Supabase Auth users. No real sign-in accounts were created. Demo profile role labels do not themselves grant working application permissions.

The existing `public.rls_auto_enable()` SECURITY DEFINER function was found callable by public client roles. Execute permission was revoked from PUBLIC, anon and authenticated; service_role and the database owner remain unchanged.

## Integrations not yet verified
Vercel deployment linkage, Netlify project linkage, identity-provider sign-in, Microsoft 365, Google Workspace, AWS, endpoint/remote support and live threat-intelligence feeds remain unconfigured or unverified. The registry labels these honestly.

## Next implementation steps
1. Create and test explicit least-privilege RLS policies and server-side authorization checks.
2. Add a safe role-switching Explorer preview for synthetic profiles; keep it separate from real authentication and never let it bypass server authorization.
3. Add ticket/workflow transitions, approval history and append-only audit behavior.
4. Connect the frontend using only publishable client credentials; never expose service-role or secret keys.
5. Add automated cross-tenant and role-boundary tests before enabling client access.
6. Track the SQL migration source in GitHub and verify Vercel's linked repository, branch and deployed commit.
