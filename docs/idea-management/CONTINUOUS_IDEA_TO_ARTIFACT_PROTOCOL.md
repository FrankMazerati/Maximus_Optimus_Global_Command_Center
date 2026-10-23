# Continuous Idea-to-Artifact Update Protocol
## IntelliStack Systems / Maximus Optimus

**Status:** User-directed working rule. Apply to each new substantive idea, decision, or requirement.

Whenever a new idea is raised or refined, don't leave it only in chat. Capture it, distinguish idea from decision, and propagate it to the relevant project records and user-facing design.

## Required destinations

1. **Personal / founder knowledge:** durable intent, rationale, constraints, decisions, unresolved questions, and why the idea matters. Keep confidential founder strategy restricted.
2. **Business knowledge:** customer problem, target audience, product/service representation, operational implications, value proposition, stakeholder talking points, and support/implementation implications.
3. **Financial knowledge:** cost drivers, one-time vs recurring revenue/cost, pricing assumptions, licensing, infrastructure and migration costs, margins/risks, upsell opportunities, and explicit unknowns. Do not invent prices, forecasts, transactions, or approved financial decisions. Keep proposals and estimates clearly labeled.
4. **Product/technical knowledge:** architecture, dependencies, security/privacy boundaries, data ownership, integrations, migration steps, acceptance criteria, status, and required evidence.
5. **Talking points and presentation:** executive narrative, customer-facing explanation, sales/demo talking points, objections/trade-offs, and accurate status language.
6. **Actual interface/design artifact:** update the relevant screen specification, user flow, labels, selectable options, states, comparison views, interaction behavior, empty/error/loading states, and accessibility/responsive notes. When authorized and feasible, update the actual implementation branch as well; do not treat a written spec as proof the live interface changed.

## Workflow for each new substantive idea

1. Capture the idea in the IntelliStack Idea Ledger with date/source, concise title, why it matters, status, and links to related artifacts.
2. Classify it as **idea**, **proposed**, **decision**, **documented**, **tested**, **available**, or **needs owner review**. Brainstorming does not automatically become an approved decision.
3. Record its personal/founder meaning and constraints; business value and audience; financial implications and unknowns; technical/operational requirements; and key talking points.
4. Identify the relevant knowledge bases and update the applicable entries, not merely the index. Avoid duplicate copies where a canonical document plus linked summaries is clearer.
5. Update the relevant interface/design document so the idea has a visible user-facing expression. If the interface source code is accessible and the user has authorized implementation, update the appropriate branch and verify the diff. Otherwise record the exact implementation task as pending.
6. Cross-link the Idea Ledger entry, GitHub document/commit, and Supabase record when possible.
7. Verify each write and report what changed, where it changed, what remains only proposed, and any blocked destination. Never claim an update succeeded without tool confirmation.

## Financial handling
Use a financial knowledge area or ledger for business model assumptions and actual financial records, but keep them distinct. Only record real transactions when supported by evidence. Treat pricing, cost, savings, ARR, margins, conversion, and ROI as assumptions until validated. Each estimate should include source, currency, period, included/excluded costs, confidence, and owner.

## Interface consistency
For each accepted idea, identify:
- User role and problem.
- Entry point and user flow.
- Visible controls and content.
- Permissions and tenant boundaries.
- Loading, empty, success, failure, and recovery states.
- Accessibility and responsive behavior.
- Evidence/telemetry needed to validate success.
- Whether this is a mockup, documented design, implemented, tested, or deployed.

## Customer Transformation Studio example
The Studio must use company-size bands, current environment, primary migration reason and additional priorities, preferred transition, and workload selections. It must provide a side-by-side Marketplace comparison, interactive platform map/sandbox, readiness and dependency views, transparent itemized costs and assumptions, approval gates, migration planning, and value-based optional upgrades. It must distinguish staying/integrating from phased migration and consolidation. It must not imply production data was scanned, savings verified, or planned products are available when they are not.

## Guardrails
- Preserve explicit user instructions and approved branding.
- Separate suggestions from implementation.
- Do not create or rename products, modules, slogans, prices, or designs without grounding in user direction.
- Do not merge or deploy without explicit authorization.
- Do not expose confidential founder notes in customer-facing materials.
- Keep customer/company knowledge tenant-isolated and separately permissioned.
- Do not let a sales or upsell goal override transparency, consent, security, or customer choice.

## Shared foundational UX rule: don't create a bespoke workflow for every idea

Across the website, prefer reusable touch-first navigation and workflow patterns: drill down progressively, clear Back/Exit/Continue actions, contextual details, review-before-purchase/submit, and Save & Exit / Resume Later for eligible multi-step work. Saved drafts need visible save status, last-saved time, access control, and tested interrupted-session/conflict recovery. A draft must not be confused with a purchase, approval, or executed change. Record this rule in relevant interface specs and use shared components to reduce duplicated design, implementation, and documentation effort. See section 19 of the [Customer Transformation Studio specification](../customer-transformation-studio/TRANSFORMATION_STUDIO_AND_MIGRATION_MARKETPLACE.md#19-foundational-touch-first-navigation-save-and-resume-and-reusable-workflow-patterns). This is a design requirement until implemented and tested.
