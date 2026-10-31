# IntelliStack Systems Marketplace

**Product context:** IntelliStack Systems presents Maximus Optimus Global Command Center  
**Status:** Foundation phase — schema deployed; frontend and secure workflows are not yet end-to-end complete.

## Product contract

The Marketplace is an authenticated, tenant-aware workspace, not a static storefront. It must let authorized users discover products, understand costs and dependencies, assemble a stack, compare configured benchmarks, and manage orders, subscriptions, and entitlements. Every action must either complete against a real service or explain why it is unavailable. Never show a payment, subscription, provisioning, or savings result as successful without evidence from the relevant backend.

## Experience areas

- Marketplace Home and recommendations
- Catalog, categories, search, filters, product details
- Product comparison
- Basic, Premium, and Full Experience packages
- Deals, promotions, BOGO and bundle rules
- Cost calculator and current-stack comparison
- Build My Stack / persistent cart
- Checkout: review, company, billing, payment adapter, agreement, confirmation
- My IntelliStack, subscriptions, orders, upgrades/downgrades
- Saved for Later
- Pricing administration and audit history
- Persistent, non-obstructive HelpBuddy assistance

## Catalog contract

Products and presentation metadata belong in `marketplace_products`, not visual components. Category ordering belongs in `marketplace_categories`. Packages reference product keys in `marketplace_packages`. Pricing must be resolved from versioned `marketplace_price_versions` using currency, region, effective dates, status, and eligibility. The client must not determine authoritative prices or discounts.

The product catalog supports Global Identity/Directory, IntelliTax, IntelliPay, IntelliHire, HelpBuddy customization, Trinity, Optimus, Maximus, Help Desk, Security, Network, Productivity, AI & Automation, Data & Intelligence, and Infrastructure. New catalog entries should not require edits to shared rendering components.

## Pricing and savings integrity

- Do not invent or publish final subscription prices. No authoritative price schedule has been verified yet.
- Package prices and individual monthly company prices are admin-configurable.
- Annual prices and setup fees are optional.
- Price changes are versioned and retain historical order snapshots.
- Competitor/current-stack benchmarks must be administrator-entered and sourced. New benchmarks default inactive until verified.
- Savings are calculated only from active, applicable benchmark data and the actual resolved IntelliStack price. Display assumptions, source notes, currency, and timestamp.
- The "approximately 50% lower cost" statement is a target value proposition, not a guaranteed claim. Show it only when configured comparisons support it.
- Promotion and BOGO rules are stored as data and evaluated server-side. The browser must not be the authority for eligibility or discount calculation.

## Lifecycle model

1. Catalog data is published by authorized administrators.
2. A user adds catalog items to a cart. Dependencies and incompatibilities are validated server-side.
3. Checkout creates an order in a non-paid state.
4. A payment adapter (test or live) reports an explicit result. An unconfigured adapter must block real purchase rather than simulate success.
5. On verified payment or an approved non-payment workflow, an order advances through provisioning.
6. Subscription items and entitlements are created/updated only after the corresponding workflow succeeds.
7. The Command Center authorization layer checks active entitlements server-side; hiding a button is not authorization.
8. Every meaningful lifecycle transition is audited.

## Database foundation

Migration `marketplace_catalog_billing_foundation` adds structured tables for categories, products, versioned prices, packages, promotions, configurable comparison benchmarks, carts and cart items, saved items, orders and order items, subscriptions and subscription items, entitlements, saved cost calculations, and audit events. RLS is enabled on these tables.

**Important security boundary:** RLS is enabled but no end-user policies are established by this migration. Until policies and server-side authorization functions are implemented and tested, these tables are intentionally not exposed as a client-accessible production feature. Do not disable RLS to make the UI work. Public catalog reads, admin catalog/pricing writes, and tenant-scoped commercial records need separate policies.

## Implementation sequence

- [x] Add marketplace commercial schema foundation to the current Supabase project.
- [ ] Seed categories and product catalog with clearly marked unpriced entries.
- [ ] Implement policy helpers for active profiles, organization/tenant scope, role permissions, and Super Admin administration.
- [ ] Add server-side catalog/price resolution, dependency checks, promotion/BOGO calculation, and cost calculator.
- [ ] Implement responsive Command Center Marketplace shell and modular catalog pages.
- [ ] Persist authenticated cart and saved items with tenant scoping.
- [ ] Add payment-provider abstraction and a clearly labelled test adapter; live adapter remains unconfigured until credentials and provider setup are completed outside the client.
- [ ] Implement order, subscription, provisioning, entitlement, and audit workflows.
- [ ] Add admin price versioning and promotion management.
- [ ] Test tenant isolation, role access, price integrity, discount edge cases, idempotency, and failure recovery.
- [ ] Verify deployment and UI workflows on mobile/tablet before calling the feature production-ready.

## UX requirements

Use the established bright IntelliStack theme: clean white workspace surfaces, blue primary identity, restrained purple for contractor experiences, and green for company/tenant-oriented contexts. Build for touch-first tablet/mobile use, keyboard access, visible focus, accessible contrast, and high information density without clutter. HelpBuddy remains available but non-obstructive. Keep the global Command Center navigation authoritative; Marketplace navigation is modular and should be driven by navigation configuration.

## Required trust labels

Use explicit states such as **Live**, **Configured**, **Estimated**, **Synthetic demo data**, **Unavailable**, **Not configured**, **Pending**, and **Verified**. Never imply a real integration, active subscription, payment, or product entitlement where one does not exist.


## Role-aware Marketplace and IntelliLink connector ecosystem (Build 058)

The Marketplace is a product, application, and integration ecosystem—not only a subscription-plan selector. It must present native IntelliStack modules, third-party SaaS connectors, curated role collections, bundles, add-ons, setup flows, and a tenant's installed/connected environment.

### Role-based discovery
- **CFO:** Salesforce (CRM/revenue), QuickBooks Online, Xero, NetSuite, Stripe, Power BI and Tableau. Surface accounting, receivables, expenses, pipeline/revenue, close readiness and governed financial reporting use cases.
- **CIO:** GitHub, GitLab, Azure, AWS, Google Cloud, Microsoft Entra ID, Okta, Intune, Sentinel, CrowdStrike, Datadog, ServiceNow and Jira. Surface engineering delivery, cloud inventory/cost, identity, endpoint posture, security operations, ITSM and observability.
- **CEO:** Power BI, Tableau, Salesforce, NetSuite, Asana, monday.com and Jira. Surface executive scorecards, strategic initiatives, customer/revenue health, operating risk, cross-functional dependencies and board reporting.

These are discovery recommendations, not entitlements or access grants. Recommendations must never change a user's role, package, permissions, connector scopes or tenant access.

### Canonical data source
The initial structured catalog is `marketplace/role-connector-catalog.json`. It contains stable connector/category/role keys, provider metadata, capabilities, role fit, connection method, data direction, proposed catalog status, commercial notes, lifecycle states and security requirements. Treat entries as catalog candidates until provider authorization, connector implementation, health checks and tenant-security tests pass.

### Marketplace experience areas
- Marketplace Home with role-aware recommendations and recent activity.
- Browse Catalog with product type, category, vendor, role-fit, readiness, connection-state and commercial filters.
- CFO Finance Stack, CIO Technology & Security Stack, CEO Executive Operations Stack, plus customizable collections.
- Product/connector details showing supported objects/actions, data direction, scopes, prerequisites, licensing, fees, readiness, IntelliStack entitlement and setup guide.
- Bundles and solutions that combine native modules with external connectors.
- Build My Environment with dependency/incompatibility validation.
- My Environment with included entitlements, add-ons, connected accounts, connection owners, health, last sync and reauthorization needs.
- Admin & Governance for catalog publication, entitlement mapping, scopes, ownership, audit and disconnect/revoke.

### Commercial model
The six selected IntelliStack tiers remain Starter, Business, Professional, Workforce, Enterprise and Full Stack. Prices, package inclusions, connector allowances and support terms remain proposed until approved. Connector vendor licenses, API/usage costs and third-party contracts must be disclosed separately unless explicitly bundled. Some connectors may be add-ons; some tiers may include a defined connector allowance or governance capability. Never promise unlimited connectors or silently upgrade a tenant because a role recommendation exists.

### Connection/security contract
Use OAuth/vendor app installation where possible. Explain provider, scopes, data objects, read/write behavior, purpose and third-party terms before consent. Store tokens/secrets only in a managed server-side vault. Use least privilege, tenant-scoped connection records, per-action authorization, source-system ACLs, explicit confirmation for sensitive writes, audit connect/sync/export/write/disconnect/revoke, and credential rotation/revocation. Never put secrets in localStorage, browser code, logs or repository files. A connector is not **Connected** until provider authorization and a successful server-side health check are verified.

Connection states: `not_connected`, `authorization_pending`, `connected`, `degraded`, `reauthorization_required`, `disconnected`, `error`.

### Implementation gates
1. Validate the JSON catalog against existing Marketplace/IntelliLink schema and avoid parallel tables without a proven gap.
2. Implement role-aware discovery without coupling it to authorization.
3. Define package/add-on entitlements and commercial allowances after approval.
4. Audit Supabase RLS and design tenant-scoped connection records and secret-vault references.
5. Pilot read-only CFO and CIO connectors in a sandbox tenant; add CEO reporting after data governance is proven.
6. Test tenant isolation, scopes, revocation, retries, audit, secret-leak prevention, rate limits and responsive UX.

See [Role-aware Marketplace & IntelliLink Connector Ecosystem](ROLE_AWARE_MARKETPLACE_CONNECTOR_ECOSYSTEM.md) and the canonical [role/connector catalog](../marketplace/role-connector-catalog.json).
