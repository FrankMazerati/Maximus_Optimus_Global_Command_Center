# 15. Integration & Migration Knowledge

**Status:** Adoption framework. Connector availability and supported operations must be validated individually.

## Purpose
Help organizations connect IntelliStack/Maximus Optimus to existing systems incrementally, coexist safely, and converge only when they choose.

## Knowledge sections
- Connector catalog and support status.
- Identity, SSO, provisioning, groups, and access mapping.
- Data discovery, mapping, quality, migration, and validation.
- Coexistence patterns and system-of-record ownership.
- Guided trial, pilot, rollout, cutover, rollback, and support.
- API/authentication prerequisites, limits, monitoring, troubleshooting, and version compatibility.

## Six-stage adoption walkthrough
1. **Discover:** inventory systems, owners, data types, dependencies, requirements, and constraints.
2. **Prepare:** define scope, test environment, least-privilege permissions, baseline, data handling, and rollback.
3. **Connect:** start with the smallest useful scope; use read-only access where supported and appropriate.
4. **Pilot:** validate with a limited group, compare source/target records, and collect feedback.
5. **Expand:** add connectors and users in controlled waves with checkpoints and support coverage.
6. **Converge by choice:** consolidate workflows/data only after the customer validates readiness and approves cutover. A hybrid environment can remain a valid end state.

## Connector record template
Name; category; owner; supported product/version; status (available/tested, in development, planned, or custom required); authentication method; scopes/permissions; data read/write behavior; prerequisites; rate/size limits; setup steps; test evidence; monitoring; failure modes; troubleshooting; security/privacy notes; rollback; compatibility; release date; next review.

## Migration controls
Inventory and map data fields; define source-of-truth rules; run test migrations; validate counts, relationships, permissions, and data integrity; record exceptions; obtain owner approval; schedule cutover; retain rollback options; verify post-cutover behavior. Avoid irreversible deletion until reconciliation and retention obligations are met.

## Guided trial
A trial should have a named owner, scope, dates, enabled capabilities, success criteria, data boundaries, support path, and end-of-trial decision. Trial duration and available connectors depend on the actual package/agreement; do not assume a universal duration.

## HelpBuddy safeguards
Never claim a connector is live unless its configured status and a successful test support that claim. Never perform migration, writes, cutover, or deletion without authorized workflow and explicit approvals. If validation fails, pause expansion and follow the rollback/escalation plan.