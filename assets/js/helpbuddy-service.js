/* Deterministic HelpBuddy operations service. No simulated success: every mutation
 * returns a database error if persistence or authorization fails.
 */
(function (global) {
  const CHECKPOINTS = Object.freeze({ TRIAGE: 'triage', REMEDIATION: 'remediation', SECURITY_ACCESS: 'security_access', MANAGER_REVIEW: 'manager_review', CLOSED: 'closed' });
  const ALLOWED_PRIORITIES = new Set(['low','medium','high','critical']);
  const WORKFLOWS = Object.freeze({
    vpn_failure: { name: 'VPN connectivity failure', category: 'Network', priority: 'high', tasks: [
      { title: 'Confirm user, device and affected network', instructions: 'Verify identity through approved support procedure and record device/network details.' },
      { title: 'Check VPN service and known incidents', instructions: 'Review approved monitoring and incident records; do not change configuration yet.' },
      { title: 'Validate device time, network and client status', instructions: 'Run approved, non-destructive diagnostics and record findings.' },
      { title: 'Apply approved remediation', instructions: 'Perform only steps authorized for the assigned role; request approval for privileged changes.' },
      { title: 'Verify connectivity with requester', instructions: 'Confirm successful connection and document the result before closure.' }
    ]},
    account_access: { name: 'Account access request', category: 'Identity', priority: 'medium', tasks: [
      { title: 'Verify requester identity and business need', instructions: 'Use approved identity-verification procedures.' },
      { title: 'Check required role and access scope', instructions: 'Compare the request with the approved access catalog and least-privilege requirements.' },
      { title: 'Obtain required manager or owner approval', instructions: 'Do not grant access while approval is pending.' },
      { title: 'Apply access through the authorized system', instructions: 'Only a role with the required permission may perform the change.' },
      { title: 'Verify access and record audit evidence', instructions: 'Confirm the result and retain the request/approval reference.' }
    ]}
  });

  function client() {
    if (!global.MaximusIdentity) throw new Error('Sign in before using HelpBuddy.');
    const supabase = global.MaximusSupabase && global.MaximusSupabase.getClient();
    if (!supabase) throw new Error('Supabase is not configured.');
    return supabase;
  }
  function identityScope() {
    const identity = global.MaximusIdentity;
    const profile = identity && identity.profile;
    if (!profile || !profile.organization_id) throw new Error('Your profile is missing an organization assignment. Ask an administrator to complete provisioning.');
    return { organization_id: profile.organization_id, tenant_id: profile.tenant_id || null };
  }
  function can(permission) {
    const identity = global.MaximusIdentity;
    return Boolean(identity && identity.roles && identity.roles.some(role => role.key === permission || role.key === 'global_admin'));
  }
  async function listTickets(filters = {}) {
    const db = client(), scope = identityScope();
    let query = db.from('tickets').select('id,ticket_number,title,description,category,priority,status,current_step,total_steps,requester_profile_id,assigned_profile_id,opened_at,updated_at').eq('organization_id', scope.organization_id).order('updated_at', { ascending: false }).limit(100);
    if (scope.tenant_id) query = query.eq('tenant_id', scope.tenant_id);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority', filters.priority);
    if (filters.search) query = query.ilike('title', '%' + filters.search.replace(/[%_]/g, '') + '%');
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
  async function searchTickets(query = '') {
    const text = String(query || '').trim();
    if (!text) return listTickets({});
    const db = client(), scope = identityScope();
    const cleaned = text.replace(/[%_]/g, '').slice(0, 100);
    let q = db.from('tickets').select('id,ticket_number,title,description,category,priority,status,current_step,total_steps,requester_profile_id,assigned_profile_id,opened_at,updated_at,resolution_summary').eq('organization_id', scope.organization_id).or('title.ilike.%' + cleaned + '%,description.ilike.%' + cleaned + '%').order('updated_at', { ascending: false }).limit(25);
    if (scope.tenant_id) q = q.eq('tenant_id', scope.tenant_id);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }
  async function getTicketContext(ticketId) {
    const db = client(), scope = identityScope();
    let q = db.from('tickets').select('id,ticket_number,organization_id,tenant_id,title,description,category,priority,status,current_step,total_steps,requester_profile_id,assigned_profile_id,opened_at,updated_at,resolution_summary,resolved_at,closed_at').eq('organization_id', scope.organization_id);
    if (scope.tenant_id) q = q.eq('tenant_id', scope.tenant_id);
    if (/^\\d+$/.test(String(ticketId))) q = q.eq('ticket_number', Number(ticketId));
    else q = q.eq('id', String(ticketId));
    const ticketResult = await q.maybeSingle();
    if (ticketResult.error) throw ticketResult.error;
    if (!ticketResult.data) throw new Error('I could not find that ticket in your authorized company scope.');
    const ticket = ticketResult.data;
    const [events, messages, notes, steps, actions] = await Promise.all([
      db.from('ticket_lifecycle_events').select('event_key,from_status,to_status,reason,metadata,actor_profile_id,created_at').eq('ticket_id', ticket.id).order('created_at', { ascending: true }).limit(100),
      db.from('ticket_conversation_messages').select('channel,body,visibility,author_profile_id,created_at').eq('ticket_id', ticket.id).order('created_at', { ascending: true }).limit(100),
      db.from('ticket_notes').select('note_type,body,restricted,author_profile_id,created_at').eq('ticket_id', ticket.id).order('created_at', { ascending: true }).limit(100),
      db.from('ticket_steps').select('step_number,title,instructions,step_status,completed_by,completed_at,result').eq('ticket_id', ticket.id).order('step_number', { ascending: true }).limit(100),
      db.from('assistant_ticket_actions').select('action_type,action_status,summary,approval_required,executed_at,verified_at,created_at').eq('ticket_id', ticket.id).eq('organization_id', scope.organization_id).order('created_at', { ascending: true }).limit(100)
    ]);
    for (const result of [events, messages, notes, steps, actions]) if (result.error) throw result.error;
    return { ticket, history: events.data || [], messages: messages.data || [], notes: (notes.data || []).filter(n => !n.restricted), steps: steps.data || [], assistantActions: actions.data || [] };
  }
  async function createTicket(input = {}) {
    const db = client(), scope = identityScope();
    const title = String(input.title || '').trim();
    if (title.length < 4 || title.length > 180) throw new Error('Ticket title must be between 4 and 180 characters.');
    const priority = ALLOWED_PRIORITIES.has(input.priority) ? input.priority : 'medium';
    const { data, error } = await db.from('tickets').insert({
      organization_id: scope.organization_id, tenant_id: scope.tenant_id,
      requester_profile_id: global.MaximusIdentity.userId,
      title, description: String(input.description || '').trim().slice(0, 10000),
      category: String(input.category || 'General').slice(0, 80), priority, status: 'new',
      source: 'helpbuddy', current_step: 1, total_steps: Array.isArray(input.tasks) ? input.tasks.length : 0
    }).select().single();
    if (error) throw error;
    await writeAudit('ticket.created', 'ticket', data.id, { title, priority });
    return data;
  }
  async function createWorkflowRun(key, ticketId) {
    const db = client(), scope = identityScope();
    const template = WORKFLOWS[key];
    if (!template) throw new Error('Choose one of the available, versioned workflow templates.');
    if (ticketId) {
      const { data: ticket, error } = await db.from('tickets').select('id,organization_id,tenant_id').eq('id', ticketId).eq('organization_id', scope.organization_id).maybeSingle();
      if (error) throw error;
      if (!ticket || (scope.tenant_id && ticket.tenant_id !== scope.tenant_id)) throw new Error('Ticket not found in your authorized organization scope.');
    }
    const workflowKey = 'helpbuddy_' + key;
    let { data: workflow, error: workflowError } = await db.from('workflows').select('id,definition,version').eq('organization_id', scope.organization_id).eq('workflow_key', workflowKey).maybeSingle();
    if (workflowError) throw workflowError;
    if (!workflow) {
      const created = await db.from('workflows').insert({
        organization_id: scope.organization_id, tenant_id: scope.tenant_id, workflow_key: workflowKey,
        name: template.name, description: 'HelpBuddy deterministic remediation workflow',
        status: 'active', version: 1, created_by: global.MaximusIdentity.userId,
        definition: { key, tasks: template.tasks }
      }).select().single();
      if (created.error) throw created.error;
      workflow = created.data;
    }
    const run = await db.from('workflow_runs').insert({
      workflow_id: workflow.id, organization_id: scope.organization_id, tenant_id: scope.tenant_id,
      started_by: global.MaximusIdentity.userId, run_status: 'in_progress', current_step: 1,
      run_context: { template_key: key, ticket_id: ticketId || null, tasks: template.tasks.map((task, i) => ({ ...task, step_number: i + 1, status: 'pending' })) }
    }).select().single();
    if (run.error) throw run.error;
    if (ticketId) {
      const taskRows = template.tasks.map((task, i) => ({ ticket_id: ticketId, step_number: i + 1, title: task.title, instructions: task.instructions, step_status: 'pending', result: { workflow_run_id: run.data.id } }));
      const stepResult = await db.from('ticket_steps').insert(taskRows);
      if (stepResult.error) throw stepResult.error;
      // Ticket status remains unchanged until assignment.
    }
    await writeAudit('workflow.started', 'workflow_run', run.data.id, { key, ticketId: ticketId || null, version: workflow.version || 1 });
    return { workflow, run: run.data, tasks: template.tasks };
  }
  async function completeStep(ticketId, stepId, result = {}) {
    const db = client(), scope = identityScope();
    if (!ticketId || !stepId) throw new Error('Ticket and remediation step are required.');
    const { data: step, error: readError } = await db.from('ticket_steps').select('id,ticket_id,step_number,step_status').eq('id', stepId).eq('ticket_id', ticketId).maybeSingle();
    if (readError) throw readError;
    if (!step) throw new Error('Remediation step was not found in this ticket.');
    if (step.step_status === 'completed') return step;
    const { data, error } = await db.from('ticket_steps').update({ step_status: 'completed', completed_by: global.MaximusIdentity.userId, completed_at: new Date().toISOString(), result }).eq('id', stepId).eq('ticket_id', ticketId).select().single();
    if (error) throw error;
    const stepsResult = await db.from('ticket_steps').select('step_number,step_status').eq('ticket_id', ticketId).order('step_number', { ascending: true });
    if (stepsResult.error) throw stepsResult.error;
    const steps = stepsResult.data || [];
    const nextStep = steps.find(item => item.step_status !== 'completed');
    const ticketPatch = nextStep
      ? { current_step: nextStep.step_number, status: 'in_progress' }
      : { current_step: steps.length + 1, status: 'resolved', resolution_summary: 'Required remediation steps completed and verified.', resolved_at: new Date().toISOString() };
    const ticketResult = await db.from('tickets').update(ticketPatch).eq('id', ticketId).eq('organization_id', scope.organization_id).select('id,status,current_step').single();
    if (ticketResult.error) throw ticketResult.error;
    await writeAudit('ticket.step_completed', 'ticket_step', stepId, { ticketId, stepNumber: step.step_number, ticketStatus: ticketResult.data.status });
    return { step: data, ticket: ticketResult.data };
  }
  async function writeAudit(action, resourceType, resourceId, eventData = {}) {
    const db = client(), scope = identityScope();
    const { error } = await db.from('audit_events').insert({
      organization_id: scope.organization_id, tenant_id: scope.tenant_id,
      actor_profile_id: global.MaximusIdentity.userId, actor_auth_user_id: global.MaximusIdentity.userId,
      action, resource_type: resourceType, resource_id: String(resourceId), outcome: 'success', event_data: eventData
    });
    if (error) throw error;
  }
  async function handlePrompt(prompt) {
    const text = String(prompt || '').trim();
    if (!text) throw new Error('Enter a request for HelpBuddy.');

    // Existing-ticket context always takes precedence over creating new records.
    const ticketRef = text.match(/(?:ticket|case)\\s*(?:#|number\\s*)?(\\d{4,})/i);
    if (ticketRef && /history|status|update|details|what happened|who|assigned|progress|summary|show|open|check|review/i.test(text)) {
      return { type: 'ticket_context', data: await getTicketContext(ticketRef[1]) };
    }
    if (/list|show|open|my tickets|ticket queue/i.test(text) && !/create|new ticket/i.test(text)) return { type: 'tickets', data: await listTickets({}) };
    if (/search|find|look up|check|review/i.test(text) && /ticket|case|vpn|network|access|outage|incident/i.test(text) && !/create|new ticket/i.test(text)) {
      const terms = text.replace(/\\b(search|find|look up|check|review|ticket|case|for|about|the|my|please|helpbuddy)\\b/ig, '').trim();
      const matches = await searchTickets(terms);
      return { type: 'ticket_search', data: matches, query: terms };
    }
    if (/^(please\\s+)?(create|open|new)\\s+(a\\s+)?ticket\\b/i.test(text)) {
      const title = text.replace(/^(please\\s+)?(create|open|new)\\s+(a\\s+)?ticket\\s*(for|about|:)?\\s*/i, '').trim();
      if (title.length < 4) throw new Error('Tell me what the new ticket is about before I create it.');
      return { type: 'ticket', data: await createTicket({ title, category: /vpn|network/i.test(title) ? 'Network' : 'General', priority: /outage|critical|security breach/i.test(title) ? 'high' : 'medium' }) };
    }
    if (/vpn|network connection/i.test(text)) {
      const matches = await searchTickets(/vpn/i.test(text) ? 'VPN' : 'network');
      if (matches.length) return { type: 'ticket_search', data: matches, query: 'related existing tickets', message: 'I found existing tickets first. Choose one before starting a workflow so I do not create a duplicate.' };
      return { type: 'help', message: 'I could not find a matching existing ticket in your authorized scope. If you want, explicitly ask me to create a new ticket; I will not create one automatically.' };
    }
    if (/access request|account access|onboard user/i.test(text)) {
      const matches = await searchTickets('access');
      if (matches.length) return { type: 'ticket_search', data: matches, query: 'access', message: 'I found existing access-related tickets first. Choose one before starting a workflow.' };
      return { type: 'help', message: 'I could not find an existing access ticket. Explicitly ask me to create a new ticket if that is what you intend.' };
    }
    return { type: 'help', message: 'I can search existing tickets, show authorized ticket history, create a ticket when explicitly requested, and start approved workflows. I will not create duplicate tickets just because you mention an issue.' };
  }

  global.HelpBuddyService = Object.freeze({ CHECKPOINTS, WORKFLOWS, listTickets, searchTickets, getTicketContext, createTicket, createWorkflowRun, completeStep, writeAudit, handlePrompt, can });
})(window);
