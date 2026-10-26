# Build 027 — IntelliStack New Active Directory Architecture

**Status:** Architecture baseline and implementation plan; not production implementation  
**Branch:** `main`  
**Product:** IntelliStack Systems — IntelliStack New Active Directory  
**Scope:** Native directory, identity lifecycle, group and access management, devices, bulk provisioning, synchronization, and enterprise integrations

> This document records the agreed direction and proposed architecture. It does not claim that enterprise authentication, directory protocols, automated provisioning, or 100,000-user scale has been implemented or tested.

## 1. Product decision

IntelliStack New Active Directory (ISNAD) is a first-party IntelliStack platform service, not merely a visual wrapper around Microsoft Active Directory. It will have its own native identity and directory data model and will integrate with external identity sources when customers need them.

The product must support both:
- **Native IntelliStack directory:** customers manage organization identities and directory structures within IntelliStack.
- **Connected enterprise directories:** customers can synchronize approved identities and groups from existing identity providers/directories.

External directory integrations complement ISNAD; they do not replace IntelliStack's tenant isolation, authorization, or audit requirements.

## 2. Core management centers

### 2.1 Identity Center
- Unique immutable IntelliStack user ID.
- External identity mappings keyed by provider and immutable provider subject/object ID; email is an attribute, not the primary identity key.
- Profile attributes, account status, manager relationship, department, location, employment status and lifecycle timestamps.
- Account invitation/enrollment, recovery and authentication-method status.
- Service identities separated from human users and subject to stricter scopes.
- Duplicate detection and identity reconciliation.
- Deactivation, reactivation, retention and deletion workflows governed by policy.

### 2.2 Organization Directory
- Customer organization and tenant boundary.
- Organizational units, regions, departments, teams, locations and reporting relationships.
- Explicit ownership and parent-child relationships with validation against cycles and cross-tenant references.
- Directory search, filters, import preview and export controls.
- Customer-level administrators restricted to their own tenant.
- Platform-level operators separated from customer administrators.

### 2.3 Group & Access Manager
- Security groups and dynamic groups with controlled rule evaluation.
- Role-based access control (RBAC), with scoped permissions and least privilege.
- Optional attribute-based policy checks (ABAC) where justified.
- Group-to-role and group-to-product entitlement mappings.
- Separation of role, job position, level, employment status and product subscription.
- Privileged roles protected by stronger authentication, approval and audit requirements.
- Deny-by-default behavior; authorization enforced server-side for every protected operation.
- No subscription tier or purchase grants Global Admin, cross-tenant access, or privilege escalation.

### 2.4 Device Directory
- Device identity, type, serial/asset reference, owner, assigned user, tenant, department, status and last-seen metadata.
- Lifecycle states for enrolled, active, quarantined, lost, retired and decommissioned devices.
- Device ownership and assignment history.
- Integration interfaces for endpoint management tools later; a device record alone does not mean IntelliStack manages or secures the endpoint.
- Avoid storing secrets or sensitive device credentials in ordinary directory records.

### 2.5 Identity Security Center
- Authentication and authorization event visibility.
- Audit records for account, group, role, policy, connector and device changes.
- Risk indicators and suspicious-event alerts as future capabilities, not assumed working behavior.
- Access reviews, privileged-role review, dormant-account review and exception expiry.
- Session revocation and credential reset/recovery orchestration where supported by the authentication service.
- Security event retention, export, investigation references and tamper-resistant audit design.
- Break-glass administrative process with strict controls, alerting and periodic review.

## 3. Lifecycle automation and enterprise capabilities

### 3.1 Directory synchronization
- Connector registry with per-tenant configuration, scopes, health, last successful sync and error state.
- Full synchronization and incremental/delta synchronization where the source supports it.
- Attribute mapping, normalization, conflict policy and source-of-authority configuration.
- Preview/dry-run mode before first sync and before destructive changes.
- Checkpoints, idempotency, rate limits, retries with backoff, dead-letter/error queue and reconciliation reports.
- Explicit handling of connector revocation, expired credentials, API throttling and source outages.
- No silent overwriting of a locally managed attribute when its ownership is not defined.

### 3.2 Bulk import and provisioning
- CSV initially; versioned API and standards-based connector options later.
- Upload validation, schema/template version, field mapping, duplicate checks and row-level error reports.
- Dry-run report with create/update/no-op/skip/error counts before execution.
- Background job queue; bounded batches; concurrency limits; resumable jobs; idempotency keys.
- Job pause/cancel/retry controls and complete per-row outcome tracking.
- Safe rollback/compensation plan for partial jobs; never assume a multi-record import is one atomic transaction.
- No plaintext passwords in import files, logs, exports or job reports.
- Pilot cohort, staged rollout and automatic stop conditions for elevated error rates.

### 3.3 Automated user provisioning
- Joiner, mover, leaver lifecycle: create, update, suspend, restore and deprovision.
- Group and product access derived from approved policies and source attributes.
- Manager/owner approvals for sensitive or exceptional access.
- Employee departure defaults to access revocation/deactivation and retention of required records, not indiscriminate hard deletion.
- Reconciliation jobs detect drift between source state and IntelliStack state.
- Access removal must be prioritized and observable; retries and failure alerts must be explicit.

### 3.4 Enterprise integration roadmap
- Authentication: OIDC and SAML 2.0 SSO; MFA/passkey support depends on the selected identity/authentication implementation.
- Provisioning: SCIM 2.0 where supported by both sides; connector-specific APIs as needed.
- Directory connectivity: carefully scoped connectors for Microsoft Entra ID, Active Directory environments, and other customer identity sources.
- HRIS imports and webhooks for authoritative employment lifecycle data.
- Endpoint management and asset tools for device data.
- SIEM/security event export, ticketing, notification and audit export integrations.
- Secrets stored in managed secret storage, never committed to source code or exposed in client-side code.
- Connector credentials scoped per tenant and rotated/revoked under policy.

Protocol compatibility must be proven by implementation and conformance/integration testing. Listing a protocol here is a planned capability, not a claim that it is currently supported.

## 4. Reference architecture

1. **Admin UI:** Directory Explorer, identity profile, organization tree, groups/access, devices, connector setup, provisioning jobs and audit views.
2. **Authenticated API:** validates session/token, tenant context, requested action and authorization on every request.
3. **Identity service:** native user identities, external identity mapping, enrollment and account lifecycle.
4. **Directory service:** organizations, units, groups, memberships, attributes and device records.
5. **Policy/authorization service:** server-side RBAC and scoped policy decisions, with a deny-by-default posture.
6. **Provisioning workers:** asynchronous imports, sync jobs, reconciliation, retries and job progress.
7. **Connector adapters:** isolated provider-specific mapping and API logic.
8. **Audit/event pipeline:** records sensitive actions and job outcomes; supports monitoring and investigation.
9. **Persistence layer:** tenant-aware schema, indexes, constraints, migrations, backup and recovery.
10. **Observability:** metrics, structured logs, traces, alerts and operational dashboards without leaking secrets or unnecessary personal data.

The browser is an administration surface, not a trusted authorization boundary. UI hiding alone is not access control.

## 5. Foundational data entities (logical model)

The exact schema must be reconciled with the existing Supabase project before migrations are written. Do not create duplicate tables before reviewing current structures and policies.

- `organizations` / `tenants`: customer boundary and lifecycle.
- `organizational_units`: hierarchy, department, team and location nodes.
- `directory_users`: native human identity and profile attributes.
- `external_identity_links`: provider, immutable external subject, internal user, tenant and sync metadata.
- `directory_groups` and `group_memberships`: groups and membership provenance.
- `roles`, `permissions`, `role_permissions`, `user_role_assignments` / group-role assignments: scoped authorization.
- `directory_devices`: inventory and assignment metadata.
- `identity_providers` / `directory_connectors`: per-tenant configuration metadata; secrets held outside ordinary rows where possible.
- `attribute_mappings` and `sync_cursors`: mapping rules and checkpoints.
- `provisioning_jobs` and `provisioning_job_items`: status, counters, row outcomes and retry state.
- `access_reviews` and `access_review_items`: review campaigns and decisions.
- `identity_audit_events`: actor, tenant, action, target, outcome, timestamp and correlation ID.
- `security_events`: relevant detections and investigation references.
- `idempotency_records`: safe replay protection for supported mutation APIs.

Names above are conceptual, not approved table names. Authentication secrets, password hashes and provider tokens must be managed by a purpose-built authentication service or secure secret store, not improvised in profile tables.

## 6. Multi-tenant security requirements

- Every tenant-owned record must have a tenant boundary and validated relationships.
- Every API operation must derive or validate tenant context from a trusted authenticated session; never trust a client-supplied tenant ID by itself.
- Database row-level security (RLS), server-side authorization and foreign-key/constraint design must reinforce one another.
- Cross-tenant access tests must cover reads, writes, exports, search, background jobs, caches and connector callbacks.
- Platform Global Admin access is separate, tightly controlled and audited.
- Customer organization administrators can only administer their own organization and permitted delegated scope.
- Sensitive actions require recent authentication and/or approval where appropriate.
- No secrets in browser local storage, logs, CSV reports or source control.
- Protect against account enumeration, invitation abuse, replay, CSRF where applicable, token leakage, excessive API requests and insecure direct-object references.
- Audit events must capture actor, target, tenant, action, outcome, timestamp and correlation/job identifier without recording passwords, access tokens or unnecessary sensitive fields.
- Define retention, privacy, export and deletion policies before production use.

## 7. Scale and reliability goals

A 100,000-employee customer is a design target, not a current verified capacity claim.

- Asynchronous jobs with configurable bounded batches and concurrency.
- Indexed tenant-scoped queries and pagination; avoid loading the entire directory into one browser request.
- Incremental synchronization where possible and periodic reconciliation.
- Rate limiting, backpressure, retry with jitter, checkpoints and dead-letter handling.
- Separate performance targets for stored users, bulk import throughput, concurrent authentication, search latency, group evaluation and lifecycle deprovisioning.
- Load-test representative data and concurrency; test partial failure and recovery.
- Establish backup, restore, disaster recovery, monitoring and incident procedures.
- Use a staged scale ladder: small test cohort, 1,000 identities, 10,000, then 100,000, only advancing after agreed security/performance gates.
- Publish measured results, test conditions and known limits rather than marketing a number without evidence.

## 8. Admin experience and navigation

Proposed Global Command Center navigation:
- IntelliStack New Active Directory
  - Overview
  - Identity Center
  - Organization Directory
  - Groups & Access Manager
  - Device Directory
  - Identity Security Center
  - Directory Synchronization
  - Bulk Import & Provisioning
  - Enterprise Integrations
  - Access Reviews
  - Audit & Reports
  - Settings & Policies

The first implementation should show honest capability status. Unimplemented integrations should be labelled planned/not connected; mock records must be clearly identified as demo data. Every detail view should have a reliable return path and work on phone/tablet layouts.

## 9. Phased implementation plan

### Phase 0 — Discovery and schema audit
- Inspect current `main` application structure and current Supabase tables, relationships, indexes and RLS policies.
- Map existing users, profiles, tenants, organizations, groups, roles, devices and audit structures.
- Identify what can be reused and where identity conflicts exist.
- No production schema/data writes until this audit is complete.

### Phase 1 — Native directory foundation
- Approve logical data model and tenant invariants.
- Implement directory navigation and read-only directory views against safe test/demo data.
- Establish server-side authorization and audit contracts before privileged mutations.
- Add schema migrations only after review and tests.

### Phase 2 — Identity and access controls
- Implement identity records, groups, memberships, scoped roles, policy evaluation and access audit.
- Add invitation/enrollment integration with a chosen authentication service.
- Test tenant isolation and privilege boundaries.

### Phase 3 — Bulk imports and provisioning
- CSV template, preview, validation, background job tracking, idempotency, retries and row-level reports.
- Pilot with a small controlled cohort before larger imports.

### Phase 4 — Synchronization and enterprise connectors
- Connector configuration, secure credential handling, source-of-authority rules, delta/full sync and reconciliation.
- Implement and test OIDC/SAML/SCIM integrations according to selected providers and supported contracts.

### Phase 5 — Devices, security center and access reviews
- Device inventory/lifecycle, access review campaigns, audit search, alerting and export.
- Add endpoint/security integrations only when their APIs and scopes are validated.

### Phase 6 — Scale, resilience and launch readiness
- Staged load tests up to 100,000 identities.
- Security testing, recovery drills, monitoring, operational runbooks and documented limits.
- Production launch only after acceptance gates pass.

## 10. Definition of done and release gates

Do not call ISNAD production-ready until all applicable gates pass:
- Tenant isolation verified in database and API tests.
- Server-side authorization verified for every sensitive operation.
- Authentication and account recovery security reviewed.
- Import/sync jobs are idempotent, observable, resumable and tested for partial failure.
- Audit coverage exists for sensitive identity/access changes.
- Secrets and personal data are handled according to approved policies.
- Backup/restore and incident response procedures tested.
- Performance results exist for agreed concurrency and 100,000-user scenarios.
- Accessibility and mobile/tablet flows tested.
- Deployment commit and live smoke tests verified.

## 11. Build 027 acceptance record

- **Build:** 027 — IntelliStack New Active Directory architecture baseline.
- **Scope:** Requirements and implementation roadmap only.
- **Database changes:** None authorized by this document.
- **Authentication/provisioning integrations:** Not implemented or verified by this document.
- **Scale claim:** 100,000 users remains a target requiring measured load tests.
- **Next engineering action:** Perform Phase 0 schema/application audit before implementation changes.
