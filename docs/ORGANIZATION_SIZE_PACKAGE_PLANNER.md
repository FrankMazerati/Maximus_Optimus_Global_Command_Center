# Build 026 — Organization Size and Package Fit

**Status:** Interactive sizing guidance added to the Marketplace UI. All paid prices and package limits remain proposed and unapproved.  
**Branch:** `main`  
**No live billing:** This tool does not create quotes, collect payments, activate subscriptions, or enforce user limits.

## What the customer can enter

- **Employees / organization users:** approximate total organization headcount.
- **People who need an IntelliStack account:** estimated number of people who will sign in. The UI constrains this number to be no greater than organization headcount.
- **Primary use case:** general workspace, IT/service desk, workforce/staffing, enterprise governance/operations, or broad product catalog.

The planner returns a preliminary package fit and a side-by-side table with all six tiers, proposed monthly prices, high-level organization-size guidance, intended fit, and a 12-month arithmetic estimate.

## Preliminary guidance currently encoded

- 1–10 users: Starter by default.
- 11–50 users: Business by default.
- 51–200 users: Professional by default.
- 201–1,000 users: Workforce by default.
- 1,001+ users: Enterprise by default.
- The broad-catalog use case recommends Full Stack irrespective of headcount.
- Service desk, workforce, and governance use cases can raise the recommendation to reflect capability needs.

These bands are **illustrative product-design assumptions**, not validated customer research, contractual seat limits, or a final pricing policy. They must be revisited using cost modeling, interviews, and product/seat constraints.

## Critical pricing distinction

The current proposal is a flat monthly price per organization, so the number of users affects the preliminary package recommendation but does **not** calculate a per-user charge. This is clearly disclosed in the interface.

Before finalizing pricing, choose one model:
1. **Organization-size bands** — each package includes an explicit user/seat range, with upgrade or overage rules;
2. **Per licensed user** — charge for named/active accounts, with role definitions and minimum seat counts;
3. **Hybrid** — base platform fee plus a seat allowance and charges for additional users, usage, or premium modules.

The hybrid or banded model may align best with the user's intent, but the final choice requires cost and market validation. Avoid calling a package “for 200 users” until its actual enforceable limit and overage behavior are implemented.

## Next implementation gates

- Confirm whether the final billable unit is organization, licensed user, active user, technician/agent, or hybrid.
- Define included users and how contractors, guests, admins, service accounts, and inactive accounts count.
- Define included storage, automation, AI/connector usage, support hours, and overages.
- Match each package to actual catalog product keys and production-readiness state.
- Keep quote calculations server-side and authoritative before checkout is enabled.
- Test the planner on mobile/tablet portrait and landscape; the current update passed JavaScript syntax validation, but live browser layout verification is still pending.
- Do not infer a competitor's exact price from a category-level comparison; compare equivalent seat counts, product scope, add-ons, billing periods, and support.

## Build 026 scope and verification

- Added organization and licensed-user input fields, use-case selection, dynamic tier recommendation, and a six-tier comparison table.
- The planner is an educational fit guide; it does not currently inspect or verify an organization's actual user directory.
- The current proposed prices remain non-approved. Package purchase buttons remain disabled.
- No Supabase data/schema, live prices, payment processing, subscriptions, or entitlements changed.
- Inline JavaScript syntax check passed after the final source update. No live-browser or mobile/tablet test is claimed.
