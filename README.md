# Maximus Optimus Global Command Center

## Current status

This branch contains the responsive Command Center shell plus the first implementation pass for a live HelpBuddy path. The dashboard remains a demo preview until the canonical Supabase project is confirmed, public client configuration is supplied, and the reviewed SQL migrations are applied.

## In this branch

- Responsive three-zone Command Center shell with searchable/reorderable navigation.
- Calendar, activity, World Time, News Feed, and Design Studio-related workspaces.
- Supabase client bootstrap that refuses to pretend a backend is configured when the URL/key are missing.
- Email/password authentication gateway; authenticated identity must map to a provisioned `public.profiles` row and at least one active `public.profile_roles` assignment.
- HelpBuddy service using the existing `tickets`, `ticket_steps`, `workflows`, `workflow_runs`, and `audit_events` tables.
- Deterministic VPN and account-access workflow templates. This is workflow logic, not an LLM and not a live external-system connector.
- Versioned SQL migrations for HelpBuddy work items, ticket numbering, and the first scoped access policies.
- Repeatable synthetic seed data for one demo tenant, sample devices, 25 tickets, and two workflow definitions.
- GitHub Actions validation for JavaScript syntax and required integration/security wiring.

## Important boundaries

- The SQL migrations are committed for review and **have not been applied**.
- The seed SQL is for a disposable/test environment only. Do not run it against production.
- The connected Supabase project ref currently differs from the project ref specified in the master blueprint. Confirm the canonical project before enabling the backend.
- Browser configuration may contain only the project URL and public anon/publishable key. Never expose a service-role/secret key in frontend code.
- UI visibility does not grant authorization. Server-side RLS and permission checks remain authoritative.
- Approval checkpoints are not auto-approved by HelpBuddy. Privileged remediation and real Microsoft/AWS/Active Directory changes are not connected.
- No merge to `main` or deployment has been performed as part of this work.

## Configuration

See [assets/js/CONFIGURATION.md](assets/js/CONFIGURATION.md). Define `window.MAXIMUS_CONFIG` before loading `assets/js/supabase-client.js`, and load the official Supabase JavaScript v2 SDK first.

## Validation

Run:

```sh
npm test
```

The GitHub Actions workflow runs this validation on pushes to this working branch and on pull requests. A passing static check does not replace browser QA, live RLS tests, or an end-to-end test against a confirmed test database.

## Next steps

1. Confirm the canonical Supabase project.
2. Review and apply migrations to a test environment.
3. Provision a test Auth user with a matching profile and active role.
4. Run end-to-end tests for ticket creation, workflow creation, remediation progress, tenant isolation, and audit events.
5. Add SLA policy configuration and the approval/handoff service before claiming the full simulator workflow is complete.
