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
