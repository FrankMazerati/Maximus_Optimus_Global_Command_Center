# IntelliStack Systems — Architecture and Production Readiness Baseline
**Date:** 2026-10-25  
**Status:** Baseline for investigation and design; not a claim that these controls already exist.

## Goals
Create a consistent platform foundation for Maximus Optimus Global Command Center and future IntelliSphere modules while preserving existing employee workflows and approved visual decisions.

## Required architecture decisions
1. **Application shell:** One shared header, navigation system, route/state model, notification pattern, error handling, and responsive layout primitives.
2. **Identity:** Establish the identity provider, session lifecycle, account recovery, and trusted user identifier.
3. **Authorization:** Enforce permissions on the server/API/data layer; UI visibility is convenience, not a security boundary.
4. **Organization model:** Define organization/company, tenant, department, user membership, role, and delegated administration relationships.
5. **Domain records:** Define stable IDs and lifecycle rules for tickets, tasks, offers, follow-ups, devices, documents, meetings, messages, approvals, stars/progression, and audit events.
6. **Persistence:** Shared operational data must use an approved backend; browser storage is only for non-sensitive preferences and clearly labeled demo state.
7. **Auditability:** Record actor, action, target, timestamp, reason/context where appropriate, and correction events for sensitive changes.
8. **Integrations:** Use server-side credentials, scoped access, timeout/retry rules, and visible connection/error status.
9. **AI agent boundary:** Maximus Optimus should receive only authorized context; consequential actions require policy checks, approval where needed, and audit logging.
10. **Observability:** Record application errors and deployment health without leaking secrets or sensitive user content.

## Data/security principles
- Default deny; least privilege.
- Enforce tenant isolation server-side and test cross-tenant denial.
- Never expose service-role credentials in frontend bundles.
- Do not trust editable client metadata for roles or authority.
- Validate all input server-side and protect against duplicate submissions.
- Use atomic operations for mutually exclusive actions such as ticket acceptance.
- Store private resumes/cover letters in private storage with explicit sharing.
- Distinguish internal notes, end-user replies, and restricted administrative notes.
- Avoid claiming legal identity or signature validity from a drawn signature alone.

## Implementation approach
- First inventory current code, routes, state, data objects, authentication placeholders, and deployed behavior.
- Write a current-state diagram and proposed-state diagram before significant refactoring.
- Propose database schema and migration plan; validate against existing requirements and data before applying migrations.
- Implement one vertical workflow end-to-end (authentication/authorization → data persistence → UI → audit → tests) before scaling the pattern.
- Add regression tests for each accepted workflow and keep the release register current.

## Current known boundaries from Build 018 records
- Global search is against browser-local preview state, not a shared permission-aware search service.
- Availability state is browser-local preview state, not shared coworker presence.
- Full production authentication, backend persistence, server-side ticket claims, and browser/device verification are not established by Build 018.
