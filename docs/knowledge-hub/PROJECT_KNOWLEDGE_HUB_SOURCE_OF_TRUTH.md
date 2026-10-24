# Project Knowledge Hub and Authoritative Source of Truth

Status: Proposed architecture / documentation. This document does not claim that a unified upload interface or transcript archive has already been implemented.

## Objective

Provide one clearly identified knowledge home inside the IntelliStack Systems / Maximus Optimus project where the founder can bring prior ChatGPT conversations and other project materials together, retrieve them, trace requirements to decisions and implementation, and avoid repeatedly restating specifications.

## Two connected layers — do not confuse them

### 1. Source conversation archive

Purpose: preserve original conversations and uploaded source documents as evidence of what was said, requested, decided, questioned, or left unresolved.

- Keep the original file/transcript intact; record its title, date or date range when known, originating conversation/source, upload date, and any relevant project area.
- Do not silently rewrite the source transcript to make it look like a final decision.
- Make source materials searchable and link each extracted requirement or decision back to the originating conversation/file when possible.
- Mark missing metadata as unknown rather than guessing.
- Apply access controls and avoid storing passwords, API keys, access tokens, or other secrets in the archive.
- Treat an uploaded transcript as source material, not automatically as current policy. Older instructions may be superseded by later explicit decisions.

### 2. Authoritative project knowledge and requirement register

Purpose: the concise, current, reviewable record used to guide product, design, engineering, business, and operational work.

Each record should include, where applicable:
- Stable requirement/decision ID and concise title.
- Exact requirement in the founder's intended meaning, including required screen/module placement and navigation hierarchy.
- Rationale and intended user/business outcome.
- Source conversation/file link and quoted or referenced evidence.
- Scope/affected surfaces and dependencies.
- Status: Captured, Needs clarification, Proposed, Approved, Documented, Implemented, Tested, or Deployed.
- Acceptance criteria and evidence/test result.
- Supersedes/superseded-by links and decision date when known.
- Open questions, risks, and next action.

Never promote a tentative idea into an approved decision without evidence. Never mark a feature implemented, tested, or deployed without verifying the relevant artifact or environment.

## Proposed project knowledge-home navigation

One project-level entry point named **Project Knowledge Hub**, with these sections:
1. **Overview** — project status, latest confirmed decisions, blockers, and next actions.
2. **Conversation Archive** — original uploaded conversations and source files.
3. **Authoritative Specifications** — current product, UX, design, architecture, security, and business requirements.
4. **Decision Log** — approved decisions, rationale, date, and supersession history.
5. **Requirement Traceability** — requirement → source evidence → implementation location/PR/commit → tests → deployment evidence.
6. **Ideas and Backlog** — proposed and unresolved items, kept separate from approved specifications.
7. **Release and Verification Log** — what was actually tested and deployed, with evidence.
8. **Financial and Commercial Knowledge** — actuals, commitments, quotes, forecasts, and assumptions clearly separated.

This is a proposed information architecture; the actual in-product page/navigation is not verified or implemented by this document.

## Conversation ingestion workflow

For every batch of uploaded conversations:
1. Preserve and index the original source files.
2. Extract requirements, explicit decisions, preferences/constraints, rationale, unresolved questions, corrections, and action items.
3. Keep source-derived statements separate from interpretation or outside research.
4. Compare each extracted item with existing knowledge to find duplicates, conflicts, and superseded instructions.
5. Resolve conflicts by explicitness, scope, recency, and user confirmation; if unclear, flag for clarification instead of guessing.
6. Link each distilled record to its source conversation/file.
7. Update the authoritative requirement register and project status only when supported.
8. Produce an ingestion receipt: files processed, records created/updated, conflicts found, items requiring confirmation, and anything skipped.
9. Verify the saved artifacts and report exact completion status.

## Governance rules

- User's explicit placement and hierarchy requirements are acceptance criteria, not optional design suggestions.
- Separate confidential founder notes from customer-facing copy.
- Use a consistent lifecycle: Captured → Needs clarification / Proposed → Approved → Documented → Implemented → Tested → Deployed. Status transitions require evidence; a record may remain Proposed or Needs clarification indefinitely.
- A GitHub documentation commit, a memory record, a database ledger entry, a passing build, and a deployed UI are different artifacts and must not be described as interchangeable.
- Avoid creating a new page/module for every idea. Organize knowledge into reusable domains and shared patterns.
- Never merge or deploy changes without explicit authorization.
- The archive and knowledge hub should be within the project context and have one obvious entry point, even if storage/search is backed by more than one technical service.

## Implementation and verification checklist

- [ ] Confirm the intended project knowledge store and permissions.
- [ ] Inventory current XMemo/project knowledge, GitHub docs, Idea Ledger, and any existing upload/search facilities.
- [ ] Decide where original conversation files will live and how they will be searched; do not assume XMemo durable memory itself is a raw transcript archive.
- [ ] Establish a stable source ID and metadata/index for each uploaded conversation.
- [ ] Create the canonical requirement/decision register and source links.
- [ ] Implement upload, indexing/search, deduplication/conflict flags, and traceability in the project UI if supported and authorized.
- [ ] Test with several representative conversations, including contradictory old/new instructions.
- [ ] Verify access controls, file retrieval, search results, and persistence.
- [ ] Demonstrate that a source can be opened from a requirement and that a superseded requirement is not silently treated as current.
- [ ] Only then mark the capability Implemented or Tested; mark Deployed only after checking the target environment.

## Immediate next step

Audit the current project knowledge stores and application repository. Report what already exists, what can be reused, where original conversations can safely be stored, and the smallest verified implementation plan. Do not claim that all conversations have been consolidated until files have actually been ingested and verified.
