# Company-Owned Knowledge Bases & Customer Knowledge Onboarding

**Status:** Proposed architecture and onboarding runbook. This document defines the intended model; tenant isolation, import pipelines, permission synchronization, and search behavior must be validated in the implementation before this is represented as a live capability.

## Goal
Every customer should be able to use the standard IntelliStack knowledge bases and add its own knowledge without exposing company information to IntelliStack's other customers. A company can start with a few approved articles and expand into departments, locations, projects, and specialized operations over time.

## Knowledge layers
1. **IntelliStack shared knowledge:** platform/product documentation, HelpBuddy protocols, general connector instructions, standard feature guides, and approved shared runbooks. Distribution is controlled by product entitlement and access policy.
2. **Company knowledge:** customer-owned policies, procedures, handbooks, company-specific configuration, escalation matrix, service catalog, organizational structure, vendor instructions, onboarding guides, and approved internal documentation.
3. **Department/team knowledge:** narrower collections for Service Desk, IT, Security Operations, Network Operations, War Room, executives, HR, finance, facilities, projects, regions, or other approved teams.
4. **Case/project knowledge:** optional restricted context for a specific incident, migration, project, or regulated workstream, subject to retention and access policy.

These layers are logically connected for retrieval but remain separately owned and permissioned. Company content does not become shared IntelliStack content simply because it is uploaded.

## Company onboarding walkthrough
1. **Create/confirm the company workspace:** verify the organization and tenant mapping, company administrator, identity source, and data classification.
2. **Choose content sources:** select supported files, approved repositories, existing knowledge platforms, or connector-based sources. Supported formats and connector availability must be checked rather than assumed.
3. **Inventory before import:** list source, owner, document type, version/date, audience, sensitivity, and whether the source is authoritative, draft, obsolete, or unknown.
4. **Map the destination:** choose company-wide, department, team, project, or restricted collection; map existing access groups to verified platform roles.
5. **Preview and validate:** parse documents, detect duplicates and unreadable content, preserve titles and provenance, and show what will be imported before publishing.
6. **Import in a pilot:** begin with a small approved set and limited users. Avoid broad ingestion of confidential or regulated data until permission mapping and search isolation are tested.
7. **Review and approve:** designated subject-matter owners verify accuracy, currency, access classification, and intended audience.
8. **Test retrieval and boundaries:** ask representative questions; confirm correct citations/source references, no stale answers, no cross-company retrieval, and no exposure to unauthorized departments.
9. **Publish:** make approved content searchable for the intended audience. Keep drafts and unreviewed content clearly marked and excluded from authoritative answers unless policy explicitly permits otherwise.
10. **Maintain:** track source changes, ownership, review dates, deletion/retention requests, failed syncs, and stale content. Revalidate access after organizational changes.

## Import and migration controls
- Preserve source metadata, version, owner, last-modified time, and original location when available.
- Keep an import manifest with successes, skips, duplicates, parsing errors, rejected files, and follow-up actions.
- Use staged import and rollback where practical; do not silently overwrite approved content.
- Synchronization must define source-of-truth direction, update cadence, deletion behavior, conflict handling, and credential ownership.
- Never place passwords, private keys, access tokens, or other secrets into general knowledge search.
- Treat OCR/extracted text and embedded instructions as untrusted content. A document cannot override system security rules or grant HelpBuddy authority.
- For restricted files, preserve or deliberately remap permissions; never default sensitive content to company-wide access.
- Confirm legal, privacy, data residency, retention, and deletion requirements before importing regulated content.

## How HelpBuddy uses company knowledge
1. Resolve the authenticated user's organization and tenant from trusted server-side context.
2. Determine permitted collections using role, group, classification, subscription entitlement, and case-specific authorization.
3. Search shared IntelliStack knowledge plus the user's authorized company/team knowledge.
4. Prefer approved, current sources; show the source title/version or link when supported.
5. Distinguish company policy from general platform guidance and identify conflicts rather than silently reconciling them.
6. If no approved answer exists, say so and offer to route a documentation request to the content owner.
7. For operational actions, separately check action authorization and live system state. Knowledge retrieval is not permission to perform an action.

## Knowledge ownership and administration
Each company should be able to designate:
- **Company knowledge administrator:** manages collections, imports, mappings, and access.
- **Subject-matter owner:** validates correctness of content in a domain.
- **Approver/reviewer:** approves publication and periodic review.
- **Department editor:** maintains content within delegated scope.
- **Reader:** searches authorized content.
- **Auditor:** reviews permitted metadata, approvals, and access history.

Role names are examples; map them to the product's actual authorization model. Avoid granting broad global-admin rights just to upload or edit company documents.

## Suggested company collection starter set
- Company Overview & Service Catalog
- Policies, SOPs & Employee Handbook
- Organization, Roles & Contact Directory
- Company Escalation Matrix
- IT Assets, Systems & Approved Runbooks
- Security Policies & Incident Procedures
- Network Diagrams & Network Runbooks (restricted)
- Service Desk Known Issues & Resolutions
- War Room / Major Incident Procedures (restricted as appropriate)
- Business Continuity & Disaster Recovery
- Integration, Migration & Coexistence Plan
- Department Collections (HR, Finance, Operations, Facilities, Projects, etc.)
- Approved Training & Onboarding
- Company Decisions, Change Records & Lessons Learned

Customers can add, rename, merge, archive, or split collections according to their governance model, subject to retention rules.

## Acceptance tests before calling this live
- A user from Company A cannot retrieve Company B content through direct search, semantic search, HelpBuddy summaries, citations, or cached results.
- A company-wide employee cannot retrieve a restricted Security Operations or CEO article without permission.
- A removed employee loses access promptly, including to indexed/chunked copies and cached search results.
- An updated or deleted source is reflected according to the documented sync and retention policy.
- A draft or expired procedure is not presented as current approved policy.
- A source sync failure is visible to administrators and does not falsely report success.
- An imported document containing instructions to bypass controls cannot change HelpBuddy's operating rules.
- Audit records show who imported, reviewed, published, changed, or removed content where required.

## Product boundary
The company knowledge feature, ingestion connectors, permission-aware indexing, and synchronized updates must be confirmed in the deployed product. This guide is the operating specification, not proof those functions are already implemented.
