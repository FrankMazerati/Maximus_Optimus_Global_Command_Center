/* HelpBuddy Bring the Work to You queue workflow
 * Loads after helpbuddy.js. Adds the in-place drill-down actions agreed for the
 * role dashboard: View More, Accept, Do More, Not Now, and Close.
 * "Not Now" keeps work available for another authorized user; it is not a rejection.
 */
(function (global) {
  'use strict';

  const api = global.HelpBuddyWork;
  if (!api) throw new Error('HelpBuddyWork must be loaded before queue-workflow.js');

  const ACTIONS = Object.freeze({
    VIEW_MORE: 'view_more',
    ACCEPT: 'accept',
    DO_MORE: 'do_more',
    NOT_NOW: 'not_now',
    CLOSE: 'close'
  });

  function overview(id) {
    const work = api.getWork(id);
    if (!work) throw new Error('Work item was not found');
    return {
      id: work.id,
      title: work.title,
      category: work.category,
      priority: work.priority,
      impact: work.impact || 'Normal',
      status: work.status,
      description: work.description,
      requester: work.requester || null,
      assigneeId: work.assigneeId || null,
      sla: work.sla || null,
      dueAt: work.dueAt || null,
      route: work.route,
      relatedSystems: work.relatedSystems || [],
      escalationStatus: work.escalationStatus || null,
      completedTasks: work.completedTasks || 0,
      totalTasks: work.totalTasks || (work.tasks || []).length,
      attachments: work.attachments || [],
      messages: work.messages || [],
      updatedAt: work.updatedAt,
      available: work.available !== false,
      setAsideBy: work.setAsideBy || []
    };
  }

  function accept(id, actorId) {
    const work = api.getWork(id);
    if (!work) throw new Error('Work item was not found');
    if (work.available === false || (work.assigneeId && work.assigneeId !== actorId)) {
      throw new Error('Work item is not currently available');
    }
    // Preserve the original requester/owner identity. Acceptance changes assignment, not ownership.
    return api.updateWork(id, {
      assigneeId: actorId,
      available: false,
      status: 'Assigned',
      setAsideBy: (work.setAsideBy || []).filter(x => x !== actorId),
      lastQueueAction: { action: ACTIONS.ACCEPT, at: new Date().toISOString() }
    }, actorId);
  }

  function notNow(id, actorId) {
    const work = api.getWork(id);
    if (!work) throw new Error('Work item was not found');
    if (work.assigneeId && work.assigneeId !== actorId) throw new Error('Work item is assigned to another user');
    const setAsideBy = Array.from(new Set([...(work.setAsideBy || []), actorId]));
    return api.updateWork(id, {
      assigneeId: null,
      available: true,
      status: 'Submitted',
      setAsideBy,
      lastQueueAction: { action: ACTIONS.NOT_NOW, at: new Date().toISOString() }
    }, actorId);
  }

  function doMore(id, actorId, note) {
    return api.updateWork(id, {
      lastQueueAction: { action: ACTIONS.DO_MORE, note: note || '', at: new Date().toISOString() }
    }, actorId);
  }

  function close(id, actorId) {
    const work = api.getWork(id);
    if (!work) throw new Error('Work item was not found');
    if (work.assigneeId && work.assigneeId !== actorId) throw new Error('Work item is assigned to another user');
    return api.updateWork(id, {
      status: 'Closed',
      available: false,
      closedAt: new Date().toISOString(),
      lastQueueAction: { action: ACTIONS.CLOSE, at: new Date().toISOString() }
    }, actorId);
  }

  function queue(filters = {}) {
    return api.search('', filters).filter(work => {
      if (work.available === false) return false;
      if (work.status === 'Closed' || work.status === 'Resolved') return false;
      if (filters.priority && work.priority !== filters.priority) return false;
      if (filters.impact && work.impact !== filters.impact) return false;
      if (filters.category && work.category !== filters.category) return false;
      return true;
    });
  }

  global.HelpBuddyQueue = Object.freeze({ ACTIONS, overview, accept, notNow, doMore, close, queue });
})(window);
