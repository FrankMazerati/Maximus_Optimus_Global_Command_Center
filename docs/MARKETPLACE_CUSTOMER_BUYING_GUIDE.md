# Build 025 — Marketplace Customer Buying Guide and Competitive Positioning

**Status:** Customer-facing package copy drafted; paid prices and final package entitlements remain **PROPOSED — NOT APPROVED**.  
**Application change:** Marketplace now displays package cards, an internal side-by-side tier matrix, and a category-level competitor comparison.  
**Branch:** `main`  
**Scope:** Transparent buying guidance, not a claim of production readiness or a verified feature-for-feature benchmark.

## 1. Marketplace messaging principles

Every package listing should tell customers:
- what they are buying and who the tier is for;
- what business problem it is intended to solve;
- what capabilities are included versus planned, preview-only, or separately billed;
- what limits, support commitments, and third-party costs apply;
- why they might choose this tier over another;
- how the offering differs from established alternatives.

Never advertise a planned feature as live merely because its name exists in the product catalog. Do not imply certifications, uptime SLAs, production integrations, real AI automation, payment processing, or data residency commitments unless those capabilities and commitments have been implemented and verified.

## 2. Selected customer-facing tiers and draft descriptions

### IntelliStack Starter
**Customer fit:** Individuals, pilots, or very small teams exploring the Command Center concept.  
**Why consider it:** Start evaluating the unified workspace concept before committing to a paid package.  
**Draft scope:** Core workspace preview, starter directory/knowledge concepts, and supported workflow previews.  
**Must disclose:** Free-tier quotas, persistence, included live services, and support are not yet finalized.

### IntelliStack Business
**Customer fit:** Small businesses that want a more coordinated team workspace.  
**Why consider it:** The proposed package groups collaboration, calendar/meeting, and user/device workflow concepts in one place.  
**Draft scope:** Starter scope plus collaboration and basic team workflows.  
**Must disclose:** Final integrations, quotas, support, and production status must be confirmed.

### IntelliStack Professional
**Customer fit:** IT support and service teams that need more structured work intake and follow-up.  
**Why consider it:** The proposed package emphasizes ticket workflows, SLA/follow-up visibility, knowledge workflows, and basic operational reporting.  
**Draft scope:** Business scope plus expanded service-management workflows.  
**Must disclose:** Production ticket processing, SLA calculation/enforcement, reporting accuracy, and integrations are not verified by the visual foundation.

### IntelliStack Workforce
**Customer fit:** Organizations coordinating service work, staffing, onboarding, and manager approvals.  
**Why consider it:** The proposed package connects operational work with workforce coordination rather than treating those workflows as unrelated purchases.  
**Draft scope:** Professional scope plus staffing/work assignment and workforce capabilities where implemented.  
**Must disclose:** IntelliHire, IntelliStaff, and IntelliWork readiness must be validated product by product.

### IntelliStack Enterprise
**Customer fit:** Larger or multi-team organizations that need clearer governance and operational boundaries.  
**Why consider it:** The proposed package adds organization/department governance, audit workflows, and eligible security/network operations capabilities.  
**Draft scope:** Workforce scope plus governance and eligible operations modules.  
**Must disclose:** No compliance certification, security guarantee, audit completeness, uptime commitment, or regulatory suitability is implied without independent validation.

### IntelliStack Full Stack
**Customer fit:** Organizations that want the broadest eligible IntelliStack catalog.  
**Why consider it:** The proposed package is intended to reduce the need to assemble a large number of separate IntelliStack product purchases.  
**Draft scope:** Enterprise scope plus explicitly listed production-ready products and eligible bundles.  
**Must disclose:** “Full Stack” does not mean every future or unimplemented feature is included. Third-party charges may apply. It never grants Global Admin, platform-owner, or cross-tenant access.

## 3. Draft pricing presentation

The prior proposed monthly organization prices remain unapproved:
- Starter: free tier proposed;
- Business: $29/month;
- Professional: $79/month;
- Workforce: $149/month;
- Enterprise: $399/month;
- Full Stack: $699/month.

The annual proposals were ten monthly payments (Starter free; Business $290; Professional $790; Workforce $1,490; Enterprise $3,990; Full Stack $6,990). These are not approved offers and do not yet establish a valid annual discount. The application currently labels paid prices as proposed and disables package purchase actions.

Before launch, decide whether pricing is per organization, per seat, usage-based, or hybrid; set seats and quotas, storage, AI/connector allowances, support hours, overage prices, annual terms, taxes, cancellation rules, and third-party fees.

## 4. Internal tier comparison

The Marketplace includes a side-by-side table for:
- customer fit;
- core workspace;
- collaboration/calendar;
- ticket, knowledge and SLA workflow scope;
- staffing/work assignment;
- security/network operations;
- governance/audit;
- AI/automation status;
- Global Admin/cross-tenant boundary;
- pricing approval status.

The labels are deliberately conservative: proposed, planned baseline, limited/to define, or subject to readiness. These must be replaced by exact included feature flags and quantified limits after the product-key audit.

## 5. Competitive comparison — category-level, not a benchmark

The Marketplace now includes a qualitative comparison against:
- Microsoft 365;
- Atlassian Jira Service Management;
- Freshservice;
- ManageEngine ServiceDesk Plus.

The comparison is framed around primary emphasis, IT service desk, productivity suite, workforce/staffing, pricing model, and when a customer should evaluate each option. It does **not** claim that IntelliStack currently matches the competitors feature-for-feature. It notes the current implementation gaps and points customers to official vendor plan pages for current terms.

Research snapshot (official vendor pages checked on 2026-10-25):
- Microsoft 365 Business plan pages emphasize productivity applications, business email, collaboration, storage, and plan-dependent security/device management. Official comparison: https://www.microsoft.com/en-us/microsoft-365/business/compare-all-microsoft-365-business-products
- Atlassian Jira Service Management plan pages describe service-management workflows including request intake, incidents, knowledge, automation and plan-dependent assets/AI. Official pricing: https://www.atlassian.com/collections/service/pricing
- Freshservice publishes agent-based ITSM tiers with incident, knowledge and task capabilities; higher tiers add service catalog, SLA, on-call, problem/change, workload and other functions. Official pricing: https://www.freshworks.com/freshservice/pricing/
- ManageEngine ServiceDesk Plus describes technician/asset-based pricing, with edition-dependent asset management, CMDB, change and project capabilities. Official pricing: https://www.manageengine.com/products/service-desk/pricing.html

Competitor pricing changes, may be billed per user/agent/technician or by assets, and is not directly comparable to IntelliStack's proposed per-organization price. Avoid claiming “cheaper” or “better” without a like-for-like scenario with equivalent seat counts, included features, usage, support, and billing periods. Re-check official pages before publishing a dated competitive claim.

## 6. Build 025 implementation notes

- Added package cards with audience fit, value proposition, proposed inclusions, and explicit caveats.
- Added a side-by-side package comparison table.
- Added a category-level competitive comparison and links to official vendor pricing pages.
- Kept package purchase buttons disabled while the package model is not live.
- Kept existing standalone product selection as a clearly labeled illustrative demo, with estimates explicitly not approved.
- No Supabase rows/schema, real pricing, payment processing, subscriptions, or entitlements were changed.
- This source update has not been browser-tested in this document. Verify JavaScript syntax, rendering, table overflow, and mobile/tablet layouts before treating the UI as released.

## 7. Next gates

1. Validate product keys against the catalog and assign a readiness state to each product.
2. Approve exact package inclusions and limits.
3. Approve pricing model and amounts.
4. Inspect tenant authorization and RLS; current correctness remains unverified.
5. Replace the hard-coded catalog with a validated data source and server-enforced entitlements.
6. Test the buying guide on phone/tablet portrait and landscape and confirm no misleading checkout path remains.


## Role-aware applications and connectors
The Marketplace direction now includes role-aware collections and external connector discovery in addition to the six IntelliStack subscription tiers. CFO, CIO and CEO recommendations are defined in the [role-aware Marketplace ecosystem specification](ROLE_AWARE_MARKETPLACE_CONNECTOR_ECOSYSTEM.md). Connector vendor licensing, API/usage fees, package entitlements, tenant authorization and actual connected state are separate and must be disclosed independently. The structured catalog is maintained at [marketplace/role-connector-catalog.json](../marketplace/role-connector-catalog.json). Catalog presence is not proof of a live integration; paid prices and package terms remain subject to approval.
