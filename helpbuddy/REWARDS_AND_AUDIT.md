# HelpBuddy Stars, Levels, Peer Handoffs, and Audit Ledger

## Source of truth

Supabase is the source of truth for ticket handoffs, star awards, levels, and audit events. Browser-local state or static demo labels must never be presented as verified results.

## Peer handoff

- L1 may hand a ticket to another active L1 in the same organization.
- L2 may hand a ticket to another active L2 in the same organization.
- Only the current assignee can hand off their ticket.
- A handoff requires a reason of at least eight characters and accepts carry-over notes.
- Cross-level transfer belongs to the escalation workflow, not the peer-handoff workflow.
- The RPC updates the assignee, appends `ticket_history`, writes `ticket_handoffs`, and writes a `helpbuddy.ticket.peer_handoff` event to `audit_events`.
- Handoff alone does not award stars.

## Stars and levels

- Every profile starts at Level 1 with zero stars.
- One star is awarded to the assigned profile when a ticket moves to `resolved` with a resolution summary of at least 12 characters.
- An approved `approval_records` item awards one star to the approver when decided within 15 minutes of its request timestamp.
- Every five earned stars advances one level: Level 1 = 0–4 stars, Level 2 = 5–9, Level 3 = 10–14, etc.
- The event uniqueness key prevents the same source event from awarding duplicate stars.
- Resolution without adequate written evidence does not award a star and records a pending audit event explaining why.
- More reward categories may be added only when they are tied to a verifiable action and source record.

## Audit requirements

HelpBuddy must display backend-confirmed events, including actor, timestamp, action, target, outcome, and source. Peer handoffs must preserve ticket number, work notes, completed troubleshooting, pending dependencies, next action, and shift continuity. Approval decisions and reward awards must be auditable.

## UI integration status

`helpbuddy/supabase-adapter.js` contains methods for reading authenticated star progress, retrieving the current user's audit events, listing eligible same-level peers, and invoking the authorized peer-handoff RPC. `helpbuddy/rewards-audit-ui.js` renders real progress and audit results only when an authenticated Supabase client is supplied as `window.supabaseClient`. Without that client, it explicitly reports that the backend is not connected; it must not invent successful actions or star counts.

## Deployment and testing notes

- Database migrations for this feature have been applied to Supabase project `odgahlgnvhpluapfhlpt`.
- The static UI changes are committed to the repository, but the hosted deployment has not been verified in this step.
- End-to-end browser testing still requires a real authenticated account, a real database ticket, and the app's Supabase client bootstrap.
