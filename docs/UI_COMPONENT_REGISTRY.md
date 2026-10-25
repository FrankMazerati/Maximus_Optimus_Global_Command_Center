# IntelliStack Systems — UI Component Registry and Checkpoint Standard

> **Purpose:** Canonical, repository-based map of the product UI. Every screen and component has a stable ID so future requests, code changes, QA results, and build notes can point to the same exact location.
>
> **Tracking label:** Build 020 — UI Component Registry
> **Status:** Documentation added on a working branch; feature implementation has not been performed by this document.
> **Repository:** `FrankMazerati/Maximus_Optimus_Global_Command_Center`
> **Related plan:** `docs/MASTER_VALUATION_AND_COMPLETION_PLAN.md`

## 1. Rules for IDs and tracking

1. Every top-level screen/environment gets a numbered section: Section 1, Section 2, Section 3, etc.
2. Every checkpoint inside a section gets a consecutive letter: 1-A, 1-B, 1-C. Do not skip letters or reuse an ID within the same registry.
3. Child components use a dotted suffix beneath their checkpoint, such as 1-A.1, 1-A.2. If deeper tracking is needed, extend consistently: 1-A.1.a. Do not create a new top-level section merely for a child control.
4. IDs are stable references, not implementation claims. A component can be Planned, In Progress, Blocked, Implemented, or Verified. Only mark Implemented/Verified when supported by code and test evidence.
5. Build numbers identify a revision; section/checkpoint IDs identify product scope. Example: Build 020 may work on 1-A and 3-B without changing those IDs.
6. When a checkpoint is split, preserve the original ID as the parent and add child IDs. When removed, mark Retired rather than silently reusing its ID.
7. Every implementation change should update this registry and, when applicable, the master plan, acceptance criteria, test evidence, and build record.
8. In code, use IDs in comments or data attributes only where they help locate a component; do not expose internal tracking IDs to end users unless useful.
9. Access control is enforced by the trusted backend, not by visual theme, client-side route hiding, or the ID registry.
10. Current registry statuses below are **Planned / Needs verification** unless a status is explicitly stated otherwise. This file does not prove that a feature is built.

## 2. Section 1 — Login and Environment Selection

**Section purpose:** The first screen users encounter, environment selection, sign-in entry, and shared login behavior.

| Checkpoint ID | Component / responsibility | Acceptance criteria | Initial status |
|---|---|---|---|
| 1-A | Login screen shell and responsive layout | Loads on phone/tablet portrait and landscape; no clipped primary controls; accessible labels and focus order. | Planned |
| 1-B | IntelliStack Systems branding and shield/logo area | Correct brand spelling; logo area is distinct from navigation controls. | Planned |
| 1-C | Login background / visual composition | Staff-at-computers and centered globe concept; composition stays readable on small screens. | Planned |
| 1-D | “Select Your Login Environment” chooser | Presents clear environment choices without implying that selecting a theme grants access. | Planned |
| 1-E | Corporate environment choice | Blue-and-white identity; label clearly communicates employee/contractor/corporate access. | Planned |
| 1-F | Marketplace environment choice | Purple-and-white identity; label clearly communicates business/employer/marketplace access. | Planned |
| 1-G | Tenant environment choice | Green-and-white identity; label clearly communicates tenant-specific access. | Planned |
| 1-H | Sign-in form and validation | Validates required fields and shows safe, understandable errors; no secrets written to logs. | Planned |
| 1-I | Remember-device / session convenience | Uses secure, supported authentication/session behavior; never stores a raw password in local storage or source code. | Planned |
| 1-J | Password recovery and account-help entry | Provides a clear recovery path when supported; does not falsely claim a live backend if unavailable. | Planned |
| 1-K | Quick Access / preview mode | Clearly marked preview/demo; never bypasses real authorization or exposes protected tenant/company data. | Planned |
| 1-L | Login footer links | Home, About Us, Platform Overview, Contact Us, Sales, Careers, Partners, Help Center, Documentation, System Status, Privacy Policy, Terms, Cookie Policy. | Planned |
| 1-M | Login legal/footer wording | Copyright 2026 IntelliStack Systems; footer phrase “Secure, Trusted & Compliant.” | Planned |
| 1-N | Login loading, failure, and empty states | Network/auth failures are visible and recoverable; no misleading success state. | Planned |

## 3. Section 2 — Tenant Environment (Green and White)

**Section purpose:** Tenant-scoped workspace and its navigation. Green-and-white styling applies consistently to tenant pages and drill-downs. Company-specific branding may appear in company information, but the IntelliStack shell remains consistent.

| Checkpoint ID | Component / responsibility | Acceptance criteria | Initial status |
|---|---|---|---|
| 2-A | Tenant environment shell and theme tokens | Green-and-white theme is applied consistently to shell, navigation, controls, active states, and child pages. | Planned |
| 2-B | Tenant landing/dashboard | Shows only the authenticated user's authorized tenant scope. | Planned |
| 2-C | Tenant/company information | Company name, logo, business details, and profile are displayed within the consistent IntelliStack shell. | Planned |
| 2-D | Tenant departments and organizational units | Lists and drill-downs are restricted to authorized tenant data. | Planned |
| 2-E | Tenant users and role assignments | Role/permission changes require authorization and auditable actions. | Planned |
| 2-F | Tenant devices and end-user directory | Devices and people are linked only through verified records and authorized relationships. | Planned |
| 2-G | Tenant settings and preferences | Tenant-specific configuration is separated from global/company configuration. | Planned |
| 2-H | Tenant reports and activity | Data scope and export permissions are enforced server-side. | Planned |
| 2-I | Tenant notifications and messaging | User preferences, tenant scope, and delivery status are clear. | Planned |
| 2-J | Tenant navigation, drill-down, and back behavior | Each child view has a stable ID and usable back path on mobile/tablet. | Planned |
| 2-K | Tenant empty/error/loading states | Missing data is distinguished from permission denial, loading, and service failure. | Planned |

## 4. Section 3 — Marketplace Environment (Purple and White)

**Section purpose:** Business/employer and worker-facing marketplace. Purple-and-white styling applies consistently throughout marketplace pages, including ShiftMatch and company drill-downs.

| Checkpoint ID | Component / responsibility | Acceptance criteria | Initial status |
|---|---|---|---|
| 3-A | Marketplace shell and theme tokens | Purple-and-white theme is consistent across navigation, buttons, active states, and child pages. | Planned |
| 3-B | Marketplace landing/dashboard | Provides a clear entry to worker opportunities, employer operations, and marketplace services. | Planned |
| 3-C | ShiftMatch navigation entry and page shell | ShiftMatch is discoverable from Marketplace navigation and opens its own identifiable page. | Planned |
| 3-D | ShiftMatch — Matched for You | Ranks eligible opportunities using documented matching factors; does not fabricate opportunities. | Planned |
| 3-E | ShiftMatch — Urgent Shifts and Today's Opportunities | Urgency and deadlines are clear; filled/expired offers are not presented as open. | Planned |
| 3-F | ShiftMatch — Upcoming, Nearby, and Saved Opportunities | Filters and distance/time assumptions are explicit; user preferences are editable. | Planned |
| 3-G | ShiftMatch — My Accepted Shifts and Work History | Acceptance, cancellation, and completion states are unambiguous. | Planned |
| 3-H | Worker availability and preferences | Supports availability, skills, qualifications, job categories, desired pay, commute/travel limits, and notification preferences where implemented. | Planned |
| 3-I | Opportunity details and accept/decline actions | Shows role, employer, location, schedule, pay, requirements, and deadline; acceptance is concurrency-safe. | Planned |
| 3-J | Personalized matching rules | Mandatory eligibility is checked first; ranking factors are documented, testable, and reviewed for unfair exclusion. | Planned |
| 3-K | In-app notification center | Shows actionable, deduplicated notices, read/unread state, and links to the relevant screen. | Planned |
| 3-L | SMS/email notification preferences and delivery | Only enabled after provider integration, user consent, quiet-hour/rate controls, and delivery/error handling exist. | Planned |
| 3-M | Employer dashboard and shift control center | Employers can view authorized shifts, status, staffing, and relevant applications. | Planned |
| 3-N | Post a job / post an immediate shift | Validates role, qualifications, headcount, schedule/time zone, pay, location, deadline, breaks, and urgency. | Planned |
| 3-O | Manage shifts, candidates, offers, and assignments | Prevents overbooking; records offer, acceptance, cancellation, and change history. | Planned |
| 3-P | Employer business profile and company information | Shows business identity and allowed company branding within the consistent purple IntelliStack shell. | Planned |
| 3-Q | On-site contact and arrival instructions | Captures check-in process, entrance/parking/transit details, arrival time, dress/ID requirements, and escalation contact; restricts sensitive details to appropriate recipients. | Planned |
| 3-R | Shift check-in and completion | Worker arrival and completion have explicit states and, where required, employer confirmation. | Planned |
| 3-S | IntelliCheck eligibility indicator | Displays only authorized verification/eligibility status; never implies that a provider check is live before integration. | Planned |
| 3-T | Marketplace products and company drill-downs | Child pages keep the Marketplace theme and stable IDs; business branding does not replace the IntelliStack shell. | Planned |
| 3-U | Marketplace navigation, mobile layout, and states | Responsive drill-down/back behavior and accessible loading/empty/error states. | Planned |

## 5. Section 4 — Global Command Center Home Screen

**Section purpose:** Main workspace after successful access. The home screen is distinct from the login screen and from the Tenant and Marketplace environments.

| Checkpoint ID | Component / responsibility | Acceptance criteria | Initial status |
|---|---|---|---|
| 4-A | Home screen shell and layout grid | Responsive workspace layout; no single static page pretending all modules are complete. | Planned |
| 4-B | Header identity and user greeting | Correct identity display; editable fields only where permitted. | Planned |
| 4-C | Job title/position and organizational role | Position and role remain distinct concepts and are permission-controlled. | Planned |
| 4-D | Company ID, User ID, and Global ID | IDs are clearly labeled and sourced from trusted records. | Planned |
| 4-E | Contact information and manager quick preview | Contact details are editable only with authorization; manager preview opens the appropriate detail view. | Planned |
| 4-F | Local time and weather | Compact top-right widget; external data status is clear if unavailable. | Planned |
| 4-G | Availability status | Available, Away, Out for Lunch, Do Not Disturb, Meeting, and Break are distinct selectable states with clear visual labels. | Planned |
| 4-H | Notification entry point | Opens the appropriate personal messaging/notification center. | Planned |
| 4-I | Hamburger menu and fixed header behavior | Menu is inside the header, independently scrollable, and contains one logout action at the bottom. | Planned |
| 4-J | Global Clock / time-zone strip | Horizontal, compact, user-configurable; maximum ten zones with add/remove/save behavior. | Planned |
| 4-K | Company News Feed Center | News is configurable by relevant department/business audience; add/remove/reorder/save behavior is explicit. | Planned |
| 4-L | Quick Picks | First five items stay prioritized; additional items are managed below or through the manager. | Planned |
| 4-M | Bring the Work to You | Shows work/tickets/tasks with priority, acceptance, notes, follow-ups, and clear status transitions. | Planned |
| 4-N | Help Buddy panel | Independently scrollable and clearly separated from the main work area. | Planned |
| 4-O | Personal Messaging Center | Supports defined message rotations and user/administrator controls once actual messaging behavior is implemented. | Planned |
| 4-P | Footer and global links | Compact link rows and exact footer phrase “Secure, Trusted & Compliant.” | Planned |
| 4-Q | Home screen responsive navigation and back behavior | Phone/tablet portrait and landscape work; drill-downs provide a back path without accidentally exiting the app. | Planned |
| 4-R | Home screen states and permissions | Each module distinguishes implemented, preview, unavailable, loading, empty, and error states. | Planned |

## 6. Section 5 — Corporate Environment (Blue and White)

| Checkpoint ID | Component / responsibility | Acceptance criteria | Initial status |
|---|---|---|---|
| 5-A | Corporate shell and theme tokens | Blue-and-white styling is consistent across corporate pages and drill-downs. | Planned |
| 5-B | Employee/contractor workspace | Content is scoped to authorized corporate access. | Planned |
| 5-C | Corporate directory and organizational structure | Organization, departments, roles, and reporting relationships use verified records. | Planned |
| 5-D | IT operations and service desk | Tickets, users, devices, knowledge base, and operational views are separately identifiable. | Planned |
| 5-E | Security, compliance, and audit | Sensitive actions and access are governed and auditable. | Planned |
| 5-F | Corporate settings and integrations | Integrations are not labeled live until connected and verified. | Planned |

## 7. Cross-section identity and access model

- A person's identity is shared where appropriate; identity is not the same thing as the current environment.
- Keep these concepts separate: **person/profile**, **job title/position**, **organizational role**, **permissions**, **active environment**, **organization**, **tenant/data scope**, and **verification status**.
- Theme selection is a presentation choice, not authorization.
- Tenant and employer/company data must be isolated by trusted server-side rules and verified database policies.
- Never store raw passwords in local storage, source files, or logs. Use the configured authentication provider and secure session handling.
- IntelliCheck identity verification, background screening, and credential verification are separate workflows. Obtain required consent and use appropriate provider/legal review before operating background screening.

## 8. Required update process for every future change

For each request or implementation:
1. Identify the exact checkpoint ID(s) affected.
2. Inspect current code and existing data model before changing anything.
3. Record the intended change and acceptance criteria.
4. Implement only the agreed scope; preserve existing working behavior.
5. Run available static checks and tests; list any checks that could not be run.
6. Update this registry status only when evidence supports it.
7. Update the master plan and build record if the change affects roadmap, completion, or valuation.
8. Record the commit SHA, branch, test results, and deployment status separately.
9. Never describe a planned or mock behavior as live.
10. Do not merge or claim production deployment unless the corresponding action is confirmed.

## 9. Initial work order

1. Inspect the existing login screen and map real code to Section 1 checkpoints.
2. Correct the environment chooser and consistent theme boundaries.
3. Map and build the Tenant environment (Section 2).
4. Map and build the Marketplace environment, beginning with ShiftMatch (Section 3).
5. Map and build the Global Command Center home screen (Section 4).
6. Map the Corporate environment (Section 5) and shared identity/access rules.
7. Add implementation evidence and test results as each checkpoint advances.

**Important:** This registry is a planning and traceability artifact. Its creation does not mean the login, Tenant, Marketplace, ShiftMatch, or Home Screen features have been implemented or verified.
