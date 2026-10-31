# Help Buddy Personal Companion Workspace — Visual & Interaction Specification

**Build 059 · 2026-10-30**  
**Status:** Implemented as a static UI prototype in `helpbuddy/index.html`; persistence and backend integration are not yet verified.

## Layout

The Help Buddy personal companion surface has two primary columns:
- **Left: work and recognition.** A personalized checklist, task completion controls, and the star value associated with each task. The list must remain readable and independently expandable as more checklist modules are added.
- **Right: companion character.** A friendly character/avatar, user-selected display name, contextual message, and expression that responds to progress and the current interaction.

The character is not centered between work items. It occupies the right side of the companion card; the checklist and task value information occupy the left. On narrow screens, the layout stacks cleanly and remains touch accessible.

## Personal name and character behavior

- A user can personalize the companion name (examples: Maria, Jacob, Zachary).
- Display the chosen name as a friendly label such as **“Maria, My Help Buddy”**.
- The character remains a distinct visual identity, not a replacement for the employee profile or authenticated identity.
- Character expressions and contextual messages may change in response to checklist progress, task completion, encouragement, reminders, and workflow state.
- Expression changes must be accessible: the message conveys the same meaning so the face is not the only signal.
- Character artwork/animation can be upgraded independently. The prototype uses illustrative emoji expressions and is not the final approved character art.

## Checklist and stars

- The checklist is on the left side of the companion surface.
- Each task displays its star value directly: examples include 1, 3, 5 and 8 stars.
- Star values represent the configured recognition policy for the task category, not an automatic entitlement or authorization.
- Awarded stars must ultimately come from the authenticated backend rewards ledger after the qualifying task/approval is verified. A browser checkbox or client-side estimate must never mint authoritative rewards.
- Show completion count and earned stars. Distinguish estimated/preview values from verified ledger awards.
- Checklist modules can be added without redesigning the overall card.

## Conversation attachments and notes

- Use a compact five-across tile row for the first visible group.
- Keep additional saved items collapsed behind a clear disclosure/drop-down arrow.
- Expanding the disclosure reveals the next five items, followed by any remaining items in further rows. The collapsed view should remain compact and show only the first five.
- Each tile has a concise title and secondary type/status label; long titles truncate rather than stretch the grid.
- Include **Add Note / Attachment** as an explicit action.
- The add flow supports a note title, note body, and file selection, with validation, size/type rules, cancellation and save-state feedback.
- Do not claim a note or file is persistently saved until the connected storage service confirms success. Preserve the draft on failure.
- On mobile, tiles reflow to a readable compact grid; disclosure still reveals all remaining entries.

## Add modules

- Keep **Add Modules** adjacent to the user's current Help Buddy modules.
- Available module choices may include ticket follow-up reminders, knowledge tips, shift handoff checklist, daily goals/recognition, and calendar preparation.
- Adding a module changes the user's personal workspace configuration only. It does not grant access to a protected product, ticket, tenant, or external connector.
- Module availability is controlled by role permissions, package entitlements and tenant configuration.

## Responsive and accessibility behavior

- Desktop/tablet: checklist on left, character on right.
- Phone: stack checklist and character; retain logical reading order and touch-friendly controls.
- Keyboard users can name the companion, complete checklist items, open/close attachment disclosure, add modules, and add notes/attachments.
- Provide visible focus, semantic headings, labels, accessible disclosure state and text equivalents for expression messages.
- Preserve user name and module preferences only after a real persistence layer is connected; the current prototype does not claim cross-device persistence.

## Current prototype boundary

The Help Buddy page now contains the two-column personal companion card, editable display name, changing illustrative expressions/messages, task checklist with 1/3/5/8-star preview values, Add Modules interaction, and a five-across attachments/notes shelf with collapsed overflow and an add-note draft flow. These controls are a visual interaction prototype. The star totals, sample attachment tiles and module additions are not backend-verified records. Supabase persistence, authenticated identity, actual attachment upload, authoritative star awards, and final character artwork remain separate implementation tasks.

## Acceptance checks

1. First five attachment/notes tiles are visible; remaining entries are revealed by the disclosure control.
2. Disclosure works with mouse, touch and keyboard.
3. Checklist appears left of the character at desktop widths and stacks accessibly on phone.
4. Changing the companion name updates its displayed name and greeting.
5. Completing checklist items updates the illustrative expression, message and preview tally.
6. Star preview cannot write to the authoritative rewards ledger.
7. Add Modules opens a module chooser and does not grant protected permissions.
8. Add Note / Attachment validates a title and clearly labels the result as a draft until backend confirmation.
9. The UI does not claim cross-device persistence or real attachment upload without verified storage integration.
