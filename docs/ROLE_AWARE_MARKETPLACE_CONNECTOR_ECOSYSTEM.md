# Role-aware Marketplace & IntelliLink Connector Ecosystem

**Build 058 proposal · 2026-10-30**  
**Repository:** `FrankMazerati/Maximus_Optimus_Global_Command_Center`  
**Status:** Catalog and product requirements; integrations are not represented as live.

## Product direction

The IntelliStack Marketplace is a business application ecosystem and procurement/configuration surface, not merely a subscription-plan picker. It combines:

1. IntelliStack product modules and capabilities.
2. External SaaS, finance, CRM, engineering, cloud, identity, security, ITSM and analytics connectors.
3. Curated bundles and role-aware discovery.
4. Six commercial package tiers, connector add-ons and usage/seat entitlements.
5. Tenant-specific connection setup, authorization, lifecycle and audit.
6. A unified view of what is available, recommended, licensed, connected, healthy and actually usable.

## Keep these concepts separate

| Concept | Meaning | Example |
|---|---|---|
| Role recommendation | Discovery relevance only | CFO sees QuickBooks and Salesforce near the top |
| Product / connector catalog | What can be evaluated or configured | QuickBooks Online, GitHub, Azure, Sentinel |
| Subscription package | IntelliStack capability/allowance level | Starter through Full Stack |
| Add-on / bundle | Separately licensed product or connector entitlement | Finance Connector Pack |
| Tenant authorization | Customer's explicit permission for a connector | CFO-authorized QuickBooks company connection |
| Connection state | Actual provider connection lifecycle | Not connected, authorization pending, connected, degraded |
| Feature entitlement | Server-enforced right to use a capability | Read financial reports, sync CRM accounts |

A recommendation never grants a permission, creates a connection, upgrades a package, or exposes tenant data.

## Role-aware discovery profiles

### CFO — Finance, revenue and financial control
Prioritize:
- Salesforce — customer, opportunity, pipeline and revenue forecast context.
- QuickBooks Online — accounting, invoices, expenses, vendors and financial summaries.
- Xero — accounting and reconciliation alternative.
- Oracle NetSuite — ERP financials and operating data.
- Stripe — payment, invoice, subscription and reconciliation events.
- Power BI and Tableau — governed finance dashboards and executive reporting.

CFO workspace examples: cash-flow and receivables overview, revenue pipeline, budget/actual variance, expense trends, close readiness, vendor spend, subscription revenue and reconciliation exceptions. These views must be sourced from authorized connected data; do not fabricate live financial metrics.

### CIO — Engineering, infrastructure, identity and security
Prioritize:
- GitHub and GitLab — repositories, pull requests, CI/CD, release and engineering delivery signals.
- Azure, AWS and Google Cloud — cloud inventory, resource health and cost visibility.
- Microsoft Entra ID and Okta — identity, groups, lifecycle and access events.
- Microsoft Intune — endpoint inventory and device compliance.
- Microsoft Sentinel and CrowdStrike Falcon — security alerts, incidents and endpoint detections.
- Datadog — logs, metrics, traces and service health.
- ServiceNow — ITSM, CMDB, incidents and change workflows.
- Atlassian Jira — delivery roadmaps and engineering work.

CIO workspace examples: engineering delivery health, cloud resource inventory/cost, identity posture, endpoint compliance, security incident queue, service availability and change risk. Privileged actions such as disabling accounts, isolating endpoints or changing cloud resources require separate scopes, approval and audit.

### CEO — Executive reporting and strategic operations
Prioritize:
- Power BI and Tableau — governed executive scorecards and board reporting.
- Salesforce — customer health, pipeline, bookings and renewals.
- NetSuite — high-level financial and operating signals.
- Asana, monday.com and Jira — strategic initiatives, portfolio milestones, dependencies and delivery status.

CEO workspace examples: enterprise scorecard, strategic initiative status, revenue and customer trends, operating risks, major incidents, cross-functional dependencies and board-reporting packs. CEO visibility is still tenant-scoped and must respect source-system permissions and sensitive-data rules.

## Catalog data contract

Canonical seed data lives at `marketplace/role-connector-catalog.json`. It defines:
- stable role, category and connector keys;
- vendor, name, description, capability tags and role-fit metadata;
- connection mode and read/write direction;
- proposed catalog status and commercial notes;
- connector lifecycle states;
- least-privilege, tenant isolation, secret handling and audit requirements.

Do not duplicate or hand-maintain separate product arrays in visual components. The UI should consume this canonical catalog through a validated data-loading layer. The current static Marketplace renderer is a local-demo experience; wiring the JSON into the page is a separate frontend task and must not be claimed until implemented and tested.

## Marketplace experience

Recommended information architecture:
1. **Marketplace Home** — role-aware recommendations, recently viewed, featured modules and connector health summary.
2. **Browse Catalog** — filters for category, vendor, role fit, product type, readiness, connection state and commercial model.
3. **Role Collections** — CFO Finance Stack, CIO Technology & Security Stack, CEO Executive Operations Stack, plus user-customizable collections.
4. **Product / Connector Detail** — use cases, capabilities, supported objects/actions, required scopes, prerequisites, data direction, security model, vendor licensing, IntelliStack entitlement, readiness and setup guide.
5. **Bundles & Solutions** — curated stacks that can mix native IntelliStack products and external connectors.
6. **Build My Environment** — select products, connectors, bundles and package; validate dependencies and incompatibilities.
7. **My Environment** — purchased entitlements, installed modules, connected accounts, owners, status, sync health, last successful sync and renewal/reauthorization needs.
8. **Admin & Governance** — approve catalog entries, publish connector versions, manage entitlements, review scopes, connection owners, audit and disconnect/revoke access.

Each listing must show distinct labels: **Available**, **Recommended for your role**, **Included in package**, **Add-on**, **Setup required**, **Connected**, **Not connected**, **Preview**, **Planned**, or **Unavailable**. Never conflate them.

## Commercial model

The six selected IntelliStack tiers remain:
- IntelliStack Starter
- IntelliStack Business
- IntelliStack Professional
- IntelliStack Workforce
- IntelliStack Enterprise
- IntelliStack Full Stack

Their exact prices, limits and final feature entitlements remain **PROPOSED — NOT APPROVED**. Connector licensing is an independent commercial dimension:
- Some connector discovery can be visible to every tier.
- A tier may include a defined number of connector slots, categories, governance features or sync allowances.
- Premium connectors or high-volume sync may be separate add-ons.
- Third-party licenses, API limits, usage charges and vendor contracts remain separate unless explicitly bundled.
- A role recommendation cannot silently move a tenant to a higher tier or activate a paid add-on.
- The catalog must explain whether a connector is included, separately billed by IntelliStack, requires a third-party subscription, or has usage-based provider costs.

Do not invent connector prices or promise unlimited connections. Define package-to-connector entitlement mapping only after pricing, support, usage and provider-cost review.

## Connection and security lifecycle

1. Authorized tenant admin selects **Connect**.
2. Explain provider, requested scopes, data objects, read/write behavior, purpose, retention, and third-party terms before consent.
3. Start OAuth/vendor authorization using a server-controlled callback and state/nonce protection.
4. Store refresh/access tokens only in a managed server-side secret vault; never localStorage, browser code, logs or repository files.
5. Validate provider identity, tenant ownership and granted scopes.
6. Create a tenant-scoped connection record with owner, provider account/organization, scopes, status, timestamps and credential reference.
7. Run a minimal test/read-only health check; only then show **Connected**.
8. Sync through server-side jobs with idempotency, rate-limit handling, retries, observability and data minimization.
9. Authorize every read and write against user role, tenant membership, connector scopes, product entitlement and source-system permissions.
10. Audit connect, consent, scope change, sync, export, write action, reauthorization, disconnect and revocation.
11. Disconnect revokes provider grants where supported, invalidates local credentials, stops jobs and preserves required audit history.

Connection lifecycle: `not_connected`, `authorization_pending`, `connected`, `degraded`, `reauthorization_required`, `disconnected`, `error`.

Use OAuth/vendor app installation where available. API keys or service principals must be stored in a secret vault and use least-privilege permissions. Write operations, financial actions, user/device changes, endpoint isolation and cloud changes need explicit authorization, confirmation and audit. No connector may bypass tenant boundaries.

## Architecture and data model direction

Reuse and extend existing Marketplace and IntelliLink foundations after schema audit; do not create a parallel commercial catalog without evidence of a gap. Expected logical entities:
- `marketplace_categories`, `marketplace_products`, `marketplace_packages`, `marketplace_price_versions`
- product/package entitlements and add-on/bundle relationships;
- `intellilink_connector_definitions` (vendor integration type/version/scopes/capabilities);
- `tenant_connector_connections` (tenant, provider account, owner, status, scopes, secret reference);
- `connector_sync_runs` and health/diagnostic events;
- `connector_action_audit` for read/write/export/admin actions where policy requires;
- role recommendation metadata (non-authoritative discovery data).

Keep provider credentials out of these ordinary tables if a dedicated vault is available; persist only opaque secret references. RLS and server-side authorization must enforce tenant scope. Do not weaken RLS to make the UI work.

## Implementation sequence

1. **Catalog foundation:** add the JSON seed catalog and align product/connector naming and metadata.
2. **Marketplace UX:** add role-aware collections, catalog filters, detail pages, bundles, comparison and My Environment.
3. **Entitlement contract:** map packages/add-ons to connector slots, categories, usage and support only after commercial approval.
4. **Connection foundation:** audit existing IntelliLink/Supabase schema, design tenant-scoped connection records, secret-vault references, scopes and lifecycle.
5. **First connectors:** implement one read-only CFO connector and one read-only CIO connector in a sandbox tenant; add CEO reporting after data-source governance is proven.
6. **Security verification:** tenant-isolation tests, role-vs-entitlement tests, least-privilege scope tests, secret-leak scans, revocation, retries, audit and negative tests.
7. **Production gates:** vendor approvals, privacy/security review, rate-limit/cost model, support ownership, monitoring and mobile/tablet UI verification.

## Acceptance tests

- CFO, CIO and CEO receive distinct recommendations from role metadata.
- Changing role changes recommendations only; it never changes permissions or entitlements.
- A user cannot connect a provider without authorized tenant membership and required admin approval.
- One tenant cannot list, read, sync or disconnect another tenant's connections.
- Revoked or expired provider grants move to the correct lifecycle state and stop sync.
- Secrets never appear in browser storage, source, logs or error messages.
- Read/write scopes are displayed and enforced separately.
- Financial, identity, endpoint and infrastructure write actions require explicit scope and confirmation.
- Connector price/vendor fees and package entitlement are shown separately.
- No product is labelled connected or operational until provider authorization and a successful health check are verified.
- Marketplace pages remain usable on phone, tablet and desktop; no checkout or provisioning success is simulated.

## Current verified boundary

The repository currently contains a static Marketplace UI with browser-local demo cart/environment/order state and simulated checkout. The Supabase Marketplace schema foundation exists, but prior documentation records unresolved catalog mismatch, draft package prices, incomplete end-to-end entitlement wiring, and unverified RLS policy correctness. Existing IntelliLink/Connector Hub UI lists integrations as not connected. This document and JSON catalog are requirements/seed metadata, not proof that a provider integration is implemented or active.
