# HelpBuddy identity and event integration contract

This document defines HelpBuddy's identity, tone, visual guardrails, and the safe contract for connecting the assistant to existing user, company, ticket, and history records.

## Source of truth

- Use the user's supplied HelpBuddy and AI-team reference photos as the visual source of truth.
- Do not substitute generic or generated character art for missing assets.
- Keep the recognizable face, hairstyle, headset, default blue hoodie, and IntelliStack badge consistent.
- Expression and mood may respond to real activity. Outfit options are allowed for HelpBuddy; the blue Maximus and white Optimus robot identities remain locked.
- The current references are photographs of a display. First-pass crops may need edge cleanup and perspective correction.

## Data linking safety

1. Resolve user identity from the authenticated session.
2. Resolve company/tenant scope from verified membership and server-side policies.
3. Resolve the selected ticket from trusted application state and query its current record and authorized history.
4. Never trust a companyId, userId, or ticketId merely because it appears in free text.
5. Never duplicate existing records for a demo. Reuse the already populated records.
6. When the source state is stale, missing, ambiguous, or inaccessible, say so rather than guessing.

## Message and expression behavior

- Listening: waiting for user input.
- Thinking: interpreting or checking information; does not imply a backend operation has started.
- Focused: a real workflow or ticket action is processing.
- Alert: an authoritative warning or security signal exists.
- Happy/celebrating: only after the source system confirms successful completion.
- Timeout: outcome unknown until current state is checked.
- Partial success: list confirmed steps and unconfirmed steps separately.

## Proposed event contract

See `helpbuddy-identity-profile.json` for the event envelope and suggested event-to-expression mappings. These mappings are an interface proposal, not proof that current backend event producers already emit those names. Before wiring, inspect the repository's actual ticket tables, company/user relationships, history tables, and event mechanisms. Do not create competing identity or ticket tables.

## Current status

The identity profile and event contract are documented. The vocabulary library is present. Individual image files still need to be committed to the repository, and event/database integration requires schema review and tests. Do not merge to main or deploy without approval.
