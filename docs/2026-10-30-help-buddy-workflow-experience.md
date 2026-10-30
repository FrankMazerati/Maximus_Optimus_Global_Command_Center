# Help Buddy Workflow Experience — 30 October 2026

## Purpose
Help Buddy is an original IntelliStack character-based work companion and workflow experience. It is not an AI model. Maximus and Optimus are the AI agents. Help Buddy may use deterministic workflow state, contextual rules, approved knowledge, and connected services without implying that a live AI service is connected.

## Command Center placement
- The hamburger is closed during normal work; the user works in the center workspace.
- Help Buddy remains persistently available alongside that workspace.
- Opening a ticket, workflow, or investigation must preserve the originating list, selected record, and current workflow context.
- Help Buddy messaging must remain available while the user views the center workflow. Switching Help Buddy tools must not reset the active ticket or checklist.
- The character presentation belongs in the actual Help Buddy working panel, not only in Character Studio or a modification center.

## Help Buddy panel layers
### Top-layer tools
Conversation; Attachments; Notes; Workflow Companion; Checklists; Knowledge Base; Recognition Ledger; Activity; Connectors; Signatures & Approvals; My Help Buddy Ticket Trail; Share to Workspace; Add Modules.

### Character layer
- A prominent, visible character area directly beneath the top-layer tools.
- Situation-aware expressions: focused during review, supportive during routine work, concerned when urgent attention is needed, and celebratory after completion.
- The character should have room to be recognizable; it must not be reduced to a tiny decorative icon.
- Character appearance, outfits, colors, and presentation are user-customizable through Help Buddy Character Studio.
- Voice selection, preview, volume, speed, mute, spoken/text preference, captions, and reduced-motion controls are presentation/accessibility preferences.
- Character appearance never determines role, authority, intelligence, or access.

### Bottom communication and action area
- Voice type and voice settings.
- Physical character type / presentation selector.
- Message composer and send action.
- Attachments.
- Signature and approval entry.
- Keep this composer anchored and usable while the content above it scrolls.

## Persistent messaging
- Keep a durable conversation thread associated with the user and, when applicable, the active ticket/workflow.
- Preserve message author, timestamp, source record, attachments, and handoff context.
- Distinguish user messages, Help Buddy workflow prompts, system notices, and manager comments.
- Support text first; voice input/output is optional and controlled by user settings.
- The current browser implementation is a local preview. It does not connect to a live AI service or durable shared messaging backend.

## Share to Workspace
Share to Workspace is a first-class Help Buddy tool and a contextual action from tickets, workflows, audit trails, evidence, and approvals.

### Investigation scenario
A Help Desk Manager identifies a mishandled ticket, missed SLA, incomplete escalation, or questionable approval. They can prepare a review package for another authorized manager or a Shared Workspace without forwarding disconnected screenshots and messages.

### Selectable package contents
- Original ticket and complete ticket history.
- Workflow run, checklist steps, checkpoints, and exceptions.
- Employee actions and Help Buddy guidance.
- Manager reviews, approvals, and sign-offs.
- SLA targets, timestamps, escalations, and handoffs.
- Work notes, communications, attachments, and evidence.
- Related employee, device, asset, and knowledge records.
- Resolution history and outstanding questions.

### Destinations and access
Destinations include Shared Workspace, an authorized manager, Help Desk Manager, and Compliance & Governance. Access levels include view-only, investigate/comment, and participation in an explicitly authorized corrective workflow.

### Integrity and audit requirements
1. Preview the exact records and fields before sharing.
2. Check sender permissions, recipient authorization, tenant scope, and sensitive-data restrictions.
3. Preserve original record IDs, timestamps, authorship, provenance, and audit history.
4. Never let an investigation edit or overwrite the original operational audit trail.
5. Record the sender, recipients, package contents, purpose, access level, creation time, access events, comments, findings, revocation, and expiry.
6. Attribute all investigation actions to the receiving investigator; never make them appear to have performed the original work.
7. Support access revocation and time-limited investigation access.

## Separate concepts
- Connected Workspace and Record Navigation is the underlying record/context architecture.
- Share to Workspace is the action that packages and shares selected records.
- Shared Workspace is the standalone collaboration destination in the hamburger.
These must not be conflated.

## Subscription, role, and scope
- Subscription entitlements control purchased features/capacity.
- Role and permissions control actions and record access.
- Organizational scope controls tenant, region, department, and team boundaries.
- Personalization controls character, voice, layout, and preferences.
All access enforcement must occur server-side; hiding a button is not authorization.

## Implementation status — transparent
### Present in current browser preview
- Persistent Help Buddy panel on the dashboard.
- Tabs for conversation, attachments, notes, Workflow Companion, checklists, Knowledge Base, Recognition Ledger, signatures, My Tickets, activity, and connectors.
- Local browser composer with a preview-only response.
- Local notes and local workflow checklist behavior.
- A new Share to Workspace tab with package selection, destination/access preview, and explicit preview-only status.
- A visible character presentation placeholder with situation-state styling; this is not the final character artwork or complete expression engine.

### Not yet implemented / not to be represented as live
- Authenticated cross-user messaging and durable server-side conversation history.
- Real file upload/storage and malware scanning.
- Actual recipient directory resolution and authorization.
- Server-side Share to Workspace delivery, access grants, expiry, revocation, and immutable audit events.
- Connected ticket/workflow/audit evidence aggregation into a share package.
- Legally authenticated electronic signatures.
- Live voice selection, speech synthesis, voice controls, or character animation system.
- Help Buddy Character Studio and its diverse character library.

## Acceptance criteria
1. A user can open a ticket in the center workspace with the hamburger closed and keep Help Buddy messaging available.
2. Switching between Notes, Workflow Companion, Attachments, and Share to Workspace preserves active record and workflow context.
3. The character remains visible in the Help Buddy panel and its expression is tied to explicit workflow states, not random animation.
4. Share preview identifies the selected records, destination, access level, and purpose before any delivery.
5. Unauthorized recipients and cross-tenant records are rejected server-side.
6. Original ticket and audit records remain immutable; investigation activity is separately attributed.
7. Conversation messages preserve author, timestamp, context, and attachments in the connected backend.
8. Mobile and desktop layouts retain an accessible composer and a scrollable content area.
9. All local-preview limitations remain clearly labeled until backend integration is tested.

## Next engineering sequence
1. Validate the center ticket/workflow detail route and add a contextual Share to Workspace entry point.
2. Define database records for conversation threads/messages, share packages, recipients, grants, investigation activity, and audit events.
3. Implement tenant-scoped server-side authorization and immutable audit operations.
4. Connect the Share to Workspace UI to the backend and test manager-to-manager investigations.
5. Build the actual Help Buddy character library and Character Studio after the visual design is approved.
6. Implement voice preferences and accessible text/voice interaction.
7. Run browser, accessibility, security, and CI acceptance tests before marking the feature complete.
