/* HelpBuddy Phase 1 executable smoke/integration test.
 * Load helpbuddy.js, queue-workflow.js, phase1-actions.js, signatures.js,
 * quick-workflows.js, experience.js, and bring-work-dashboard.js first.
 */
(function (global) {
  'use strict';
  const api = global.HelpBuddyWork, queue = global.HelpBuddyQueue, actions = global.HelpBuddyPhase1Actions;
  const signatures = global.HelpBuddySignatures, quick = global.HelpBuddyQuickWorkflows, experience = global.HelpBuddyExperience, dashboard = global.HelpBuddyBringWork;
  if (!api || !queue || !actions || !signatures || !quick || !experience || !dashboard) throw new Error('HelpBuddy Phase 1 modules are not loaded');
  function assert(condition, message) { if (!condition) throw new Error(`FAIL: ${message}`); }
  function run() {
    const tech = { userId: 'TECH-TEST-001', name: 'Test Technician', role: 'Technician', roles: ['Technician'] };
    const manager = { userId: 'MGR-TEST-001', name: 'Test Manager', role: 'Manager', roles: ['Manager'] };
    const admin = { userId: 'ADMIN-TEST-001', name: 'Test AD Admin', role: 'Identity Administrator', roles: ['Identity Administrator'], authorized: true, permissions: ['Active Directory Access'] };
    signatures.save(tech.userId, 'sig://test-technician', tech.name); signatures.save(manager.userId, 'sig://test-manager', manager.name);
    assert(signatures.get(tech.userId).signatureRef === 'sig://test-technician', 'personal signature profile saved');
    const work = api.createWork({ id: `HB-TEST-${Date.now()}`, userId: 'EMP-TEST-001', companyId: 'TEST-CO', title: 'Test Active Directory Access', category: 'Identity', description: 'Integration test request', priority: 'High', totalTasks: 3, tasks: [{ title: 'Verify requester', completed: false }, { title: 'Complete authorized setup', completed: false }, { title: 'Document result', completed: false }], status: 'Submitted' });
    assert(queue.overview(work.id).status === 'Submitted', 'overview returns test ticket');
    queue.doMore(work.id, tech.userId, 'Reviewed request before claiming'); queue.notNow(work.id, tech.userId);
    assert(api.getWork(work.id).available === true, 'Not Now leaves work available'); queue.accept(work.id, tech.userId);
    assert(api.getWork(work.id).assigneeId === tech.userId && api.getWork(work.id).userId === 'EMP-TEST-001', 'accept assigns without changing requester');
    actions.requestAccess(work.id, tech, { userId: manager.userId, role: 'Manager', permission: 'Active Directory Access' });
    assert(api.getWork(work.id).currentCheckpoint === actions.CHECKPOINTS.SECURITY_ACCESS && api.getWork(work.id).approvalRequest.approverId === manager.userId, 'security access is first checkpoint and manager approval routed');
    actions.handoff(work.id, tech, { userId: admin.userId, role: admin.role, authorized: true, requiredPermission: 'Active Directory Access', checkpoint: actions.CHECKPOINTS.AUTHORIZED_WORK });
    assert(api.getWork(work.id).assigneeId === admin.userId && api.getWork(work.id).handoffs.length === 1 && api.getWork(work.id).notification.recipientId === admin.userId, 'authorized handoff and recipient notification');
    actions.addSignature(work.id, tech, signatures.get(tech.userId), actions.CHECKPOINTS.TECHNICIAN_COMPLETION);
    assert(api.getWork(work.id).signatures.length === 1 && api.getWork(work.id).currentCheckpoint === actions.CHECKPOINTS.MANAGER_REVIEW, 'technician signoff advances to manager review');
    actions.closeout(work.id, manager, signatures.get(manager.userId));
    const closed = api.getWork(work.id); assert(closed.status === 'Closed' && closed.signatures.length === 2, 'manager closeout closes with both signatures');
    const quickWork = quick.create('ONBOARDING', api, { userId: 'EMP-TEST-002', companyId: 'TEST-CO' }); assert(quickWork.totalTasks === 7 && quickWork.tasks.length === 7, 'quick onboarding workflow creates checklist');
    assert(dashboard.panelsFor('Help Desk').includes('SLA Risk'), 'Help Desk dashboard contains SLA Risk');
    const profile = experience.award(tech.userId, 25, 'Identity', { completedWork: true, verifiedResolution: true }); assert(profile.stars >= 25 && profile.byCategory.Identity.completed >= 1, 'experience/stars update');
    return { ok: true, requestId: work.id, auditEvents: api.getAudit(work.id).length, signatures: closed.signatures.length, handoffs: closed.handoffs.length, quickWorkflowTasks: quickWork.totalTasks, technicianStars: profile.stars };
  }
  global.HelpBuddyPhase1Test = Object.freeze({ run });
})(window);
