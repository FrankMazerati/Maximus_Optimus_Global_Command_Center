# Work2U Dashboard and Follow-Up Interaction Specification

## Approved dashboard structure

The command center uses three independently scrollable zones:

1. **Left navigation** — searchable, draggable/reorderable module menu with Logout at the bottom.
2. **Center work area** — permanent work sections ordered by importance.
3. **Right rail** — HelpBuddy at a comfortable size, followed by user-configurable Quick Picks for applications such as IntelliCalendar, IntelliChat, and other authorized integrations.

The Security Posture panel is not placed in the lower dashboard slot that is reserved for the additional workspace experience. Security information belongs in the appropriate security/monitoring module and critical alert section.

## Permanent center sections

1. **Critical & Time-Sensitive** — urgent incidents, security alerts, escalations, and approvals.
2. **My Primary Work** — searchable ticket and task history, including resolved work for follow-up and reference.
3. **Bring the Work to You** — prioritized daily tasks, with a target maximum of 30 items visible at one time.
4. **Follow-Ups & SLA Compliance** — next contact/action, ticket number, end-user identity, device, affected application(s), assigned owner, deadline, SLA state, and handoff history.
5. **Next Up & Scheduled** — meetings, reminders, notes, and scheduled work.
6. **Additional Workspaces** — role-aware entry points to modules such as Knowledge Base, Device Inventory, Applications, Department Tools, Reports, and War Room.

Critical alerts must not disappear just because the daily work list is at its display cap. Completion, deferral, or other eligible work-list actions can free space for subsequent tasks.

## Touch and drill-down behavior

- Tapping a section opens its full list view.
- Tapping a row opens that record's detail view.
- Detail views should expose relevant ticket/user/device/application context and authorized next actions.
- Returning to a list should preserve the user's filters, search, and scroll position.
- The interaction pattern must be touch-friendly and keyboard-accessible, with responsive layouts on desktop, tablet, and mobile.
- Real actions (acknowledge, assign, handoff, record follow-up, escalate, resolve) must be permission-checked and audited before they modify production records.

## Follow-up and SLA data

A production follow-up record should link to:
- Ticket/incident ID, priority, status, category, assignee, queue/team, timestamps, response and resolution deadlines, SLA policy, remaining time, breach history, and escalation history.
- End-user Global ID, tenant/company, department, role, work location, and only the contact information visible to the assigned role.
- Assigned device and relevant asset metadata (asset ID, hostname, operating system, device health/last-seen where available).
- Affected application(s), application version/availability and related connector/dependency state where available.
- Last contact, last action, user response, next action, next-contact date/time, owner, notes, evidence, approvals, and handoff/audit trail.
- Workflow Companion checkpoints and completion/signoff evidence.

SLA clocks must be calculated from the real policy and timestamps. Pause/exclusion rules must follow the configured SLA policy. Do not treat demonstration counters as live metrics.

## Right-side Quick Picks

- Quick Picks is independent from the permanent center work sections.
- Users may add as many authorized application shortcuts as needed.
- The rail scrolls independently as the list grows.
- Shortcuts can be reordered/removed and saved as user preferences.
- An entry is only a shortcut until a real integration is configured, authorized, and tested; do not imply that a live connection exists solely because a card is present.

## Current implementation status

The current static HTML build includes interactive demonstration records for the five work sections, a searchable demonstration ticket history, a detail modal, and browser-local Quick Picks. The seeded example records, counts, and action buttons are **demonstration-only**. Live Supabase ticket/device/user joins, actual SLA computation, permission enforcement, audit writes, and external application integrations remain future wiring tasks.
