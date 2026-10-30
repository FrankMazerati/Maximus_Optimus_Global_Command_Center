# Identity and Directory Foundation
## Maximus Optimus Global Command Center

Status: implementation baseline — design and schema inspection completed; backend lifecycle implementation remains in progress.
Repository branch: `feature/unified-helpbuddy-workspace-connectors`
Supabase project: IntelliStack connected project

## Product outcome

Active Directory is the authoritative workforce identity and access workspace for the Command Center. It is not a decorative directory or a browser-local employee list.

An authorized administrator must be able to create one person record and manage that identity through onboarding, authentication, organization placement, access assignments, device and license provisioning, changes, suspension, offboarding, and audit review. The same identity must be referenced by Help Desk tickets, Bring the Work to You, Help Buddy, Workflow Companion, asset management, security, governance, and reporting.

## Canonical identity model

The system must distinguish these related but different records:

1. **Workforce person** — the durable business identity and Global User ID.
2. **Authentication identity** — the Supabase Auth user or external identity-provider subject used to prove control of a login. It is not created by merely typing an email into a directory form.
3. **Profile** — the authenticated Command Center profile, linked to the Auth UUID and the workforce person.
4. **Email addresses** — one person may have multiple addresses, each with a purpose (work, alternate, recovery/contact) and verification state. Never create duplicate people merely because one person has two addresses.
5. **Organization and tenant membership** — organization, tenant, department, organizational unit and manager relationships.
6. **Authorization assignments** — roles, security groups, scoped permissions, membership dates, assigning actor, approvals and expiration.
7. **Provisioned resources** — assigned devices, licenses, applications and services.
8. **Lifecycle and audit events** — append-only record of meaningful identity and access changes.

Global User IDs and Global Company IDs are immutable identifiers. Human-readable names, email addresses, job titles, departments and managers may change without changing the permanent identity.

## Existing database foundation observed

The connected Supabase project already contains these relevant structures:

- `organizations`, `tenants`, `departments`, `workforce_organizational_units`
- `workforce_people`
- `profiles`
- `roles`, `groups`, `workforce_role_assignments`, `workforce_group_memberships`
- `devices`, `device_assignment_history`, `device_lifecycle_events`, `device_compliance_checks`, `device_software_inventory`, `device_type_catalog`
- `license_skus`, `workforce_license_assignments`

Observed design facts:

- `workforce_people` already has a UUID primary key, Global Person ID, employee ID, organization and tenant references, department, manager-person relationship, employment status, identity source, synthetic-data flag, and directory-provider/synchronization fields.
- `profiles.id` is the authentication UUID and profiles already contain organization, tenant, department, organizational unit, Global IDs, names, work email, manager profile, member status and profile metadata.
- `devices` already contains organization/tenant, workforce person and profile assignment references, device name/type, manufacturer/model/serial/asset tag, ownership type, assignment type, enrollment and compliance state, management platform, privacy scope, remote-lock/wipe controls and lifecycle metadata.
- `device_assignment_history` already records issue, return and transfer relationships, dates, condition and approver.
- Role and group assignments already reference workforce people and the organization/tenant model.
- The current workforce and license seed data is marked as synthetic. It must not be silently represented as authenticated, real employees or purchased license entitlements.

## Required identity lifecycle

### Create
- Validate required fields and normalize email addresses.
- Check uniqueness for Global User ID, employee ID and identity email rules.
- Generate immutable identifiers server-side.
- Create the workforce person in a pending/onboarding state.
- Record organization, tenant, department and organizational-unit relationships.
- Record the initiating administrator and creation audit event.
- Do not create an Auth user from an unverified email address without the approved invitation/verification flow.

### Onboard
- Emit a durable employee-created/onboarding event.
- Create a linked onboarding work item/ticket exactly once (idempotency key based on the person and lifecycle event).
- Assign the onboarding queue and authorized technician.
- Persist acceptance, owner, timestamps, SLA, workflow steps, approvals, notes and handoffs.
- Link Help Buddy and Workflow Companion to the ticket and workforce person using persistent IDs.
- Provision only after required approvals and checks.

### Provision
- Assign organization, tenant, department, organizational unit, manager, roles and groups with scope.
- Assign available devices and licenses through transactional operations.
- Preserve assignment history; never overwrite the previous owner history.
- Verify authentication and resource access before marking onboarding complete.
- Reflect completion in the person record and ticket.

### Change, suspend and offboard
- Record every change with actor, timestamp, reason and approval where required.
- Suspend access promptly when the person is suspended or terminated.
- Revoke sessions/credentials and remove or expire access assignments according to policy.
- Return/reassign company assets and recover/revoke licenses.
- Preserve audit and asset history; do not delete historical business records merely to hide them.

## Device display and identification standard

The management interface must display the full plain-language device type. Short codes may be retained only as internal identifiers or supplementary asset-tag components.

Preferred visible names:

- Desktop Computer
- Laptop Computer
- Tablet
- Company-Owned Mobile Phone
- Employee-Owned Mobile Phone (BYOD)
- Monitor
- Docking Station
- Keyboard
- Mouse
- Headset
- Webcam
- Printer
- Scanner
- Network Switch
- Wireless Access Point
- Router
- Firewall Appliance
- Server
- Storage Appliance
- UPS / Battery Backup
- Conference Room Display
- Conference Room Video System
- Security Camera
- Badge Reader
- Other Peripheral
- Other IT Asset

An asset record must separately retain its immutable database UUID, human-readable asset tag, serial number, manufacturer, model, ownership, organization/tenant, location, status, enrollment, compliance, warranty and assignment history. The full device name is the primary label in employee profiles, inventory tables, assignment pickers, tickets, onboarding checklists and reports. Never show a user only an unexplained abbreviation.

Company-owned devices and BYOD must have distinct ownership and privacy policies. Location is only available when supported by a properly enrolled management platform, permitted by policy and applicable law, and must include source and last-observed timestamp. Do not claim continuous/live tracking when only a last check-in or last-known location is available.

## Security and authorization requirements

- Never put Supabase service-role or secret keys in browser code.
- Never grant broad table access merely to make the UI work.
- Do not disable RLS to expose workforce records.
- Authorization must use trusted server-side identity/claims and database relationships, not user-editable profile metadata.
- Every query and mutation must enforce organization and tenant scope.
- Privileged role/group assignments require explicit permission checks and audit evidence.
- Updates require both row visibility and a correct write check; tenant boundaries must be enforced on both old and new values.
- Administrative user creation/invitation must happen through a trusted server-side operation using Auth Admin credentials stored only in server secrets.
- Auth identity creation, workforce identity linkage and onboarding event creation must be idempotent and recoverable. Avoid a partially-created employee when one downstream step fails.

## Required backend service operations

Implement server-side, permission-checked operations (RPC or Edge Functions as appropriate) for:

- Create/invite workforce identity
- Verify/link authentication identity
- Update person and organization placement
- Assign/revoke roles
- Add/remove group membership
- Assign/transfer/return device
- Assign/revoke license
- Start/accept/complete onboarding
- Suspend/reactivate/offboard identity
- Read employee directory and employee detail under authorized tenant scope

Each mutation returns a durable record identifier and a clear success/failure result. Each mutation writes an audit event. The UI must refresh from persisted backend state; browser localStorage is not the source of truth.

## Active Directory interface requirements

Tabs/areas should include:

- Overview
- People
- Person profile and lifecycle
- Organization and organizational units
- Groups and membership
- Roles and access reviews
- Devices and asset assignments
- Licenses and entitlements
- Onboarding queue and workflow
- Audit history

A person profile should expose identity, organization, access, devices, licenses, onboarding, tickets, approvals and audit history without duplicating the person record.

## Current implementation boundary

The existing web client does not yet initialize a Supabase client or perform authenticated directory reads. The current login Quick Preview is explicitly a UI preview and does not authenticate or grant permissions. The current Active Directory page reports verified database inventory counts but uses a local preview roster for its people table. Keep this distinction visible until real authenticated reads and mutations are implemented and tested.

RLS currently protects the relevant tables. The inspected policies show scoped read access for some organization resources and no broad workforce-person browser access. Preserve this security boundary while implementing a trusted server-side provisioning path and properly scoped authenticated directory policies.

## Acceptance tests

1. Create a new employee with two email addresses and prove they resolve to one workforce identity.
2. Verify the primary email and link the authentication subject to the correct workforce person.
3. Confirm the person receives one immutable Global User ID and appears in the authorized directory.
4. Assign organization, tenant, department, organizational unit, manager, role and groups.
5. Trigger exactly one onboarding ticket and show the same ticket in the assigned technician's work queue.
6. Link Help Buddy and Workflow Companion to that ticket and preserve context after navigation/reload.
7. Assign a device and license; verify both appear on the employee profile and in inventory.
8. Attempt unauthorized cross-tenant reads and writes; verify they are denied.
9. Transfer or return a device and verify assignment history is preserved.
10. Suspend/offboard the identity and verify access revocation, resource recovery tasks and audit history.
11. Confirm the UI reflects database state after refresh and from a second authorized session.
12. Run build checks, security advisors and end-to-end tests before marking the foundation complete.

## Implementation sequence

1. Map current constraints, indexes, policies, triggers and relationships; identify any schema gaps before changing DDL.
2. Establish the canonical workforce-person-to-auth-profile link and verified email model.
3. Implement trusted server-side invitation/provisioning and idempotent onboarding event creation.
4. Implement tenant-scoped directory reads and role/group assignment operations.
5. Connect the Active Directory UI to persisted data.
6. Connect devices, licenses, tickets, Help Buddy and audit events.
7. Complete security, regression and end-to-end acceptance tests.

Do not declare the identity foundation complete until the acceptance tests pass against the connected Supabase project.
