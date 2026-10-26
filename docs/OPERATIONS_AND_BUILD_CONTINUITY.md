# Build 022 — Documentation & Operational Continuity

**Status:** Documentation baseline added; not a production release  
**Branch policy:** Work directly on `main` unless the project owner changes this instruction  
**Product:** IntelliStack Systems — Maximus Optimus Global Command Center  
**Last reviewed:** 2026-10-25

> This document is the operational handoff for continuing work across sessions. It records verified repository facts separately from plans and unverified assumptions.

## 1. Build ledger

| Build | Scope | Evidence / status |
|---|---|---|
| Build 011 | Login and command-center visual refresh | Recorded in README. Login and workspace are visual/demo foundation; real authentication not wired. |
| Build 012 | IntelliStack Marketplace demo | Recorded in README. Product catalog, search/filter, package selection, local cart and simulated checkout; no live payment processing, subscription activation or provisioning. |
| Builds 013–021 | Additional build notes were discussed in project conversations, but the current `main` README fetched for Build 022 does not establish their complete contents or merge/deployment status. | Verify against GitHub commit history and Actions before marking any as merged or released. |
| Build 022 | Documentation and operational continuity | This document establishes the build ledger, release record template, verification checklist, troubleshooting guide and rollback procedure. |

**Repository facts checked while preparing this document**
- Repository: `FrankMazerati/Maximus_Optimus_Global_Command_Center`
- Target branch: `main`
- The `main` README describes a visual-first foundation and explicitly states that real authentication, database connections and production security controls are not yet claimed.
- The README documents Marketplace cart/environment/order data as browser-local demo state. It explicitly says payments, live pricing, subscriptions, entitlements and service provisioning are not connected.
- A previous conversation referenced Build 021 on a separate branch. That is not proof Build 021 is part of `main`; verify before using it as the current baseline.
- No production deployment or live-browser verification is claimed by this document.

## 2. Working rules

1. **Build on `main` directly** for the current workflow. Do not create a feature branch or PR unless the owner changes this direction.
2. Number each new tracked build sequentially. The next tracked build after Build 022 is Build 023.
3. Before editing, inspect the current `main` version of the files that will change. Do not assume a prior branch's changes are present.
4. Keep changes focused and preserve existing functionality.
5. Run the checks available for the changed code. Review every failed/red check, fix the cause, and rerun the checks before calling a build verified.
6. Report exactly what was changed, which checks ran and their results, the commit SHA if one exists, and whether deployment/live smoke testing was actually confirmed.
7. Do not call a build deployed, production-ready, secure, authenticated, or integrated unless there is direct evidence for that claim.
8. Keep proposed prices, packages, entitlements, and roadmap items labelled **PROPOSED — NOT APPROVED** until explicitly approved. Do not turn a proposal into a live price or active entitlement by implication.
9. Do not make database schema or production-data changes without inspecting the existing schema, policies, and current records first.

## 3. Standard build record template

Copy this section for every build and fill in only verified facts.

- **Build number and title:**
- **Date:**
- **Scope / user requirements:**
- **Files changed:**
- **Commit SHA:**
- **Branch:** `main`
- **Static checks run:**
- **Check results:** passed / failed / not available (include details)
- **Build or workflow run:** URL and final state, if available
- **Deployment:** not requested / pending / failed / succeeded (evidence required)
- **Live URL:** only if confirmed
- **Smoke tests:** exact routes and devices/browsers tested, or “not run”
- **Known issues / limitations:**
- **Rollback target:**
- **Release status:** documentation-only / implementation in progress / verified / deployed and smoke-tested

## 4. Pre-change checklist

- [ ] Confirm the repository and current branch are the intended ones.
- [ ] Read the current implementation and relevant docs from `main`.
- [ ] Identify files, user-visible behavior and data contracts affected.
- [ ] Check whether the needed feature already exists before adding a duplicate.
- [ ] For Marketplace changes, inspect existing product/package/subscription/entitlement schema, rows, constraints, RLS policies and checkout state before proposing writes.
- [ ] Keep secrets out of source code and logs.
- [ ] Define acceptance checks before changing code.

## 5. Verification checklist

### Documentation-only changes
- [ ] Confirm links and file paths point to existing repository paths where possible.
- [ ] Search for contradictory status statements.
- [ ] Confirm all unapproved pricing and unimplemented integrations are labelled clearly.
- [ ] Review the rendered Markdown structure and tables.
- [ ] Record the resulting commit SHA.

### Application changes
- [ ] Run available syntax/lint/build checks.
- [ ] Inspect all red/failed checks; fix and rerun rather than ignoring them.
- [ ] Check the changed routes and navigation targets.
- [ ] Check narrow/mobile and tablet layouts in portrait and landscape when browser access is available.
- [ ] Test primary interactions and back/navigation behavior.
- [ ] Confirm authorization and tenant isolation server-side, not only by hiding UI controls.
- [ ] Verify accessibility basics: labels, focus visibility, contrast, and keyboard/touch usability.
- [ ] Only report checks actually run. Static markers are not a substitute for browser testing.

## 6. Deployment and smoke-test procedure

1. Confirm the intended commit is on `main`.
2. Inspect the repository's available GitHub Actions/workflow runs and their final results.
3. Inspect the linked deployment provider's deployment record and confirm the deployed commit/ref matches the intended commit.
4. Open the confirmed live URL and test the changed route and its key interaction.
5. Record device/browser, route, result, and any error. If no browser or deployment access is available, record **not verified**.
6. Re-check the latest production deployment before claiming that the live site reflects a change.

A successful GitHub commit alone does not prove that Actions passed, that a deployment occurred, or that the live website serves that commit.

## 7. Troubleshooting guide

| Symptom | First checks | Safe next action |
|---|---|---|
| Changes do not appear on the site | Confirm commit is on `main`; inspect workflow run; compare deployed commit SHA; check deployment logs and browser cache. | Fix the failing stage or redeploy the intended commit using the linked deployment workflow. Do not create duplicate changes before identifying the serving commit. |
| Red GitHub Actions check | Open the failing job and capture the first meaningful error, not only the final summary. | Correct the underlying issue, rerun the relevant check, then re-evaluate the full check set. |
| Page renders but controls do nothing | Inspect event handlers, navigation targets, console errors and whether the control is demo-only. | Wire a real route/action or clearly label the control as a placeholder. |
| Login looks functional but cannot authenticate | Check whether an identity provider and server-side session are configured. | Keep it labelled a visual/demo login until authentication and authorization are tested. Never claim login security from UI appearance alone. |
| Marketplace checkout appears to work | Determine whether it is only a local simulated cart/order. Inspect backend, payment provider, subscription and entitlement records. | Do not represent simulated checkout as a real purchase. Keep checkout disabled for live sales until server-side order and entitlement flow is verified. |
| Tenant sees an unlicensed product | Inspect server-side tenant membership, subscription status, entitlement checks, RLS and API authorization. | Enforce access on the server and add audit coverage; hiding a button is not access control. |
| Supabase operation fails | Check project identity, schema/table names, constraints, RLS policies, permissions and error details. | Read existing state first; avoid duplicate tables or bypassing RLS. Never write directly to Supabase internal Auth tables. |
| Mobile layout clips or overflows | Test at narrow widths and portrait/landscape; inspect fixed widths, overflow containers and sticky elements. | Correct responsive rules and retest affected screens at the same dimensions. |

## 8. Rollback procedure

1. Identify the last known-good commit from the GitHub history and, separately, the last known-good deployment.
2. Determine whether the failure is code, configuration, schema/data, or a deployment artifact.
3. For a code-only regression, prefer a reviewed revert commit on `main` rather than force-moving the branch.
4. For a deployment-only issue, redeploy the known-good commit through the linked provider if that workflow is available and permitted.
5. Database migrations and data changes require a separately reviewed recovery plan; a code rollback does not reverse data changes.
6. Re-run checks, verify the deployed commit, smoke-test the affected route, and record the incident and recovery SHA.
7. Never force-push or delete data as an improvised rollback.

## 9. Release-status vocabulary

- **Planned:** requested, but no implementation evidence yet.
- **Documented:** requirements or process recorded; behavior may not exist.
- **Implemented — unverified:** code changed, but relevant checks or behavior have not been verified.
- **Checks passed:** named automated/static checks passed; this does not imply browser or deployment verification.
- **Deployed — unverified:** deployment record exists, but live smoke test is outstanding.
- **Deployed and smoke-tested:** deployment commit and live behavior both verified, with test details recorded.
- **Blocked:** a named dependency or failed check prevents completion.

## 10. Known limitations and next documentation work

- Current README describes the app as a visual-first foundation; live authentication, database wiring and production security controls are not established by that README.
- Marketplace currently has demo behavior in the documented foundation. Live checkout, recurring billing, subscription lifecycle, entitlements, provisioning and payment processing remain unverified.
- Package definitions and the full product/bundle catalog must be reconciled with actual Marketplace code and the existing Supabase Marketplace tables before database seed/upsert changes are made.
- Package prices and product prices previously discussed are proposals, not approved live prices.
- Next planned implementation work: complete the package-to-feature entitlement matrix; map each package/product/bundle to existing Marketplace schema; update the Marketplace catalog and UI registry; inspect RLS and server-side authorization; then seed only approved data with checkout disabled until the live flow is ready.
- After Build 022, continue with Build 023 for the next scoped implementation item, while keeping the build number sequential.

## 11. Definition of done for operational continuity

This documentation baseline is complete when a new session can identify the current branch and commit, find the latest build record, distinguish implementation from proposal, repeat the available checks, verify deployment status, and follow a safe rollback path without relying on memory or undocumented assumptions.
