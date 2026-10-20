/* HelpBuddy Supabase adapter
 * Phase 1 persistence bridge. Backend authorization/RLS remains authoritative.
 */
(function (global) {
  'use strict';

  function create(client) {
    if (!client || typeof client.from !== 'function') throw new Error('A Supabase client is required');

    async function createWork(work) {
      const { data, error } = await client.from('helpbuddy_work_items').insert({
        request_id: work.id,
        company_id: work.companyId,
        requester_id: work.userId,
        assignee_id: work.assigneeId || null,
        title: work.title,
        category: work.category,
        description: work.description,
        priority: work.priority,
        impact: work.impact || 'Normal',
        status: work.status,
        current_task: work.currentTask || 0,
        completed_tasks: work.completedTasks || 0,
        total_tasks: work.totalTasks || 0,
        sla_state: work.slaState || null,
        due_at: work.dueAt || null,
        route: work.route || 'Global Coordinator',
        available: work.available !== false
      }).select().single();
      if (error) throw error;
      return data;
    }

    async function listWork(userId) {
      let query = client.from('helpbuddy_work_items').select('*').order('updated_at', { ascending: false });
      if (userId) query = query.eq('requester_id', userId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    async function updateWork(requestId, patch) {
      const allowed = {
        assignee_id: patch.assigneeId,
        title: patch.title,
        category: patch.category,
        description: patch.description,
        priority: patch.priority,
        impact: patch.impact,
        status: patch.status,
        current_task: patch.currentTask,
        completed_tasks: patch.completedTasks,
        total_tasks: patch.totalTasks,
        sla_state: patch.slaState,
        due_at: patch.dueAt,
        route: patch.route,
        available: patch.available,
        closed_at: patch.closedAt
      };
      Object.keys(allowed).forEach(key => { if (allowed[key] === undefined) delete allowed[key]; });
      const { data, error } = await client.from('helpbuddy_work_items').update(allowed).eq('request_id', requestId).select().single();
      if (error) throw error;
      return data;
    }

    async function addEvent(workItemId, requestId, companyId, actorId, eventType, metadata = {}) {
      const { data, error } = await client.from('helpbuddy_work_events').insert({ work_item_id: workItemId, request_id: requestId, company_id: companyId, actor_id: actorId, event_type: eventType, metadata }).select().single();
      if (error) throw error;
      return data;
    }

    async function getEvents(requestId) {
      const { data, error } = await client.from('helpbuddy_work_events').select('*').eq('request_id', requestId).order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }

    return Object.freeze({ createWork, listWork, updateWork, addEvent, getEvents });
  }

  global.HelpBuddySupabase = Object.freeze({ create });
})(window);
