# Build 018 — Quality Engineering and Release Checklist
**Date:** 2026-10-25  
**Scope:** Define repeatable release gates. This document records required checks; unchecked items are not represented as passed.

## 1. Preflight
- [ ] Confirm branch, base branch, PR state, and exact head commit.
- [ ] Confirm `app-version.json` is valid JSON and identifies Build 018 / 0.18.0.
- [ ] Identify actual app entry points, scripts, and test framework from repository files.
- [ ] Do not invent npm scripts or assume a package manager if the repository has no package manifest.
- [ ] Confirm the diff contains only intended changes and no secrets.

## 2. Static and automated checks
- [ ] Run the repository's supported build command.
- [ ] Run supported lint and type checks.
- [ ] Run JavaScript/TypeScript syntax validation for changed source files where applicable.
- [ ] Run unit and integration tests that exist.
- [ ] Run dependency/security scanning if supported by the repository/CI.
- [ ] Inspect failures, correct root causes, and rerun affected checks.
- [ ] Record check name, commit SHA, outcome, and evidence URL/log.

## 3. Build 018 functional smoke tests
- [ ] Availability selector: every option updates label and color; selected value persists as expected in preview.
- [ ] Global Search Center: searches available preview records by type/name/identifier; selecting a result opens the expected preview.
- [ ] Search: empty query, no results, repeated queries, and narrow viewport do not break layout.
- [ ] Navigation: menu opens/closes, scrolls independently, and links to expected views.
- [ ] Browser Back/Forward and in-app Back return to the correct prior view.
- [ ] Existing home, login/Quick Access, tickets/tasks, profile, and HelpBuddy behavior remains intact.
- [ ] Quick Picks remain below the Global Search Center as specified.
- [ ] No console errors or unhandled promise rejections during smoke tests.

## 4. Responsive acceptance
Record browser, device, viewport dimensions, date, tester, and result.
- [ ] Android phone portrait.
- [ ] Android phone landscape.
- [ ] Android tablet portrait.
- [ ] Android tablet landscape.
- [ ] Header and navigation remain usable.
- [ ] No unintended whole-page horizontal overflow.
- [ ] Search results, dialogs, forms, and task details fit and remain actionable.

## 5. Security and production-readiness checks
- [ ] Clearly distinguish mock/preview behavior from real authentication.
- [ ] Confirm server-side authorization for every privileged operation.
- [ ] Confirm tenant/company isolation with negative tests.
- [ ] Confirm browser bundles contain no service-role keys or other secrets.
- [ ] Confirm users cannot self-edit roles/permissions or award themselves verified progression rewards.
- [ ] Confirm private documents use private storage and explicit sharing rules.
- [ ] Confirm audit records capture sensitive changes and corrections.
- [ ] Confirm session expiry, logout, and revoked access behavior.
- [ ] Confirm ticket claiming is atomic server-side before enabling multi-agent live assignment.
- [ ] Confirm backups/recovery and rollback procedure before production use.

## 6. Deployment acceptance
- [ ] Vercel deployment is READY, not merely a success status without a matching URL.
- [ ] Deployment's Git source branch and commit match the intended release.
- [ ] Deployed URL responds and renders the expected Build 018 identity.
- [ ] Run critical smoke tests against the deployed URL.
- [ ] Record deployment URL, deployment ID, source SHA, test results, and remaining issues.
- [ ] Mark release Live verified only after all required evidence exists.

## 7. Results record
| Check | Commit / deployment | Outcome | Evidence / failure details |
|---|---|---|---|
| Static validation | Pending | Not run / not verified | |
| Automated tests | Pending | Not run / not verified | |
| Browser smoke tests | Pending | Not run / not verified | |
| Responsive checks | Pending | Not run / not verified | |
| Deployment source match | Pending | Not verified | |
| Live URL verification | Pending | Not verified | |

## Guardrail
A deployment build passing is necessary but not sufficient. A feature being visible in the UI is not evidence of working persistence, authorization, or backend integration.
