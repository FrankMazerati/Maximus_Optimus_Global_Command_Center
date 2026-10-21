/* HelpBuddy Phase 1 operational actions
 * Permission-aware handoff, checkpoint routing, signatures, and closeout.
 * Authorization is evaluated independently from stars/experience.
 */
(function (global) {
  'use strict';
  const api = global.HelpBuddyWork;
  if (!api) throw new Error('HelpBuddyWork must be loaded before phase1-actions.js');
  const CHECKPOINTS = Object.freeze({ SECURITY_ACCESS: 'security_access', AUTHORIZED_WORK: 'authorized_work', TECHNICIAN_COMPLETION: 'technician_completion', MANAGER_REVIEW: 'manager_review', FINAL_CLOSEOUT: 'final_closeout' });
  function requireRole(actor, role) { if (!actor || !Array.isArray(actor.roles) || !actor.roles.includes(role)) throw new Error(`Required role: ${role}`); }
  function requireAuthorized(actor, permission) { if (!actor || actor.authorized !== true || (permission && Array.isArray(actor.permissions) && !actor.permissions.includes(permission))) throw new Error(`Required authorization: ${permission || 'authorized role'}`); }
  function requestAccess(workId, actor, approval) {
    const work = api.getWork(workId); if (!work) throw new Error('Work item was not found');
    if (!approval || !approval.userId || !approval.role) throw new Error('An authorized approver is required');
    return api.updateWork(workId, { currentCheckpoint: CHECKPOINTS.SECURITY_ACCESS, requiredPermission: approval.permission || null, requiredRole: approval.role, approvalRequest: { approverId: approval.userId, role: approval.role, requestedBy: actor.userId, requestedAt: new Date().toISOString(), status: 'Pending' }, status: 'Waiting on Others' }, actor.userId);
  }
  function handoff(workId, actor, recipient) {
    const work = api.getWork(workId); if (!work) throw new Error('Work item was not found');
    if (!recipient || !recipient.userId || !recipient.role || recipient.authorized !== true) throw new Error('An authorized recipient is required');
    const entry = { fromUserId: actor.userId, toUserId: recipient.userId, toRole: recipient.role, reason: recipient.reason || 'Required authorization or specialized work', at: new Date().toISOString() };
    const handoffs = Array.isArray(work.handoffs) ? work.handoffs.slice() : []; handoffs.push(entry);
    return api.updateWork(workId, { assigneeId: recipient.userId, status: 'Assigned', available: false, handoffs, currentCheckpoint: recipient.checkpoint || CHECKPOINTS.AUTHORIZED_WORK, notification: { recipientId: recipient.userId, createdAt: entry.at, unread: true, requiredPermission: recipient.requiredPermission || null } }, actor.userId);
  }
  function addSignature(workId, actor, signature, checkpoint) {
    const cp = checkpoint || CHECKPOINTS.TECHNICIAN_COMPLETION;
    if (!signature || !signature.signatureRef) throw new Error('A signature reference is required');
    if (cp === CHECKPOINTS.TECHNICIAN_COMPLETION) requireRole(actor, 'Technician');
    if (cp === CHECKPOINTS.MANAGER_REVIEW || cp === CHECKPOINTS.FINAL_CLOSEOUT) requireRole(actor, 'Manager');
    const work = api.getWork(workId); if (!work) throw new Error('Work item was not found');
    const signatures = Array.isArray(work.signatures) ? work.signatures.slice() : [];
    signatures.push({ signatureRef: signature.signatureRef, signerId: actor.userId, signerName: actor.name || actor.userId, role: actor.role || null, checkpoint: cp, signedAt: new Date().toISOString() });
    const nextCheckpoint = cp === CHECKPOINTS.TECHNICIAN_COMPLETION ? CHECKPOINTS.MANAGER_REVIEW : CHECKPOINTS.FINAL_CLOSEOUT;
    return api.updateWork(workId, { signatures, currentCheckpoint: nextCheckpoint, status: nextCheckpoint === CHECKPOINTS.MANAGER_REVIEW ? 'Waiting on Others' : work.status }, actor.userId);
  }
  function closeout(workId, actor, signature) {
    requireRole(actor, 'Manager');
    const work = api.getWork(workId); if (!work) throw new Error('Work item was not found');
    if (work.currentCheckpoint !== CHECKPOINTS.MANAGER_REVIEW) throw new Error('Manager review checkpoint is required before closeout');
    const signatures = Array.isArray(work.signatures) ? work.signatures : [];
    if (!signatures.some(s => s.checkpoint === CHECKPOINTS.TECHNICIAN_COMPLETION)) throw new Error('Technician sign-off is required');
    if (!signature || !signature.signatureRef) throw new Error('Manager signature is required');
    signatures.push({ signatureRef: signature.signatureRef, signerId: actor.userId, signerName: actor.name || actor.userId, role: actor.role, checkpoint: CHECKPOINTS.FINAL_CLOSEOUT, signedAt: new Date().toISOString() });
    return api.updateWork(workId, { signatures, currentCheckpoint: CHECKPOINTS.FINAL_CLOSEOUT, status: 'Closed', available: false, closedAt: new Date().toISOString() }, actor.userId);
  }
  global.HelpBuddyPhase1Actions = Object.freeze({ CHECKPOINTS, requestAccess, handoff, addSignature, closeout, requireAuthorized });
})(window);
