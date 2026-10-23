/* Ticket Situation Simulator integration. Uses only the publishable Supabase key.
 * All authorization decisions remain server-side in Auth + RLS + private permission helpers.
 */
(() => {
  'use strict';
  const SUPABASE_URL = 'https://odgahlgnvhpluapfhlpt.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_gNY_8ips8kVULTnWAvtWfA_wAaKQnOv';
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const $ = id => document.getElementById(id);
  const state = { user: null, profile: null, role: null, orgs: [], orgId: null, assets: [], articles: [], activeTicket: null, activeScenario: null, activeSession: null, workflow: null, steps: [], conversation: [] };

  function message(el, text, kind) {
    el.textContent = text || '';
    el.className = 'message' + (text ? (kind ? ' ' + kind : '') : ' hidden');
  }
  function globalMessage(text, kind) { message($('globalMessage'), text, kind); }
  function safe(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function shortDate(v) { return v ? new Date(v).toLocaleString() : '—'; }
  function levelLabel(v) {
    return ({l1:'Help Desk L1',l2:'Help Desk L2',l3:'Help Desk L3 / Engineering',it_admin:'IT Administration',noc:'Network Operations Center',soc:'Security Operations Center',governance:'Governance & Compliance',applications:'Applications',cloud_infrastructure:'Cloud & Infrastructure',business_services:'Business Services',msp:'Managed Service Provider',unassigned:'Unassigned'})[v] || v || '—';
  }
  function statusClass(v) { return ['resolved','closed','completed'].includes(String(v||'').toLowerCase()) ? 'done' : ['critical','high'].includes(String(v||'').toLowerCase()) ? String(v).toLowerCase() : ''; }

  function buildChecklist(problem, supportLevel) {
    const p = problem.toLowerCase();
    const steps = [
      ['Confirm scope and impact','Identify affected users, locations, devices, services, start time, and business impact.','Document the scope and distinguish a single-user issue from a wider outage.'],
      ['Capture symptoms and evidence','Record the exact error, timestamps, recent changes, and reproducible symptoms before making changes.','A clear symptom statement and evidence are attached to the ticket.']
    ];
    const add = (title, detail, expected) => steps.push([title, detail, expected]);
    if (/vpn|network|wifi|wireless|dns|dhcp|internet|connect|latency|routing|switch|firewall/.test(p)) {
      add('Check network path and name resolution','Verify link state, IP configuration, gateway, DNS resolution, and whether the issue reproduces on an approved alternate path.','Evidence narrows the issue to endpoint, network path, name resolution, or service.');
      add('Compare affected and healthy endpoints','Compare configuration and reachability with a known-good device in the same location or network segment.','Differences are documented without changing shared network settings.');
    }
    if (/password|sign.?in|login|auth|mfa|account|locked|identity|entra|active directory|token/.test(p)) {
      add('Validate identity and account state','Check account status, sign-in logs, MFA enrollment, credential-change timing, and session/token errors using authorized tools.','The failing authentication stage and any policy denial are identified.');
      add('Check access policy and group membership','Review effective group membership and conditional-access or access-policy results; do not grant elevated access as a troubleshooting shortcut.','The cause is tied to a specific policy, membership, or identity condition.');
    }
    if (/email|outlook|mailbox|microsoft 365|office 365|teams|calendar/.test(p)) {
      add('Verify service and client health','Check service availability, client version, web-client behavior, mailbox/service assignment, and relevant connection diagnostics.','Client-specific and service-wide causes are distinguished.');
    }
    if (/laptop|desktop|device|endpoint|printer|driver|battery|boot|windows|mac|hardware/.test(p)) {
      add('Inspect device health and configuration','Check device inventory, management/enrollment state, storage, updates, driver status, and endpoint protection health.','Device-specific findings and any required maintenance are recorded.');
    }
    if (/phish|malware|ransom|suspicious|breach|compromise|alert|threat|security|exfiltrat/.test(p) || supportLevel === 'soc') {
      add('Preserve evidence and follow security handling','Capture alert identifiers and relevant timestamps; follow incident-handling procedures and avoid deleting evidence or contacting suspected actors.','Evidence is preserved and the appropriate security escalation path is followed.');
      add('Assess containment and approval requirements','Determine whether authorized containment is required and obtain the prescribed approval before disruptive actions.','Containment decisions, approvals, and scope are recorded.');
    }
    if (/cloud|server|database|storage|api|integration|application|website|service unavailable|performance/.test(p) || ['applications','cloud_infrastructure','l3'].includes(supportLevel)) {
      add('Check service dependencies and recent changes','Review service health, dependency status, recent deployments/configuration changes, and available logs or metrics.','The likely failing component or dependency is identified with evidence.');
    }
    if (/audit|compliance|policy|evidence|access review|governance/.test(p) || supportLevel === 'governance') {
      add('Verify policy, evidence, and approval requirements','Identify the applicable control, evidence requirement, owner, due date, and any formal exception or approval process.','The ticket references the relevant control and required evidence.');
    }
    add('Choose the least-disruptive corrective action','Use the documented evidence and approved runbook. Confirm the required role and approval before changing production systems or access.','A specific, authorized remediation is selected with a rollback or recovery path where applicable.');
    add('Validate recovery with the requester or service owner','Repeat the original test, confirm affected users can work, and monitor for recurrence.','The original symptom is no longer present and validation is recorded.');
    add('Document resolution and follow-up','Record root cause, action taken, evidence, knowledge article, residual risk, and any follow-up or problem-management item.','The ticket has a clear, reviewable resolution record.');
    return steps.map((s,i)=>({id:'step-'+(i+1),title:s[0],description:s[1],expectedResult:s[2],completed:false,completedAt:null}));
  }

  function classify(problem, supportLevel) {
    const p = problem.toLowerCase();
    if (/phish|malware|ransom|suspicious|breach|compromise|threat/.test(p)) return 'security';
    if (/vpn|network|wifi|wireless|dns|dhcp|internet|connect|latency|routing/.test(p)) return 'network';
    if (/password|sign.?in|login|auth|mfa|account|identity|entra|active directory/.test(p)) return 'identity_access';
    if (/email|outlook|mailbox|microsoft 365|office 365|teams|calendar/.test(p)) return 'collaboration';
    if (/laptop|desktop|device|endpoint|printer|driver|windows|mac|hardware/.test(p)) return 'endpoint';
    if (/audit|compliance|policy|evidence|governance/.test(p)) return 'governance_compliance';
    if (/cloud|server|database|storage|api|integration|application|website/.test(p)) return 'application_infrastructure';
    return supportLevel === 'l1' ? 'service_desk' : supportLevel;
  }

  function titleFrom(problem) {
    const sentence = problem.trim().split(/[.!?\n]/)[0].trim();
    return (sentence.length > 90 ? sentence.slice(0,87)+'…' : sentence) || 'Technical support investigation';
  }

  function showChecklist(target, steps, interactive) {
    target.innerHTML = steps.map((s,i)=>'<label class="step '+(s.completed?'complete':'')+'"><input type="checkbox" data-step="'+i+'" '+(s.completed?'checked':'')+(interactive?'':' disabled')+'><span><b>'+safe(s.title)+'</b><small>'+safe(s.description)+'</small><small><strong>Expected:</strong> '+safe(s.expectedResult || '')+'</small></span></label>').join('');
  }
  function preview() {
    const problem = $('problem').value.trim();
    if (!problem) { message($('scenarioMessage'),'Describe the problem first.','error'); return; }
    const steps = buildChecklist(problem,$('supportLevel').value);
    showChecklist($('previewStepsList'),steps,false);
    $('previewPanel').classList.remove('hidden');
    if (!$('scenarioTitle').value.trim()) $('scenarioTitle').value = titleFrom(problem);
    message($('scenarioMessage'), 'Checklist prepared from the issue description and selected support queue. Review and adjust the problem details before creating the ticket.', 'ok');
  }

  async function loadWorkspace() {
    const { data: profile, error } = await db.from('profiles').select('id,organization_id,display_name,first_name,last_name,role_id,global_user_id,access_status').eq('auth_user_id',state.user.id).maybeSingle();
    if (error) throw error;
    if (!profile) throw new Error('This sign-in is not linked to an employee profile. Ask an administrator to link the Supabase Auth user to the correct profile.');
    if (profile.access_status && profile.access_status !== 'active') throw new Error('This profile is not active. Contact an authorized administrator.');
    state.profile = profile;
    const { data: role } = await db.from('roles').select('name,code').eq('id',profile.role_id).maybeSingle();
    state.role = role;
    $('profileName').textContent = profile.display_name || [profile.first_name,profile.last_name].filter(Boolean).join(' ') || 'Authorized user';
    $('profileRole').textContent = (role?.name || 'Assigned role') + ' · ' + (profile.global_user_id || 'Global ID available');
    const { data: orgs, error: orgErr } = await db.from('organizations').select('id,name,slug,organization_type').order('name');
    if (orgErr) throw orgErr;
    state.orgs = orgs || [];
    if (!state.orgs.some(o=>o.id===profile.organization_id)) {
      const { data: ownOrg, error: ownErr } = await db.from('organizations').select('id,name,slug,organization_type').eq('id',profile.organization_id).maybeSingle();
      if (ownErr) throw ownErr;
      if (ownOrg) state.orgs.unshift(ownOrg);
    }
    $('orgSelect').innerHTML = state.orgs.map(o=>'<option value="'+safe(o.id)+'">'+safe(o.name)+' · '+safe(o.organization_type)+'</option>').join('');
    state.orgId = state.orgs.some(o=>o.id===profile.organization_id) ? profile.organization_id : (state.orgs[0]?.id || null);
    if (!state.orgId) throw new Error('No organization is available to this account. Check tenant membership and dashboard permissions.');
    $('orgSelect').value = state.orgId;
    await loadOrgResources();
    await refreshCounts();
    await searchTickets('');
  }

  async function loadOrgResources() {
    const orgId = state.orgId;
    const [assetsResult, articlesResult] = await Promise.all([
      db.from('assets').select('id,asset_tag,display_name,asset_type,status').eq('organization_id',orgId).order('display_name').limit(300),
      db.from('knowledge_articles').select('id,article_code,title,summary,category,organization_id,visibility').eq('status','published').order('title').limit(300)
    ]);
    state.assets = assetsResult.error ? [] : (assetsResult.data || []);
    state.articles = articlesResult.error ? [] : (articlesResult.data || []).filter(a=>!a.organization_id || a.organization_id===orgId || a.visibility==='public');
    $('assetSelect').innerHTML = '<option value="">No specific asset selected</option>'+state.assets.map(a=>'<option value="'+safe(a.id)+'">'+safe(a.asset_tag)+' · '+safe(a.display_name)+' ('+safe(a.asset_type)+')</option>').join('');
    $('articleSelect').innerHTML = '<option value="">No linked article</option>'+state.articles.map(a=>'<option value="'+safe(a.id)+'">'+safe(a.article_code)+' · '+safe(a.title)+'</option>').join('');
  }

  async function refreshCounts() {
    const orgId=state.orgId;
    const [all, scenarios, open] = await Promise.all([
      db.from('tickets').select('id',{count:'exact',head:true}).eq('organization_id',orgId),
      db.from('ticket_scenarios').select('id',{count:'exact',head:true}).eq('organization_id',orgId),
      db.from('tickets').select('id',{count:'exact',head:true}).eq('organization_id',orgId).not('status','in','(resolved,closed,cancelled)')
    ]);
    $('ticketCount').textContent = all.error ? '—' : String(all.count ?? 0);
    $('scenarioCount').textContent = scenarios.error ? '—' : String(scenarios.count ?? 0);
    $('openCount').textContent = open.error ? '—' : String(open.count ?? 0);
  }

  async function searchTickets(q) {
    const query = String(q||'').trim();
    let req = db.from('tickets').select('id,ticket_number,organization_id,title,description,ticket_type,category,priority,severity,status,support_level,asset_id,affected_service,created_at,updated_at').eq('organization_id',state.orgId).order('created_at',{ascending:false}).limit(40);
    if (/^\d+$/.test(query)) req = req.eq('ticket_number',Number(query));
    else if (query) {
      const safeQuery = query.replace(/[,%()]/g,' ').replace(/\s+/g,' ').trim();
      req = req.or('title.ilike.%'+safeQuery+'%,description.ilike.%'+safeQuery+'%,category.ilike.%'+safeQuery+'%,affected_service.ilike.%'+safeQuery+'%');
    }
    const {data,error}=await req;
    if(error) { $('ticketResults').innerHTML='<div class="message error">'+safe(error.message)+'</div>'; return; }
    const rows=data||[];
    $('ticketResults').innerHTML=rows.length ? rows.map(t=>'<button class="ticket" data-ticket="'+safe(t.id)+'"><strong>#'+safe(t.ticket_number)+' · '+safe(t.title)+'</strong><div class="sub">'+safe(t.category||t.ticket_type)+' · '+safe(levelLabel(t.support_level))+' · '+safe(shortDate(t.created_at))+'</div><div class="meta"><span class="pill '+statusClass(t.priority)+'">'+safe(t.priority)+'</span><span class="pill">'+safe(t.status)+'</span></div></button>').join('') : '<div class="hint">No matching tickets found in this organization.</div>';
    $('ticketResults').querySelectorAll('[data-ticket]').forEach(b=>b.addEventListener('click',()=>openTicket(b.dataset.ticket)));
  }

  async function createScenario(ev) {
    ev.preventDefault();
    const problem=$('problem').value.trim();
    if(!problem){message($('scenarioMessage'),'Describe the problem first.','error');return;}
    const steps=buildChecklist(problem,$('supportLevel').value);
    const title=$('scenarioTitle').value.trim()||titleFrom(problem);
    const priority=$('priority').value;
    const environment={category:classify(problem,$('supportLevel').value),impact:priority==='critical'||priority==='high'?'high':'medium',urgency:priority==='critical'||priority==='high'?'high':'medium',affected_service:$('articleSelect').selectedOptions[0]?.textContent||'',submitted_from:'ticket_situation_simulator'};
    $('createScenario').disabled=true;
    message($('scenarioMessage'),'Creating the ticket, workflow, HelpBuddy checklist, and audit-linked records…');
    try{
      const {data,error}=await db.rpc('create_ticket_scenario',{
        p_organization_id:state.orgId,p_title:title,p_problem_statement:problem,
        p_ticket_type:$('ticketType').value,p_priority:priority,p_support_level:$('supportLevel').value,
        p_asset_id:$('assetSelect').value||null,p_knowledge_article_id:$('articleSelect').value||null,
        p_environment:environment,p_steps:steps
      });
      if(error)throw error;
      message($('scenarioMessage'),'Created ticket #'+data.ticket_number+' and scenario #'+data.scenario_number+'. HelpBuddy, workflow, and audit records are linked.','ok');
      $('previewPanel').classList.add('hidden');
      await refreshCounts();
      await searchTickets(String(data.ticket_number));
      await openTicket(data.ticket_id);
    }catch(e){message($('scenarioMessage'),e.message||'Could not create the scenario. Verify your organization membership and tickets.manage + workflows.run permissions.','error');}
    finally{$('createScenario').disabled=false;}
  }

  async function openTicket(ticketId) {
    const {data:ticket,error}=await db.from('tickets').select('*').eq('id',ticketId).eq('organization_id',state.orgId).single();
    if(error){globalMessage(error.message,'error');return;}
    state.activeTicket=ticket; state.activeScenario=null; state.activeSession=null; state.workflow=null; state.steps=[]; state.conversation=[];
    const [scenarioRes,sessionRes,assetRes,historyRes,commentsRes,linksRes] = await Promise.all([
      db.from('ticket_scenarios').select('*').eq('ticket_id',ticketId).maybeSingle(),
      db.from('helpbuddy_sessions').select('*').eq('ticket_id',ticketId).maybeSingle(),
      ticket.asset_id ? db.from('assets').select('id,asset_tag,display_name,asset_type,status').eq('id',ticket.asset_id).maybeSingle() : Promise.resolve({data:null}),
      db.from('ticket_history').select('event_type,old_value,new_value,note,occurred_at,actor_profile_id').eq('ticket_id',ticketId).order('occurred_at',{ascending:false}).limit(30),
      db.from('ticket_comments').select('comment_body,is_internal,created_at,author_profile_id').eq('ticket_id',ticketId).order('created_at',{ascending:false}).limit(30),
      db.from('ticket_knowledge_links').select('knowledge_article_id,relevance_note,created_at').eq('ticket_id',ticketId)
    ]);
    state.activeScenario=scenarioRes.data||null; state.activeSession=sessionRes.data||null;
    state.steps=Array.isArray(state.activeSession?.checklist) ? state.activeSession.checklist : (Array.isArray(state.activeScenario?.generated_steps)?state.activeScenario.generated_steps:[]);
    state.conversation=Array.isArray(state.activeSession?.conversation)?state.activeSession.conversation:[];
    if(state.activeScenario?.workflow_run_id){
      const wr=await db.from('workflow_runs').select('id,status,context,started_at,completed_at').eq('id',state.activeScenario.workflow_run_id).maybeSingle();
      state.workflow=wr.data||null;
    }
    $('activeScenario').classList.remove('hidden');
    $('activeTitle').textContent='#'+ticket.ticket_number+' · '+ticket.title;
    $('activeSummary').textContent=ticket.description||'No description supplied.';
    $('activeTicketStatus').textContent=ticket.status;
    $('activeTicketStatus').className='pill '+statusClass(ticket.status);
    $('activeTicketNumber').textContent='#'+ticket.ticket_number;
    $('activeScenarioNumber').textContent=state.activeScenario?'#'+state.activeScenario.scenario_number:'Existing ticket';
    $('activeSupportLevel').textContent=levelLabel(ticket.support_level);
    showChecklist($('activeChecklist'),state.steps,!!state.activeSession);
    $('saveProgress').disabled=!state.activeSession;
    $('resolveTicket').disabled=!state.activeSession;
    $('linkedRecords').innerHTML=[
      ['Organization',state.orgs.find(o=>o.id===ticket.organization_id)?.name||'Authorized organization'],
      ['Asset',assetRes.data ? assetRes.data.asset_tag+' · '+assetRes.data.display_name : 'No asset linked'],
      ['Workflow',state.workflow ? state.workflow.status : 'No workflow linked'],
      ['Knowledge base',(linksRes.data||[]).length+' linked article(s)']
    ].map(([k,v])=>'<div class="linkrow"><span>'+safe(k)+'</span><strong>'+safe(v)+'</strong></div>').join('');
    $('conversation').innerHTML=state.conversation.map(c=>'<div class="bubble">'+safe(c.text||c.message||'Workflow update')+'<small>'+safe(c.actor||'HelpBuddy')+' · '+safe(shortDate(c.createdAt||c.created_at))+'</small></div>').join('')||'<div class="hint">No HelpBuddy notes yet.</div>';
    const history=historyRes.error?[]:(historyRes.data||[]);
    $('ticketHistory').innerHTML=history.map(h=>'<div class="linkrow"><span>'+safe(h.event_type)+' · '+safe(shortDate(h.occurred_at))+'</span><strong>'+safe(h.note||h.new_value||'Updated')+'</strong></div>').join('')||'<div class="hint">No ticket history is visible to this role.</div>';
    if(commentsRes.data?.length){
      $('ticketHistory').innerHTML += commentsRes.data.map(c=>'<div class="linkrow"><span>Comment · '+safe(shortDate(c.created_at))+'</span><strong>'+safe(c.comment_body)+'</strong></div>').join('');
    }
    $('activeScenario').scrollIntoView({behavior:'smooth',block:'start'});
  }

  async function saveProgress() {
    if(!state.activeTicket||!state.activeSession) return;
    const checkboxes=[...$('activeChecklist').querySelectorAll('[data-step]')];
    state.steps=state.steps.map((s,i)=>({...s,completed:!!checkboxes[i]?.checked,completedAt:checkboxes[i]?.checked?(s.completedAt||new Date().toISOString()):null}));
    const next=state.steps.findIndex(s=>!s.completed);
    const currentStep=next<0?state.steps.length:next;
    const now=new Date().toISOString();
    const conversation=state.conversation.concat([{actor:'HelpBuddy',text:'Checklist progress saved. '+state.steps.filter(s=>s.completed).length+' of '+state.steps.length+' steps completed.',createdAt:now}]);
    try{
      const results=await Promise.all([
        db.from('helpbuddy_sessions').update({checklist:state.steps,current_step:currentStep,status:'in_progress',conversation}).eq('id',state.activeSession.id).select().single(),
        db.from('ticket_scenarios').update({generated_steps:state.steps,current_step:currentStep,status:'in_progress'}).eq('id',state.activeScenario.id).select().single(),
        db.from('workflow_runs').update({status:'in_progress',context:{...(state.workflow?.context||{}),last_saved_at:now,completed_steps:state.steps.filter(s=>s.completed).length,total_steps:state.steps.length}}).eq('id',state.activeScenario.workflow_run_id).select().single()
      ]);
      const failure=results.find(r=>r.error); if(failure)throw failure.error;
      state.activeSession=results[0].data; state.activeScenario=results[1].data; state.workflow=results[2].data; state.conversation=conversation;
      const {error:ticketErr}=await db.from('tickets').update({status:'in_progress'}).eq('id',state.activeTicket.id).eq('organization_id',state.orgId);
      if(ticketErr)throw ticketErr;
      globalMessage('Progress saved to HelpBuddy, scenario workflow, ticket, and audit history.','ok');
      await openTicket(state.activeTicket.id); await refreshCounts();
    }catch(e){globalMessage('Could not save progress: '+(e.message||'Permission or network error'),'error');}
  }

  async function resolveTicket() {
    if(!state.activeTicket||!state.activeSession||!state.activeScenario)return;
    const checked=[...$('activeChecklist').querySelectorAll('[data-step]')].every(x=>x.checked);
    if(!checked){globalMessage('Complete every checklist step before resolving the ticket.','error');return;}
    const now=new Date().toISOString();
    try{
      const [session,scenario,workflow,ticket]=await Promise.all([
        db.from('helpbuddy_sessions').update({status:'resolved',current_step:state.steps.length}).eq('id',state.activeSession.id).select().single(),
        db.from('ticket_scenarios').update({status:'resolved',current_step:state.steps.length,completed_at:now,outcome:{resolution:'Checklist completed and recovery verified',resolved_at:now}}).eq('id',state.activeScenario.id).select().single(),
        db.from('workflow_runs').update({status:'completed',completed_at:now,context:{...(state.workflow?.context||{}),completed_at:now,resolution_verified:true}}).eq('id',state.activeScenario.workflow_run_id).select().single(),
        db.from('tickets').update({status:'resolved',resolved_at:now,resolution_summary:'HelpBuddy checklist completed and recovery verified.'}).eq('id',state.activeTicket.id).eq('organization_id',state.orgId).select().single()
      ]);
      const failure=[session,scenario,workflow,ticket].find(r=>r.error);if(failure)throw failure.error;
      globalMessage('Ticket #'+ticket.data.ticket_number+' is resolved. Workflow completion and audit events were recorded.','ok');
      await openTicket(state.activeTicket.id);await refreshCounts();await searchTickets(String(ticket.data.ticket_number));
    }catch(e){globalMessage('Resolution failed: '+(e.message||'Permission or network error'),'error');}
  }

  async function addNote(ev) {
    ev.preventDefault();
    if(!state.activeSession||!state.activeTicket){globalMessage('Open a ticket with a HelpBuddy workflow before adding a workflow note.','error');return;}
    const text=$('noteText').value.trim();if(!text)return;
    const now=new Date().toISOString();
    const conversation=state.conversation.concat([{actor:state.profile.display_name||state.profile.first_name||'Authorized user',text,createdAt:now}]);
    try{
      const {data,error}=await db.from('helpbuddy_sessions').update({conversation}).eq('id',state.activeSession.id).select().single();
      if(error)throw error;
      const {error:commentError}=await db.from('ticket_comments').insert({ticket_id:state.activeTicket.id,author_profile_id:state.profile.id,comment_body:text,is_internal:true,source_status:'sample'});
      if(commentError)throw commentError;
      state.activeSession=data;state.conversation=conversation;$('noteText').value='';
      await openTicket(state.activeTicket.id);globalMessage('Note added to HelpBuddy and the ticket activity.','ok');
    }catch(e){globalMessage('Could not add the note: '+(e.message||'Permission or network error'),'error');}
  }

  async function signIn(ev) {
    ev.preventDefault();globalMessage('Signing in…');
    const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
    if(error){globalMessage(error.message,'error');return;}
    await activate();
  }
  async function activate() {
    const {data:{session}}=await db.auth.getSession();
    if(!session){$('signInPanel').classList.remove('hidden');$('app').classList.add('hidden');$('connectionStatus').textContent='Sign-in required';return;}
    state.user=session.user;$('signInPanel').classList.add('hidden');$('app').classList.remove('hidden');$('connectionStatus').textContent='Authenticated';
    try{await loadWorkspace();globalMessage('Connected securely. Data access is limited by your assigned role and organization permissions.','ok');}
    catch(e){$('app').classList.add('hidden');$('signInPanel').classList.remove('hidden');globalMessage(e.message||'Could not load authorized workspace.','error');}
  }

  $('signInForm').addEventListener('submit',signIn);
  $('signOut').addEventListener('click',async()=>{await db.auth.signOut();state.user=null;state.profile=null;$('app').classList.add('hidden');$('signInPanel').classList.remove('hidden');$('connectionStatus').textContent='Signed out';globalMessage('Signed out securely.');});
  $('previewSteps').addEventListener('click',preview);
  $('scenarioForm').addEventListener('submit',createScenario);
  $('searchForm').addEventListener('submit',ev=>{ev.preventDefault();searchTickets($('ticketSearch').value);});
  $('orgSelect').addEventListener('change',async()=>{state.orgId=$('orgSelect').value;state.activeTicket=null;state.activeScenario=null;state.activeSession=null;$('activeScenario').classList.add('hidden');await loadOrgResources();await refreshCounts();await searchTickets('');});
  $('saveProgress').addEventListener('click',saveProgress);
  $('resolveTicket').addEventListener('click',resolveTicket);
  $('noteForm').addEventListener('submit',addNote);
  $('activeChecklist').addEventListener('change',ev=>{const i=Number(ev.target.dataset.step);if(Number.isInteger(i)&&state.steps[i]){$('activeChecklist').querySelectorAll('.step')[i]?.classList.toggle('complete',ev.target.checked);}});
  db.auth.onAuthStateChange((_event,session)=>{if(session && session.user && !state.profile){state.user=session.user;setTimeout(()=>activate().catch(e=>globalMessage(e.message,'error')),0);}});
  $('connectionStatus').textContent='Ready for secure sign-in';
  activate().catch(e=>globalMessage(e.message,'error'));
})();