/* HelpBuddy Phase 1 workflow contract
 * Shared shape for UI, backend adapters, and role dashboards.
 */
(function (global) {
  'use strict';

  const CHECKPOINTS = Object.freeze([
    'security_access',
    'authorized_work',
    'technician_completion',
    'manager_review',
    'final_closeout'
  ]);

  const ACTIONS = Object.freeze(['view_more', 'accept', 'do_more', 'not_now', 'transfer', 'sign', 'close']);

  function normalize(work = {}) {
    return {
      requestId: work.requestId || work.id || null,
      status: work.status || 'Draft',
      priority: work.priority || 'Normal',
      impact: work.impact || 'Normal',
      currentCheckpoint: work.currentCheckpoint || 'security_access',
      requiredRole: work.requiredRole || null,
      requiredPermission: work.requiredPermission || null,
      assigneeId: work.assigneeId || null,
      requesterId: work.requesterId || work.userId || null,
      completedTasks: Number(work.completedTasks || 0),
      totalTasks: Number(work.totalTasks || 0),
      available: work.available !== false,
      actions: ACTIONS.filter(action => Array.isArray(work.allowedActions) ? work.allowedActions.includes(action) : true)
    };
  }

  global.HelpBuddyPhase1 = Object.freeze({ CHECKPOINTS, ACTIONS, normalize });
})(window);
