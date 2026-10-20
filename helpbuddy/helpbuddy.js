/* HelpBuddy persistent work foundation
 * UI-agnostic client model for drafts, resumable tasks, attachments,
 * search, routing, status history, and append-only audit events.
 * Replace the storage adapter with Supabase/API calls when the backend is connected.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'om-helpbuddy-work-v1';
  const AUDIT_KEY = 'om-helpbuddy-audit-v1';

  const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch (_) { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const WorkStatus = Object.freeze({
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    WAITING_ON_ME: 'Waiting on Me',
    WAITING_ON_OTHERS: 'Waiting on Others',
    ESCALATED: 'Escalated',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed'
  });

  function createWork(input = {}) {
    const now = new Date().toISOString();
    const total = Number(input.totalTasks || 0);
    const work = {
      id: input.id || uid('HB'),
      userId: input.userId || 'OM-GLOBAL-0001',
      companyId: input.companyId || 'IS-GLOBAL-0001',
      title: input.title || 'Untitled HelpBuddy Request',
      category: input.category || 'General',
      description: input.description || '',
      priority: input.priority || 'Normal',
      status: input.status || WorkStatus.DRAFT,
      currentTask: Number(input.currentTask || 0),
      completedTasks: Number(input.completedTasks || 0),
      totalTasks: total,
      tasks: Array.isArray(input.tasks) ? input.tasks : [],
      attachments: Array.isArray(input.attachments) ? input.attachments : [],
      messages: Array.isArray(input.messages) ? input.messages : [],
      assigneeId: input.assigneeId || null,
      route: input.route || 'Global Coordinator',
      dueAt: input.dueAt || null,
      createdAt: input.createdAt || now,
      updatedAt: now,
      closedAt: input.closedAt || null
    };
    saveWork(work);
    audit(work, 'work.created', { status: work.status, totalTasks: work.totalTasks });
    return work;
  }

  function listWork(userId) {
    return read(STORAGE_KEY, []).filter(x => !userId || x.userId === userId);
  }

  function getWork(id) {
    return listWork().find(x => x.id === id) || null;
  }

  function saveWork(work) {
    const all = read(STORAGE_KEY, []);
    const index = all.findIndex(x => x.id === work.id);
    work.updatedAt = new Date().toISOString();
    if (index < 0) all.push(work); else all[index] = work;
    write(STORAGE_KEY, all);
    return work;
  }

  function updateWork(id, patch = {}, actorId = 'OM-GLOBAL-0001') {
    const work = getWork(id);
    if (!work) throw new Error(`HelpBuddy work item ${id} was not found`);
    const previous = { status: work.status, currentTask: work.currentTask, completedTasks: work.completedTasks };
    Object.assign(work, patch);
    saveWork(work);
    audit(work, 'work.updated', { actorId, previous, current: { status: work.status, currentTask: work.currentTask, completedTasks: work.completedTasks } });
    return work;
  }

  function completeTask(id, taskIndex, actorId = 'OM-GLOBAL-0001') {
    const work = getWork(id);
    if (!work || !work.tasks[taskIndex]) throw new Error('Task was not found');
    if (!work.tasks[taskIndex].completed) {
      work.tasks[taskIndex].completed = true;
      work.completedTasks = work.tasks.filter(t => t.completed).length;
    }
    work.currentTask = work.tasks.findIndex(t => !t.completed);
    if (work.currentTask < 0) work.currentTask = work.tasks.length;
    if (work.status === WorkStatus.DRAFT) work.status = WorkStatus.IN_PROGRESS;
    saveWork(work);
    audit(work, 'task.completed', { actorId, taskIndex, completedTasks: work.completedTasks, totalTasks: work.totalTasks });
    return work;
  }

  function addMessage(id, message, actor = 'user') {
    const work = getWork(id);
    if (!work) throw new Error('Work item was not found');
    const entry = { id: uid('MSG'), actor, text: String(message || ''), createdAt: new Date().toISOString() };
    work.messages.push(entry);
    saveWork(work);
    audit(work, 'message.added', { actor, messageId: entry.id });
    return entry;
  }

  function addAttachment(id, attachment, actorId = 'OM-GLOBAL-0001') {
    const work = getWork(id);
    if (!work) throw new Error('Work item was not found');
    const entry = { id: uid('ATT'), name: attachment.name || 'attachment', size: attachment.size || 0, type: attachment.type || 'application/octet-stream', storageRef: attachment.storageRef || null, addedAt: new Date().toISOString() };
    work.attachments.push(entry);
    saveWork(work);
    audit(work, 'attachment.added', { actorId, attachmentId: entry.id, name: entry.name });
    return entry;
  }

  function search(query = '', filters = {}) {
    const q = query.trim().toLowerCase();
    return listWork(filters.userId).filter(w => {
      if (filters.status && w.status !== filters.status) return false;
      if (filters.category && w.category !== filters.category) return false;
      if (!q) return true;
      const haystack = [w.id, w.title, w.category, w.description, w.priority, w.status, w.route,
        ...w.messages.map(m => m.text), ...w.attachments.map(a => a.name)].join(' ').toLowerCase();
      return haystack.includes(q);
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  function myWork(userId) {
    const items = listWork(userId);
    return {
      drafts: items.filter(x => x.status === WorkStatus.DRAFT),
      inProgress: items.filter(x => x.status === WorkStatus.IN_PROGRESS || x.status === WorkStatus.ASSIGNED),
      waitingOnMe: items.filter(x => x.status === WorkStatus.WAITING_ON_ME),
      waitingOnOthers: items.filter(x => x.status === WorkStatus.WAITING_ON_OTHERS),
      completed: items.filter(x => x.status === WorkStatus.RESOLVED || x.status === WorkStatus.CLOSED),
      history: items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    };
  }

  // Audit entries are append-only: this module never exposes an edit/delete operation.
  function audit(work, event, metadata = {}) {
    const events = read(AUDIT_KEY, []);
    events.push({
      id: uid('AUD'),
      workId: work.id,
      requestId: work.id,
      userId: work.userId,
      companyId: work.companyId,
      event,
      actorId: metadata.actorId || work.userId,
      timestamp: new Date().toISOString(),
      metadata
    });
    write(AUDIT_KEY, events);
  }

  function getAudit(workId, authorizedUserId) {
    return read(AUDIT_KEY, []).filter(e => e.workId === workId && (!authorizedUserId || e.userId === authorizedUserId));
  }

  global.HelpBuddyWork = Object.freeze({ WorkStatus, createWork, listWork, getWork, saveWork, updateWork, completeTask, addMessage, addAttachment, search, myWork, getAudit });
})(window);
