/* HelpBuddy ticket bridge — Supabase-backed ticket context.
 * Requires the official Supabase JS client and an authenticated session.
 * RLS is authoritative; never put a service-role key in browser code.
 */
(function (global) {
  'use strict';
  function create(client) {
    if (!client || typeof client.from !== 'function' || !client.auth) throw new Error('Authenticated Supabase client required');

    async function actor() {
      const { data: { user }, error } = await client.auth.getUser();
      if (error || !user) throw new Error('Sign in to access ticket records.');
      const { data: profile, error: profileError } = await client.from('profiles').select('id,organization_id,tenant_id,display_name,role_id').eq('id', user.id).maybeSingle();
      if (profileError) throw profileError;
      if (!profile) throw new Error('Your authenticated account is not linked to an employee profile.');
      return profile;
    }
    async function listTickets({ search = '', status = '', limit = 50 } = {}) {
      await actor();
      let q = client.from('tickets').select('id,ticket_number,organization_id,tenant_id,requester_profile_id,assigned_profile_id,title,description,category,priority,status,current_step,total_steps,source,resolution_summary,opened_at,resolved_at,closed_at,created_at,updated_at').order('updated_at', { ascending: false }).limit(Math.max(1, Math.min(Number(limit) || 50, 100)));
      if (status) q = q.eq('status', status);
      if (search.trim()) q = q.or('title.ilike.%' + search.trim().replace(/[%_]/g, '') + '%,description.ilike.%' + search.trim().replace(/[%_]/g, '') + '%,ticket_number.eq.' + (Number(search) || -1));
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    }
    async function getTicketContext(ticketId) {
      await actor();
      const { data: ticket, error } = await client.from('tickets').select('*,requester:requester_profile_id(id,display_name,work_email,job_title),assignee:assigned_profile_id(id,display_name,work_email,job_title)').eq('id', ticketId).single();
      if (error) throw error;
      const [history, escalations, messages, attachments, kbLinks, workflowLinks] = await Promise.all([
        client.from('ticket_lifecycle_events').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }),
        client.from('ticket_escalations').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: false }),
        client.from('ticket_conversation_messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }),
        client.from('ticket_attachment_links').select('id,ticket_id,message_id,file_name,mime_type,size_bytes,scan_status,visibility,created_at,storage_bucket,storage_path').eq('ticket_id', ticketId).order('created_at', { ascending: false }),
        client.from('ticket_knowledge_links').select('*,knowledge_base:knowledge_base_id(id,kb_key,name,description,visibility,status)').eq('ticket_id', ticketId).order('created_at', { ascending: false }),
        client.from('ticket_workflow_links').select('*,workflow:workflow_id(id,workflow_key,name,description,status,version),run:workflow_run_id(id,run_status,current_step,run_context,started_at,completed_at)').eq('ticket_id', ticketId).order('created_at', { ascending: false })
      ]);
      for (const result of [history, escalations, messages, attachments, kbLinks, workflowLinks]) if (result.error) throw result.error;
      return { ticket, history: history.data || [], escalations: escalations.data || [], messages: messages.data || [], attachments: attachments.data || [], knowledgeLinks: kbLinks.data || [], workflowLinks: workflowLinks.data || [] };
    }
    async function addMessage({ ticket, body, channel = 'internal', visibility = 'internal', metadata = {} }) {
      const profile = await actor();
      if (!ticket || !ticket.id || !ticket.organization_id || !ticket.tenant_id) throw new Error('A complete ticket context is required.');
      const { data, error } = await client.from('ticket_conversation_messages').insert({
        organization_id: ticket.organization_id, tenant_id: ticket.tenant_id, ticket_id: ticket.id,
        author_profile_id: profile.id, channel, visibility, body: String(body || '').trim(), metadata
      }).select().single();
      if (error) throw error;
      const { error: eventError } = await client.from('ticket_lifecycle_events').insert({
        organization_id: ticket.organization_id, tenant_id: ticket.tenant_id, ticket_id: ticket.id,
        actor_profile_id: profile.id, event_key: 'commented', reason: channel === 'customer' ? 'Customer-facing reply added' : 'Internal ticket note added',
        metadata: { message_id: data.id, channel, visibility }
      });
      if (eventError) throw eventError;
      return data;
    }
    async function linkKnowledgeBase({ ticket, knowledgeBaseId, relevanceScore = null, reason = '' }) {
      const profile = await actor();
      const { data, error } = await client.from('ticket_knowledge_links').upsert({
        organization_id: ticket.organization_id, tenant_id: ticket.tenant_id, ticket_id: ticket.id,
        knowledge_base_id: knowledgeBaseId, linked_by_profile_id: profile.id,
        relevance_score: relevanceScore, link_reason: reason
      }, { onConflict: 'ticket_id,knowledge_base_id' }).select().single();
      if (error) throw error;
      return data;
    }
    async function linkWorkflow({ ticket, workflowId, workflowRunId = null, status = 'linked', context = {} }) {
      const profile = await actor();
      const { data, error } = await client.from('ticket_workflow_links').insert({
        organization_id: ticket.organization_id, tenant_id: ticket.tenant_id, ticket_id: ticket.id,
        workflow_id: workflowId, workflow_run_id: workflowRunId, linked_by_profile_id: profile.id, status, context
      }).select().single();
      if (error) throw error;
      return data;
    }
    async function recordAttachment({ ticket, messageId = null, fileName, mimeType = null, sizeBytes = null, storageBucket = 'ticket-attachments', storagePath, scanStatus = 'pending', visibility = 'internal' }) {
      const profile = await actor();
      if (!storagePath || !fileName) throw new Error('A real Storage path and file name are required.');
      const { data, error } = await client.from('ticket_attachment_links').insert({
        organization_id: ticket.organization_id, tenant_id: ticket.tenant_id, ticket_id: ticket.id,
        message_id: messageId, uploaded_by_profile_id: profile.id, file_name: fileName,
        mime_type: mimeType, size_bytes: sizeBytes, storage_bucket: storageBucket,
        storage_path: storagePath, scan_status: scanStatus, visibility
      }).select().single();
      if (error) throw error;
      return data;
    }
    return Object.freeze({ listTickets, getTicketContext, addMessage, linkKnowledgeBase, linkWorkflow, recordAttachment });
  }
  global.HelpBuddyTicketBridge = Object.freeze({ create });
})(window);
