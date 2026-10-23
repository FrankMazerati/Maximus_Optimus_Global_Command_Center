import assert from 'node:assert/strict';
export const scenarios = [
 ['unauthenticated','anonymous sessions cannot read or mutate tickets, lifecycle events, or escalations'],
 ['cross-tenant','a user cannot access another tenant’s ticket, notes, lifecycle events, or escalations'],
 ['requester','requesters can create and read tickets but cannot assign, resolve, or close them'],
 ['assigned technician','only the assigned technician or explicitly authorized manager can update operational state'],
 ['approval','sensitive access changes remain blocked until an authorized approver records approval'],
 ['escalation','critical severity or an SLA breach creates a scoped, auditable escalation'],
 ['audit','every transition records actor, prior state, next state, reason, and timestamp'],
 ['resolution','resolution requires required steps complete and a non-empty resolution summary'],
 ['reopen','reopening a resolved/closed ticket requires an authorized role and reason']
];
export function acceptanceContract(){ return scenarios.map(([key,description])=>({key,description,status:'not-run'})); }
assert.equal(acceptanceContract().length,9);
assert.ok(acceptanceContract().every(x=>x.status==='not-run'));
if (process.env.MAXIMUS_ACCEPTANCE_URL || process.env.MAXIMUS_ACCEPTANCE_ANON_KEY) {
 assert.ok(process.env.MAXIMUS_ACCEPTANCE_URL,'Missing test project URL');
 assert.ok(process.env.MAXIMUS_ACCEPTANCE_ANON_KEY,'Missing public anon/publishable key');
 assert.ok(!/service_role|secret/i.test(process.env.MAXIMUS_ACCEPTANCE_ANON_KEY),'Privileged keys must never be used by acceptance tests');
 console.log('Disposable test credentials present; an authenticated adapter is required to run live integration assertions.');
} else console.log('Acceptance contract validated; integration tests not run because disposable test credentials are absent.');
