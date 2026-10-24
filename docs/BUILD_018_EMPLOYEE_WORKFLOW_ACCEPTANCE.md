# Build 018 — Employee Workflow & Control Plane

**Release:** 0.18.0 / Build 018  
**Branch:** `build-018-workflow-and-status`  
**Status:** Preview branch; not merged to `main`.  
**Purpose:** Make the next work traceable and testable. This document is a requirements and acceptance checklist, not a claim that every listed feature is already implemented.

## Implemented in this branch
- Availability selector immediately updates the visible status label and color.
- Status continues to be stored in browser-local preview storage only; this is not a shared coworker status.
- Build metadata identifies Build 018 and marks browser/deployment verification as pending.

## Employee workspace acceptance checklist
- [ ] Preserve existing employee workflow and the “Bring the Work to You” experience.
- [ ] Provide distinct Priority Work, Today’s Tasks, My Workspace, Follow-Ups & Reminders, Past & Closed Work, Notes & Saved Items, and Recent Activity sections.
- [ ] Open task details with priority, assignment, deadline, progress, actions, and a return path that preserves list context.
- [ ] Separate employee follow-ups, end-user updates, manager/vendor follow-ups, scheduled reminders, overdue items, and completed history.
- [ ] Record ticket offers, accept/pass/decline/timeout outcomes distinctly; prevent duplicate assignment with a server-side atomic claim.
- [ ] Keep position/title, system role/permissions, IntelliStack level, star balance/tier, and verified skills as separate concepts.
- [ ] Keep star awards auditable and tied to verified qualifying work; completion clicks alone must not award stars.
- [ ] Add a private professional-documents area for multiple resume/cover-letter versions, preferred versions, replacement, and removal.
- [ ] Add editable LinkedIn URL with validation and privacy controls.
- [ ] Retain a distinct, independently scrollable HelpBuddy panel with contextual task transfer, checklists, messages, approvals, and signature workflow.
- [ ] Add/verify Messaging Control Center / Developer navigation entry; if absent, mark as planned until implemented.
- [ ] Build employee, training/qualification, and developer/system knowledge bases.
- [ ] Build manager controls for roster, availability, workload, SLA, progression evidence, approvals, disputes, and audit reports.
- [ ] Ensure navigation Back/Forward and Android browser Back return to the prior internal view without losing list context.
- [ ] Keep compact responsive layouts for tablet portrait/landscape and narrow phone widths.

## Data and security acceptance checklist
- [ ] Supabase or another approved backend is the source of truth for shared status, tickets, assignments, messages, approvals, progress, and audit history.
- [ ] Enforce tenant isolation, role-based authorization, and least privilege server-side.
- [ ] Employees cannot self-award stars or change their own roles/permissions.
- [ ] Use atomic server-side ticket claims and preserve reassignment/offer history.
- [ ] Separate internal notes, end-user replies, and restricted administrative notes.
- [ ] Store documents privately and make sharing explicit.
- [ ] Append correction events rather than silently deleting audit history.
- [ ] Verify backup/recovery, session expiry, logout, and audit events before calling the system production-ready.

## Verification gate before merge
- [ ] JavaScript syntax check passes.
- [ ] Build metadata is valid JSON and reports the exact build number.
- [ ] Availability choices all update label/color consistently and restore from saved preview state.
- [ ] Main home, login, navigation, tickets, profile, HelpBuddy, and browser Back behavior are checked in a real browser at tablet and phone widths.
- [ ] GitHub Actions checks pass; investigate and repair failed checks, then rerun them.
- [ ] Vercel preview is READY and the preview URL opens successfully.
- [ ] Record what passed, failed, was repaired, and remains unverified in `app-version.json` and release notes.

## Explicit non-claims
This branch does not claim to have implemented shared backend persistence, Supabase schema/RLS, server-side ticket claiming, live news/weather, production authentication, or every checklist item above. Those require separate implementation and validation.
