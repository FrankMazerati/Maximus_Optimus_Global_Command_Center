# Configuration notes

Before enabling live sign-in, define `window.MAXIMUS_CONFIG` before loading `assets/js/supabase-client.js`:

- `supabaseUrl`: the canonical project's URL.
- `supabaseAnonKey`: that project's public anon/publishable key.

Load the official Supabase JavaScript v2 SDK before `supabase-client.js`. Keep the configuration in deployment settings. Never put a service-role or secret key in browser code.

A signed-in user must have a provisioned `public.profiles` row whose `id` equals the Supabase Auth user UUID. Roles are loaded from `public.profile_roles` and `public.roles`; a role label selected in the browser is never treated as authorization.

The HelpBuddy service currently uses the existing `tickets`, `ticket_steps`, `workflows`, `workflow_runs`, and `audit_events` tables. The new `helpbuddy_work_items` ledger is optional supplemental persistence.

The SQL migrations are committed for review but have not been applied. Confirm the canonical Supabase project before applying them.
