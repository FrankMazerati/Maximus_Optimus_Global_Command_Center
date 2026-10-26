# Build 023 — Marketplace Package & Entitlement Matrix

**Status:** Draft specification; **PROPOSED — NOT APPROVED**  
**Database status:** Read-only inspection completed; no Supabase rows or schema changed  
**Branch:** `main`  
**Purpose:** Establish one explicit package/feature definition before synchronizing the Marketplace UI, Supabase catalog, and product documentation.

## 1. Important findings from the current systems

The repository and Supabase catalog are not yet using one consistent package model.

- The current `main` `index.html` Marketplace is a visual demo with a hard-coded product list, estimated prices, browser-local cart/environment/order state, and simulated checkout.
- The existing Supabase `marketplace_packages` table has six records: `launch`, `basic`, `growth`, `premium`, `enterprise`, and `full-experience`.
- Those Supabase records have `pricing_status = draft`. The amounts below are existing draft values, not approved live prices.
- The current frontend demo catalog and Supabase package catalog do not match. The UI currently lists items such as “Maximus Optimus Command Center” and “Help Desk & Service Management” at estimated monthly prices; Supabase uses product keys such as `global-identity`, `help-desk`, `knowledge-base`, `optimus`, and `trinity`.
- Do not rename or overwrite existing package records until the intended customer-facing package names, inclusions, and pricing are approved.
- Checkout, subscription creation, entitlement activation, and product provisioning are not verified as live.

## 2. Existing Supabase package records — inspected, not changed

| Current package key | Current display name | Draft monthly / annual company price | Included product keys | Support |
|---|---|---:|---|---|
| `launch` | Launch | $99 / $990 | `global-identity`, `optimus`, `help-desk`, `knowledge-base`, `intellichat` | Standard |
| `basic` | Basic | $199 / $1,990 | `global-identity`, `optimus`, `help-desk`, `knowledge-base`, `intellichat` | Standard |
| `growth` | Growth | $399 / $3,990 | `global-identity`, `intellihire`, `helpbuddy`, `trinity`, `optimus`, `help-desk`, `intellichat`, `knowledge-base` | Standard |
| `premium` | Premium | $799 / $7,990 | Growth capabilities plus `security-operations`, `network-operations`, `intelliwork` | Premium |
| `enterprise` | Enterprise | $1,499 / $14,990 | Premium capabilities plus `intellitax`, `intellipay`, `workflow-automation` | Premium |
| `full-experience` | Full Experience | $2,499 / $24,990 | Enterprise capabilities plus `maximus` | Premium |

**Caution:** The amounts and inclusions above are transcribed from existing Supabase draft records to expose the current state, not to recommend or approve them. The annual figures are ten times the monthly price in the existing records; the reason and commercial suitability have not been validated.

## 3. Proposed customer-facing six-tier model

The following is a **proposal for approval**, informed by the previously discussed names. It is not a migration plan and does not rename existing database rows.

| Proposed tier | Intended customer fit | Capability boundary (draft) | Pricing |
|---|---|---|---|
| IntelliStack Starter | Individual, pilot, or very small team | Core Command Center shell, identity/directory basics, limited help desk and knowledge access, starter collaboration. AI/automation remains preview-only until connected. | Free tier proposed; exact quotas and included products need approval. |
| IntelliStack Business | Small business | Starter plus collaboration, team calendar/meetings, device/user workflows, standard reports and configurable Quick Picks. | Prior proposal: $29/month or $290/year per organization; **not approved**. |
| IntelliStack Professional | Growing IT or service team | Business plus expanded ticket workflows, SLA/follow-up controls, knowledge workflows, basic operational reporting and selected workforce tools. | Prior proposal: $79/month or $790/year per organization; **not approved**. |
| IntelliStack Workforce | Multi-team service/workforce organization | Professional plus staffing/work assignment, IntelliStaff/IntelliWork/IntelliHire-related capabilities where implemented, manager approvals and workforce reporting. | Prior proposal: $149/month or $1,490/year per organization; **not approved**. |
| IntelliStack Enterprise | Larger or regulated organization | Workforce tier plus tenant/department governance, audit/reporting, security and network operations modules, controlled automation and enterprise support commitments. | Prior proposal: $399/month or $3,990/year per organization; **not approved**. |
| IntelliStack Full Stack | Organization wanting the broadest product catalog | Enterprise plus all specifically listed, production-ready licensed products and eligible bundles. Excludes global-admin privilege, cross-tenant access, and unimplemented or third-party-paid services unless separately enabled. | Prior proposal: $699/month or $6,990/year per organization; **not approved**. |

**Decision needed before data synchronization:** Approve these names and amounts, or explicitly choose to retain the existing Supabase names/amounts. The two models differ materially. Until then, existing Supabase records remain draft and should not be advertised as final prices.

## 4. Entitlement rules for every tier

1. **Entitlements are feature keys, not merely menu visibility.** Each package resolves to a stable list of product and capability keys.
2. **Server-side enforcement is required.** Hiding a button in the browser is not authorization. Every API/function that accesses a licensed capability must verify the authenticated user, organization/tenant membership, active subscription/entitlement, and role permission.
3. **Tenant boundaries always apply.** Buying a package grants access only within the purchasing organization/tenant scope. It never grants Global Admin, platform-owner, or cross-tenant access.
4. **Package inclusions and add-ons are separate.** An add-on may add a capability only if dependencies and incompatibilities are satisfied. A duplicate included entitlement must not be billed twice.
5. **Product readiness gates sale.** A product marked coming soon, disabled, or not purchase-ready must not be sold or represented as provisioned merely because its key appears in a package list.
6. **Price and entitlement activation are distinct.** Draft prices cannot be used for live checkout. A completed order must be verified server-side before subscription and entitlements activate.
7. **Lifecycle changes must be audited.** Record who/what granted, changed, suspended, expired, or revoked an entitlement, its scope, source order/subscription, timestamps, and reason.
8. **Expiration/cancellation must be explicit.** Define grace periods, renewal failure, cancellation-at-period-end, immediate revocation, data export, and retention before launch.
9. **Seat, storage, usage and support limits must be explicit.** Do not imply unlimited users, storage, AI calls, connector usage, or support without a documented limit and cost model.
10. **External fees must be disclosed.** Payment processing, tax filing, identity/background checks, AI model usage, communication delivery, and other provider costs may require separate contracts/fees.

## 5. Product-key mapping and validation

The current schema already supports a product catalog, package product-key arrays, checkout readiness, pricing status/versioning, carts, orders, subscriptions, subscription items, entitlements and audit events. Reuse these structures; do not create parallel tables without a demonstrated gap.

Before editing data, validate every package's included product keys against `marketplace_products.product_key` and report:
- missing product keys;
- duplicate keys;
- product readiness and checkout-enabled state;
- dependencies and incompatibilities;
- whether each key is an actual product, a feature capability, or an AI/agent preview;
- whether the product's tenant scope and server-side access check exist;
- price status and version history;
- subscription/entitlement lifecycle handling.

The existing package records contain product keys including `global-identity`, `optimus`, `help-desk`, `knowledge-base`, `intellichat`, `intellihire`, `helpbuddy`, `trinity`, `security-operations`, `network-operations`, `intelliwork`, `intellitax`, `intellipay`, `workflow-automation`, and `maximus`. Their presence in the array is not proof that each product is fully implemented, production-ready, or authorized server-side.

## 6. Supabase synchronization plan

**Phase A — read-only audit (current):**
- Confirm existing table/column contracts and package rows.
- Identify current frontend/backend catalog mismatch.
- Inspect row-level security (RLS), grants, constraints, and relevant authorization code before any data write. The policy inspection attempt did not return usable results, so RLS correctness remains **unverified**.
- Validate product keys and current order/subscription/entitlement records with targeted read-only queries.

**Phase B — specification approval:**
- Approve tier names, price model, package inclusions, product readiness, seat/storage/usage limits, support commitments and add-on rules.
- Decide whether the existing six Supabase packages are renamed/mapped to the proposed six tiers or remain the customer-facing model.

**Phase C — controlled catalog sync:**
- Prepare an idempotent upsert plan using stable package/product keys.
- Keep `pricing_status` in draft until explicit pricing approval; keep checkout disabled for products that are not ready.
- Do not grant real entitlements as test data to actual organizations.
- Run a read-back query after any approved write and compare it against the approved matrix.
- Run Supabase security/performance advisors after relevant schema/security changes.

**Phase D — app integration:**
- Replace the hard-coded browser-only catalog with a validated server/API-backed catalog.
- Use a server-side price calculation and provider checkout session; never trust client-submitted totals.
- Verify provider payment webhook signatures and idempotency before marking an order paid.
- Grant entitlements only after trusted payment/order confirmation (or an explicitly approved free-tier activation).
- Add audit logging, subscription lifecycle jobs, tenant isolation tests and failure recovery.
- Test mobile/tablet layouts and all Marketplace routes before declaring release.

No database writes were made as part of Build 023's read-only review.

## 7. Documentation and acceptance checklist

- [x] Current `main` Marketplace demo inspected.
- [x] Existing Supabase package records inspected read-only.
- [x] Mismatch between UI catalog and Supabase package catalog recorded.
- [x] Existing draft prices clearly distinguished from approved prices.
- [ ] Confirm the product catalog and each product's readiness.
- [ ] Inspect RLS/policies and server-side authorization; current policy review is unresolved.
- [ ] Approve customer-facing package names and pricing.
- [ ] Complete feature/limits matrix per package.
- [ ] Add standalone product and bundle catalog to the same source of truth.
- [ ] Implement catalog synchronization and server-side entitlement checks.
- [ ] Verify tests, deployment, and mobile/tablet browser behavior.

## 8. Build 023 status

**Documentation specification drafted.** No application code, Supabase records, database schema, active prices, checkout settings, or entitlements were changed by this document. Deployment and live-browser testing are not claimed.
