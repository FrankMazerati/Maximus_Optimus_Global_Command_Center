# Maximus Optimus Global Command Center

## Current build
Visual-first foundation for the Optimus Maximus command center.

### Implemented in this foundation
- Four-role login gateway: Global Admin, Employee, Contractor, Tenant.
- Command-center shell with branded header and morning message.
- Three-zone layout: independently scrollable navigation, central work area, HelpBuddy/recent activity rail.
- `Bring the Work to You.` primary workspace concept.
- Quick Picks with Create Ticket, Create Request, Calendar & Meetings, Threat Matrix and HelpBuddy.
- Workload, performance, security and global threat panels.
- Search-ready workspace overlays for Users, Devices, Tickets, meetings, governance, HelpBuddy and other tools.
- Hamburger/navigation ordering with drag-and-drop and browser persistence.
- Role-aware visual shell with mock data.

## Build order
1. Validate visual command center and login experience.
2. Expand interactive mock workflows.
3. Wire Supabase authentication, users, tenants, roles, permissions, tickets, devices, audit and workflow records.
4. Add external connectors and integrations.
5. Add security, governance, SLA/checklist and audit enforcement.

## Important
The repository is intentionally being used as a clean starting point. Real authentication, database connections and production security controls are not claimed by this visual foundation yet.

Approved login image assets can be added later using the agreed filenames:
- `globaladminloginphoto.png`
- `globaladminloginphoto2.png`


## Work2U prioritized workspace (2026-10-22)
- Permanent center-section order: Critical & time-sensitive; My primary work; Bring the Work to You; Follow-Ups & SLA Compliance; Next up & scheduled; Additional workspaces.
- Each list supports a tap/click to open a record detail view and return to the originating list.
- Follow-Up records display ticket ID, end user and Global ID, tenant/company, department, device, application, owner, status, priority, SLA deadline, last contact, next action, and history.
- The Follow-Ups & SLA Compliance module is also included in global navigation.
- The right HelpBuddy rail includes user-customizable Quick Picks for app shortcuts.
- Current records and SLA values in the static HTML are illustrative seed data. Live ticket mutations, real SLA calculation, and external integrations require backend authorization and connection wiring.
