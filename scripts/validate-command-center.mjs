import { readFileSync, existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const read = path => {
  assert.ok(existsSync(path), `Missing required file: ${path}`);
  return readFileSync(path, 'utf8');
};
const html = read('index.html');
const client = read('assets/js/supabase-client.js');
const auth = read('assets/js/auth-gateway.js');
const help = read('assets/js/helpbuddy-service.js');
const migration = read('supabase/migrations/20261023190000_helpbuddy_operational_work_items.sql');
const ticketSequence = read('supabase/migrations/20261023190500_ticket_number_sequence.sql');
const accessMigration = read('supabase/migrations/20261023191000_command_center_first_path_rls.sql');
const workflowMigration = read('supabase/migrations/20261023192000_workflow_scope_policies.sql');
const stepMigration = read('supabase/migrations/20261023192500_ticket_step_insert_policy.sql');
const seed = read('supabase/seed/demo-synthetic-data.sql');

assert.match(html, /assets\/js\/supabase-client\.js/, 'Dashboard must load Supabase client');
assert.match(html, /assets\/js\/auth-gateway\.js/, 'Dashboard must load auth gateway');
assert.match(html, /assets\/js\/helpbuddy-service\.js/, 'Dashboard must load HelpBuddy service');
assert.match(client, /supabaseAnonKey/, 'Client config must use a public anon/publishable key');
assert.doesNotMatch(client, /service_role|secret_key|sb_secret_/i, 'Browser client must not contain privileged credentials');
assert.match(auth, /signInWithPassword/, 'Auth gateway must use Supabase authentication');
assert.match(auth, /profile_roles/, 'Auth gateway must load server-managed role assignments');
assert.match(help, /from\('tickets'\)/, 'HelpBuddy must use the persistent ticket table');
assert.match(help, /from\('workflow_runs'\)/, 'HelpBuddy must persist workflow runs');
assert.match(help, /from\('audit_events'\)/, 'HelpBuddy must write audit events');
assert.match(help, /vpn_failure/, 'VPN workflow template must exist');
assert.match(help, /account_access/, 'Account-access workflow template must exist');
assert.match(migration, /enable row level security/i, 'HelpBuddy ledger tables must enable RLS');
assert.match(ticketSequence, /ticket_number_seq/, 'Ticket creation must have safe ticket number generation');
assert.match(accessMigration, /tickets_insert_requester/, 'Ticket insert must be scoped to requester');
assert.match(workflowMigration, /workflow_runs_insert_scope/, 'Workflow run insert must be scoped');
assert.match(stepMigration, /ticket_steps_insert_ticket_scope/, 'Remediation step inserts must be scoped');
assert.match(seed, /synthetic training record/i, 'Synthetic seed records must be labelled');
assert.match(seed, /generate_series\(1,25\)/, 'Seed dataset must include repeatable ticket samples');
assert.match(seed, /on conflict \(organization_id, slug\)/, 'Tenant seed must use the real uniqueness constraint');
console.log('Command Center static validation passed.');
