# Build 023 — Marketplace Package & Entitlement Matrix

**Status:** Customer-facing tier names selected; prices and commercial terms remain **PROPOSED — NOT APPROVED**  
**Database status:** Read-only inspection; no Supabase rows or schema changed  
**Branch:** `main`  
**Purpose:** Establish one explicit package/feature definition before synchronizing the Marketplace UI, Supabase catalog, and product documentation.

## 1. Decision recorded in Build 024

The selected customer-facing package language is:

1. **IntelliStack Starter**
2. **IntelliStack Business**
3. **IntelliStack Professional**
4. **IntelliStack Workforce**
5. **IntelliStack Enterprise**
6. **IntelliStack Full Stack**

Use these names in future customer-facing pricing tables, package descriptions, sales material, and Marketplace design. Treat them as the preferred naming direction rather than continuing to present Launch/Basic/Growth/Premium/Enterprise/Full Experience as the proposed customer-facing tier names.

**Important commercial boundary:** selecting the names does not, by itself, approve the proposed dollar amounts, annual billing terms, included quantities, support promises, taxes, or third-party fees. Keep all amounts marked **PROPOSED — NOT APPROVED** until those terms are explicitly confirmed. Do not advertise the draft amounts as live pricing or enable checkout.

The six existing Supabase package rows remain unchanged for now. Their internal keys must be mapped deliberately to the new customer-facing tiers after catalog/readiness and entitlement validation; do not assume the mapping is one-to-one just because both lists contain six rows.

## 2. Important findings from the current systems

The repository and Supabase catalog are not yet using one consistent package model.

- The current `main` `index.html` Marketplace is a visual demo with a hard-coded product list, estimated prices, browser-local cart/environment/order state, and simulated checkout.
- The existing Supabase `marketplace_packages` table has six records: `launch`, `basic`, `growth`, `premium`, `enterprise`, and `full-experience`.
- Those Supabase records have `pricing_status = draft`. The amounts below are existing draft values, not approved live prices.
- The current frontend demo catalog and Supabase package catalog do not match. The UI currently lists items such as “Maximus Optimus Command Center” and “Help Desk & Service Management” at estimated monthly prices; Supabase uses product keys such as `global-identity`, `help-desk`, `knowledge-base`, `optimus`, and `trinity`.
- Checkout, subscription creation, entitlement activation, and product provisioning are not verified as live.

## 3. Existing Supabase package records — inspected, not changed

| Current package key | Current display name | Draft monthly / annual company price | Included product keys | Support |
|---|---|---:|---|---|
| `launch` | Launch | $99 / $990 | `global-identity`, `optimus`, `help-desk`, `knowledge-base`, `intellichat` | Standard |
| `basic` | Basic | $199 / $1,990 | `global-identity`, `optimus`, `help-desk`, `knowledge-base`, `intellichat` | Standard |
| `growth` | Growth | $399 / $3,990 | `global-identity`, `intellihire`, `helpbuddy`, `trinity`, `optimus`, `help-desk`, `intellichat`, `knowledge-base` | Standard |
| `premium` | Premium | $799 / $7,990 | Growth capabilities plus `security-operations`, `network-operations`, `intelliwork` | Premium |
| `enterprise` | Enterprise | $1,499 / $14,990 | Premium capabilities plus `intellitax`, `intellipay`, `workflow-automation` | Premium |
| `full-experience` | Full Experience | $2,499 / $24,990 | Enterprise capabilities plus `maximus` | Premium |

**Caution:** The amounts and inclusions above are transcribed from existing Supabase draft records to expose the current state, not to recommend or approve them. The annual figures are ten times the monthly price in the existing records; the reason and commercial suitability have not been validated.

## 4. Selected customer-facing six-tier model

The names below are the selected naming direction. The feature scope and prices remain drafts pending product readiness, usage limits, cost review, and commercial approval.

| Customer-facing tier | Intended customer fit | Capability boundary (draft) | Proposed pricing — not approved |
|---|---|---|---|
| **IntelliStack Starter** | Individual, pilot, or very small team | Core Command Center shell, identity/directory basics, limited help desk and knowledge access, starter collaboration. AI/automation remains preview-only until connected. | Free tier proposed; exact quotas and included products need definition. |
| **IntelliStack Business** | Small business | Starter plus collaboration, team calendar/meetings, device/user workflows, standard reports and configurable Quick Picks. | $29/month or $290/year per organization — **not approved**. |
| **IntelliStack Professional** | Growing IT or service team | Business plus expanded ticket workflows, SLA/follow-up controls, knowledge workflows, basic operational reporting and selected workforce tools. | $79/month or $790/year per organization — **not approved**. |
| **IntelliStack Workforce** | Multi-team service/workforce organization | Professional plus staffing/work assignment, IntelliStaff/IntelliWork/IntelliHire-related capabilities where implemented, manager approvals and workforce reporting. | $149/month or $1,490/year per organization — **not approved**. |
| **IntelliStack Enterprise** | Larger or regulated organization | Workforce tier plus tenant/department governance, audit/reporting, security and network operations modules, controlled automation and enterprise support commitments. | $399/month or $3,990/year per organization — **not approved**. |
| **IntelliStack Full Stack** | Organization wanting the broadest product catalog | Enterprise plus all specifically listed, production-ready licensed products and eligible bundles. Excludes global-admin privilege, cross-tenant access, and unimplemented or third-party-paid services unless separately enabled. | $699/month or $6,990/year per organization — **not approved**. |

Pricing unit currently assumes per organization, not per seat. Before prices are finalized, decide whether the plan is flat-rate, seat-based, usage-based, or a hybrid; define seats/quotas, annual discount, support commitments, taxes, and third-party usage fees.

## 5. Entitlement rules for every tier

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

## 6. Product-key mapping and validation

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

## 7. Supabase synchronization plan

**Phase A — read-only audit:**
- Confirm existing table/column contracts and package rows.
- Identify current frontend/backend catalog mismatch.
- Inspect row-level security (RLS), grants, constraints, and relevant authorization code before any data write. The policy inspection attempt did not return usable results, so RLS correctness remains **unverified**.
- Validate product keys and current order/subscription/entitlement records with targeted read-only queries.

**Phase B — specification approval:**
- Customer-facing tier names: **selected as listed in Section 4**.
- Confirm price amounts, billing unit/model, annual terms, product inclusions, readiness, seat/storage/usage limits, support commitments and add-on rules.
- Map existing six database package keys to the selected customer-facing names without assuming the inclusions/prices are already aligned.

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

## 8. Acceptance checklist

- [x] Current `main` Marketplace demo inspected.
- [x] Existing Supabase package records inspected read-only.
- [x] Mismatch between UI catalog and Supabase package catalog recorded.
- [x] Existing draft prices clearly distinguished from approved prices.
- [x] Preferred customer-facing tier names selected.
- [ ] Confirm final prices and billing model.
- [ ] Confirm product catalog and each product's readiness.
- [ ] Inspect RLS/policies and server-side authorization; current policy review is unresolved.
- [ ] Complete feature/limits matrix per package.
- [ ] Add standalone product and bundle catalog to the same source of truth.
- [ ] Implement catalog synchronization and server-side entitlement checks.
- [ ] Verify tests, deployment, and mobile/tablet browser behavior.

## Build 024 status

**Naming decision recorded in documentation.** This was a documentation-only update. No application code, Supabase records, database schema, active prices, checkout settings, subscriptions, or entitlements were changed. Deployment and live-browser testing are not claimed.
