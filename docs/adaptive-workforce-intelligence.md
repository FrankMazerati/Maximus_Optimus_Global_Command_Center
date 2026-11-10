# Maximus Adaptive Workforce Intelligence

## Runtime
- Supabase Edge Function: `adaptive-dispatch` (JWT required).
- Database engine: `public.dispatch_offer_ticket` and `public.dispatch_respond_to_offer`.
- Operational records: `dispatch.workforce_links`, `dispatch.presence`, `dispatch.profile_skills`, `dispatch.ticket_skill_requirements`, `dispatch.decisions`, and `dispatch.candidate_evaluations`.
- Existing authoritative records remain in `public.tickets`, `public.ticket_offers`, `public.ticket_lifecycle_events`, `public.ticket_conversation_messages`, and `public.notification_events`.
- Every offer/response emits `ticket.updated` through `public.intellisync_emit_event`; IntelliSync owns delivery, idempotency, retry and audit records.

## Edge Function actions
- `health`: authenticated service check.
- `queue`: offers addressed to the signed-in profile.
- `presence`: set the signed-in user's availability and current context.
- `dispatch`: evaluate and offer a ticket (authorized dispatch roles only).
- `respond`: accept, decline or request requester information.
- `link_workforce_profile`: administrator-only link between an Auth profile and an existing workforce person.
- `set_profile_skills`: administrator-only verified skill assignments.
- `set_ticket_requirements`: set required skill keys and complexity for a ticket.

## Adaptive behavior
The engine evaluates explicit availability (online does not mean available), presence freshness, current workload, context switches, skills, experience, ticket complexity and urgency. Its weights are derived from the ticket and current eligible workforce distribution; no fixed Global Admin ranking-weight table is used. It creates at most two simultaneous offers. Accepting is a separate, atomic ownership transition. Requesting information sends a customer-visible message to the original requester and keeps the technician as owner while the ticket waits.

## Important data-integrity gate
Workforce directory people are not automatically Auth users. The current database has 3,500 workforce people and 12 Auth profiles, with no email-based workforce/profile matches. The engine therefore requires an explicit, administrator-approved `workforce_links` mapping and a fresh `available` presence record before a profile can receive an offer. Do not manufacture Auth users or infer identity matches.

## Remaining application integration
The current CommandProvider in the frontend persists demo state in browser local storage. The Edge Function and database workflow are deployed, but the existing mission UI is not yet authenticated against Supabase. A follow-on frontend change must replace demo-only mission actions with the authenticated Edge Function, subscribe to recipient notifications/Realtime, and provide the administrator workforce-link and skill screens. Vercel currently has no project returned by the connected account, so no live preview deployment is claimed.
