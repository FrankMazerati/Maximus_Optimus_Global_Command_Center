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

    async function getMyProgress() {
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError || !user) throw new Error('Sign in to view HelpBuddy progress.');
      const { data: profile, error: profileError } = await client.from('profiles').select('id, organization_id, display_name, job_title').eq('auth_user_id', user.id).maybeSingle();
      if (profileError) throw profileError;
      if (!profile) throw new Error('No employee profile is linked to this account.');
      const { data: balance, error: balanceError } = await client.from('helpbuddy_star_balances').select('total_stars,current_level,updated_at').eq('profile_id', profile.id).maybeSingle();
      if (balanceError) throw balanceError;
      const { data: events, error: eventsError } = await client.from('helpbuddy_star_events').select('event_code,source_type,source_id,stars_awarded,details,occurred_at').eq('profile_id', profile.id).order('occurred_at', { ascending: false }).limit(25);
      if (eventsError) throw eventsError;
      return { profile, totalStars: balance?.total_stars || 0, level: balance?.current_level || 1, starsToNextLevel: 5 - ((balance?.total_stars || 0) % 5), events: events || [] };
    }

    async function listPeerHandoffTargets() {
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError || !user) throw new Error('Sign in before selecting a handoff recipient.');
      const { data: actor, error: actorError } = await client.from('profiles').select('id,organization_id,role_id,roles:role_id(code)').eq('auth_user_id', user.id).maybeSingle();
      if (actorError) throw actorError;
      if (!actor) throw new Error('No employee profile is linked to this account.');
      const actorRole = actor.roles && actor.roles.code;
      if (!['HELP_DESK_L1','HELP_DESK_L2'].includes(actorRole)) throw new Error('Peer handoff is only available to Help Desk L1 and L2.');
      const { data: profiles, error } = await client.from('profiles').select('id,display_name,job_title,role_id,roles:role_id(code)').eq('organization_id', actor.organization_id).eq('access_status','active').neq('id', actor.id);
      if (error) throw error;
      return (profiles || []).filter(p => p.roles && p.roles.code === actorRole).map(p => ({ id:p.id, displayName:p.display_name, jobTitle:p.job_title, roleCode:actorRole }));
    }

    async function handoffTicketByNumber(ticketNumber, targetProfileId, reason, carryoverNotes = '') {
      const digits = String(ticketNumber || '').match(/\\d+/);
      if (!digits) throw new Error('The ticket number is missing or invalid.');
      const { data: ticket, error: ticketError } = await client.from('tickets').select('id,ticket_number').eq('ticket_number', Number(digits[0])).maybeSingle();
      if (ticketError) throw ticketError;
      if (!ticket) throw new Error('That ticket number was not found in the connected database. No ticket was changed.');
      return handoffTicketToPeer(ticket.id, targetProfileId, reason, carryoverNotes);
    }

    async function handoffTicketToPeer(ticketId, targetProfileId, reason, carryoverNotes = '') {
      if (!ticketId || !targetProfileId || !reason || reason.trim().length < 8) throw new Error('Choose a peer and provide a handoff reason of at least 8 characters.');
      const { data, error } = await client.rpc('handoff_ticket_to_peer', {
        p_ticket_id: ticketId,
        p_target_profile_id: targetProfileId,
        p_reason: reason.trim(),
        p_carryover_notes: carryoverNotes.trim()
      });
      if (error) throw error;
      return data;
    }

    async function getMyAuditEvents(limit = 50) {
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError || !user) throw new Error('Sign in to view the HelpBuddy audit ledger.');
      const { data: profile, error: profileError } = await client.from('profiles').select('id,organization_id').eq('auth_user_id', user.id).maybeSingle();
      if (profileError) throw profileError;
      if (!profile) throw new Error('No employee profile is linked to this account.');
      const { data, error } = await client.from('audit_events').select('action,target_type,target_id,outcome,source,details,occurred_at,actor_profile_id').eq('organization_id', profile.organization_id).order('occurred_at', { ascending: false }).limit(Math.max(1, Math.min(Number(limit) || 50, 100)));
      if (error) throw error;
      return data || [];
    }

    async function getTicketAudit(ticketId) {
      if (!ticketId) throw new Error('A ticket ID is required.');
      const { data, error } = await client.from('ticket_history').select('event_type,old_value,new_value,note,occurred_at,actor_profile_id').eq('ticket_id', ticketId).order('occurred_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }

    return Object.freeze({ createWork, listWork, updateWork, addEvent, getEvents, getMyProgress, listPeerHandoffTargets, handoffTicketToPeer, handoffTicketByNumber, getMyAuditEvents, getTicketAudit });
  }

  global.HelpBuddySupabase = Object.freeze({ create });
})(window);
