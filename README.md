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


## Build 011 — login and command center visual refresh
- Added a dark blue enterprise login gateway aligned with the supplied reference: employee/contractor, business/employer, and tenant environments; email/password fields; provider placeholders; and a clearly labeled Quick Access preview.
- Quick Access enters the local visual preview only. It does not authenticate users or grant backend access; the login form remains a non-production placeholder until Supabase Auth or another identity provider is configured.
- Reworked the home screen around a pinned profile identity area, Company Global ID and User Global ID, global clock, sample news feed, My Quick Picks, Bring the Work to You, and a persistent HelpBuddy rail.
- Added draggable home modules with local ordering persistence. Pinned identity identifiers remain outside the draggable modules.
- Added HelpBuddy module selection controls and a logout navigation action after each major hamburger-menu section. The hamburger navigation remains independently scrollable.
- Inline JavaScript syntax was checked. Deployment and real-browser visual verification have not yet been performed.


## Build 012 — IntelliStack Marketplace
- Added a hamburger-menu entry for **IntelliStack Marketplace** and **Build Your Environment**.
- Added an interactive product catalog with search and category filtering, product details, estimated monthly and annual stack costs, starter package selection, a build review step, cart management, simulated checkout, and local demo order history.
- Marketplace cart, environment selections, and demo orders are stored in browser local storage only. Payment processing, live pricing, subscriptions, entitlements, and service provisioning are not connected.
- The Marketplace is responsive for narrow/mobile layouts and uses the existing Command Center page shell.
- Inline JavaScript syntax and required Marketplace implementation markers were checked. Real-browser visual verification and deployment confirmation remain pending.


## Build 022 — operational continuity
- Build ledger, main-branch workflow, verification checklists, deployment smoke-test procedure, troubleshooting guide, rollback procedure, and release-status definitions are maintained in [docs/OPERATIONS_AND_BUILD_CONTINUITY.md](docs/OPERATIONS_AND_BUILD_CONTINUITY.md).
- Build 022 is a documentation-only update. It does not claim new application functionality, Supabase writes, a production deployment, or live-browser verification.


## Build 023 — Marketplace package and entitlement matrix
- Added [docs/MARKETPLACE_PACKAGE_ENTITLEMENT_MATRIX.md](docs/MARKETPLACE_PACKAGE_ENTITLEMENT_MATRIX.md), documenting the six existing Supabase draft packages, the proposed six-tier customer model, the frontend/database catalog mismatch, entitlement guardrails, and a phased synchronization plan.
- The review was read-only. No Supabase rows/schema, prices, checkout settings, subscriptions, or entitlements were changed. RLS policy correctness and live Marketplace integration remain unverified.

## Build 024 — selected Marketplace package language
- Selected customer-facing tiers: **IntelliStack Starter, IntelliStack Business, IntelliStack Professional, IntelliStack Workforce, IntelliStack Enterprise, and IntelliStack Full Stack**.
- Updated [docs/MARKETPLACE_PACKAGE_ENTITLEMENT_MATRIX.md](docs/MARKETPLACE_PACKAGE_ENTITLEMENT_MATRIX.md) to record the naming decision and distinguish selected names from unapproved proposed prices and draft database records.
- This was documentation-only. No app code, Supabase data/schema, checkout, subscriptions, or entitlements changed. Deployment and live-browser verification are not claimed.

## Build 025 — Marketplace customer buying guide
- Updated the Marketplace with six IntelliStack package cards, intended customer fit, proposed inclusions and caveats, an internal side-by-side tier comparison, and a category-level comparison with Microsoft 365, Jira Service Management, Freshservice, and ManageEngine ServiceDesk Plus.
- Added [docs/MARKETPLACE_CUSTOMER_BUYING_GUIDE.md](docs/MARKETPLACE_CUSTOMER_BUYING_GUIDE.md) with the full customer-facing copy, competitor comparison rationale, pricing caveats, and launch gates.
- Paid package prices remain proposed, package purchase buttons are disabled, and existing standalone product estimates remain explicitly illustrative. No Supabase data/schema, live pricing, payments, subscriptions, or entitlements changed.
- Browser rendering, JavaScript syntax, and mobile/tablet verification remain to be completed before calling the UI release verified.

## Build 026 — Organization size and package fit
- Added a Marketplace planner where customers enter organization headcount, estimated IntelliStack accounts, and primary use case to receive a preliminary tier recommendation and compare all six proposed packages.
- Added [docs/ORGANIZATION_SIZE_PACKAGE_PLANNER.md](docs/ORGANIZATION_SIZE_PACKAGE_PLANNER.md) documenting the recommendation bands, assumptions, pricing-model decision, and implementation gates.
- The current draft assumes flat organization pricing; headcount affects fit guidance, not price. Seat limits and prices are not approved. No live directory lookup, billing, Supabase changes, subscriptions, or entitlements are connected. Inline JavaScript syntax passed; browser/device verification remains pending.


## Build 027 — IntelliStack New Active Directory architecture
- Added [docs/INTELLISTACK_NEW_ACTIVE_DIRECTORY_ARCHITECTURE.md](docs/INTELLISTACK_NEW_ACTIVE_DIRECTORY_ARCHITECTURE.md), establishing the native IntelliStack directory direction and covering Identity Center, Organization Directory, Groups & Access Manager, Device Directory, Identity Security Center, directory synchronization, bulk imports, automated provisioning, enterprise integrations, tenant security, scale testing and phased delivery.
- Defines 100,000 employees as a design target requiring measured load tests—not a current capacity claim.
- This is an architecture and planning milestone. No application code, Supabase schema/data, authentication, provisioning, or external connector was changed or activated. Next step is a Phase 0 audit of the current app and database schema before implementation.


## Build 028 — Initial read-only database security audit
- Added [docs/BUILD_028_DATABASE_SECURITY_AUDIT.md](docs/BUILD_028_DATABASE_SECURITY_AUDIT.md) documenting the first read-only Supabase audit pass and prioritized remediation plan.
- Initial verified inventory: 91/91 public tables have RLS enabled; 24 tables have no RLS policies; 4 SECURITY DEFINER functions are executable by authenticated users; leaked-password protection is disabled; performance advisor reports 23 foreign-key indexes to review. Initial cross-organization/tenant consistency checks returned zero mismatches for profiles, groups, devices, and profile-role records in the tested joins.
- No Supabase schema/data, policy, or function changes were made. Next step is deeper pathway/relationship review and then narrowly scoped, tested remediations.
