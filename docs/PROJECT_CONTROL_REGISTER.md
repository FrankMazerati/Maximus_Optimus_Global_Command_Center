# IntelliStack Systems — Project Control Register
**As of:** 2026-10-25  
**Application:** Maximus Optimus Global Command Center  
**Product:** IntelliStack Systems  
**Current tracked build:** 018 / 0.18.0  
**Branch:** `build-018-workflow-and-status`  
**Register status:** Initial baseline created; repository/deployment reconciliation still required.

> This register is the control record, not proof that a feature is implemented. Use evidence (commit, test result, deployment URL, or browser check) before marking work complete.

## Release identity and source of truth
- Repository: https://github.com/FrankMazerati/Maximus_Optimus_Global_Command_Center
- Current Build 018 working branch: `build-018-workflow-and-status`
- Build 018 PR: https://github.com/FrankMazerati/Maximus_Optimus_Global_Command_Center/pull/13
- GitHub Actions: https://github.com/FrankMazerati/Maximus_Optimus_Global_Command_Center/actions
- Build metadata file: `app-version.json`
- Live deployment URL: **Not yet verified for the Build 018 branch/commit. Do not label this build live.**
- Main branch merge: **Not confirmed; PR #13 was last observed open and unmerged.**

## Status definitions
- **Implemented** — code/documentation exists on the named commit.
- **Automated pass** — a named automated check completed successfully for that commit.
- **Browser verified** — the stated user workflow was exercised in a real browser/device and evidence recorded.
- **Live verified** — deployment is ready, its URL opens, and its deployed source/build identity matches the intended release.
- **Blocked / pending** — dependency or evidence is missing. Do not infer success from absence of a reported failure.

## Workstream register
| ID | Workstream | Deliverable / acceptance evidence | Current status | Next action |
|---|---|---|---|---|
| REL-001 | Release engineering | Numbered release record, commit SHA, check results, deployment identity, live URL | In progress | Reconcile PR #13, commit checks, and matching Vercel deployment |
| QA-001 | Automated quality | Repeatable syntax/build/type/lint/test checks appropriate to the actual repository | Pending | Inspect repository scripts/workflows; add only checks supported by its stack |
| QA-002 | Regression testing | Repeatable tests for navigation, search, availability, core employee workflows | Pending | Inventory existing UI and test harness; add high-value smoke tests |
| ARCH-001 | Architecture | Routing, shared components, state and data-flow notes | Pending | Map existing application structure before refactoring |
| SEC-001 | Security | Auth, authorization, tenant isolation, secrets, session and audit review | Pending | Document current mock/real boundaries; test backend policies before production claims |
| DATA-001 | Data model | Consistent user/org/tenant/ticket/task/device/document/audit entities | Pending | Inventory current data sources and propose schema with migration plan |
| UX-001 | Responsive UX | Phone + tablet portrait/landscape acceptance results | Pending | Run browser checks and record viewport/device, outcome and defect |
| DOC-001 | Operations docs | Runbook, known issues, rollback/recovery, architecture decisions | In progress | Maintain this register and create a release checklist |
| AI-001 | Maximus Optimus | Context boundaries, permitted actions, approval gates, audit plan | Planned | Draft integration contract after identity/data boundaries are clear |
| ECO-001 | Ecosystem integration | Shared module/navigation/data contracts for IntelliSphere products | Planned | Map dependencies; do not duplicate shared foundations per module |

## Build 018 change record
- Availability selector updates visible status label and color in preview UI.
- Global Search Center appears above Quick Picks and searches available browser-local preview records.
- Employee workflow acceptance requirements are documented; the full checklist is not all implemented.
- Search is not yet a live, permission-aware shared database search.
- Shared backend persistence, production authentication/authorization, server-side atomic ticket claiming, and full responsive/browser verification remain unverified or not implemented in this build.
- Build 018 remains a branch/PR until merge and deployment evidence confirms otherwise.

## Build ledger
| Build | Version | Branch / commit | Merge | Automated checks | Deployment | Browser verification |
|---|---|---|---|---|---|---|
| 018 | 0.18.0 | `build-018-workflow-and-status` / see PR head SHA | Not confirmed merged | Must query current commit checks | No matching live URL verified | Pending |

For every later build, append a row; do not overwrite prior release evidence. A build number is not reused. Do not mark any status passed without evidence.

## Defect and decision log
| ID | Type | Description | Severity | Owner / next step | Status |
|---|---|---|---|---|---|
| DEF-018-01 | Release | Build 018 is not confirmed merged and its exact deployment URL is not verified | High | Inspect PR/checks and Vercel deployment list for exact commit | Open |
| DEF-018-02 | QA | Browser verification of global search, availability state, navigation, and responsive layouts is pending | High | Run device/browser smoke tests and record results | Open |
| DEF-018-03 | Security/data | Preview state is browser-local; shared persistence and production security controls are not established by this build | High | Map real backend/auth boundaries and implement/test in dedicated work | Open |

## Release acceptance gate
Before calling a build released:
1. Confirm exact branch and commit SHA.
2. Validate JSON/build metadata and run available repository checks.
3. Inspect every failed check; repair and rerun affected checks.
4. Exercise critical workflows: login/Quick Access boundary, navigation and Back, global search, availability selector, ticket/task interaction, HelpBuddy and profile.
5. Test phone and tablet layouts in portrait and landscape.
6. Confirm Vercel deployment state is READY and deployment source SHA matches intended commit.
7. Open the deployed URL and confirm the expected build identity is served.
8. Record results, unresolved defects, and rollback/recovery path.
9. Only then mark **Live verified** and share the live URL.

## Operating rules
- Preserve existing approved functionality; do not silently replace requirements.
- Separate implemented, tested, deployed, and browser-verified states.
- Keep real credentials and service-role secrets out of browser code and commits.
- Never treat local preview data as shared production data.
- Fix root causes and rerun checks; do not just rerun a failed build without diagnosis.
- For production release, use required safeguards; skipping preview review does not mean skipping tests or security checks.
