(function(global){
 const MANAGERS=new Set(['super_admin','global_admin','organization_admin','service_desk_manager','it_manager']);
 const TECHS=new Set([...MANAGERS,'technician']);
 const STATUS=new Set(['new','triaged','assigned','in_progress','waiting','resolved','closed','cancelled']);
 function db(){if(!global.MaximusIdentity)throw new Error('Sign in before managing tickets.');const c=global.MaximusSupabase&&global.MaximusSupabase.getClient();if(!c)throw new Error('Supabase is not configured.');return c;}
 function scope(){const p=global.MaximusIdentity.profile;if(!p||!p.organization_id)throw new Error('Missing organization scope.');return {organization_id:p.organization_id,tenant_id:p.tenant_id||null};}
 function roleKeys(){return (global.MaximusIdentity.roles||[]).map(r=>r.key);}
 function hasRole(set){return roleKeys().some(k=>set.has(k));}
 function userId(){return global.MaximusIdentity.userId;}
 async function ticket(id){const s=scope();let q=db().from('tickets').select('id,organization_id,tenant_id,requester_profile_id,assigned_profile_id,title,category,status,priority,current_step,total_steps,resolution_summary').eq('id',id).eq('organization_id',s.organization_id);if(s.tenant_id)q=q.eq('tenant_id',s.tenant_id);const r=await q.maybeSingle();if(r.error)throw r.error;if(!r.data)throw new Error('Ticket is outside your authorized scope.');return r.data;}
 async function event(t,key,from,to,reason,metadata={}){const s=scope();const r=await db().from('ticket_lifecycle_events').insert({organization_id:s.organization_id,tenant_id:t.tenant_id||null,ticket_id:t.id,actor_profile_id:userId(),event_key:key,from_status:from||null,to_status:to||null,reason:reason||null,metadata});if(r.error)throw r.error;}
 async function transition(id,next,reason,extra={}){
   if(!STATUS.has(next))throw new Error('Unsupported ticket status.');
   const t=await ticket(id), me=userId(), manager=hasRole(MANAGERS), technician=hasRole(TECHS)&&t.assigned_profile_id===me;
   if(['resolved','closed','cancelled','assigned','triaged'].includes(next)&&!manager&&!technician)throw new Error('Your role cannot perform that ticket transition.');
   if(next==='in_progress'&&!manager&&!technician)throw new Error('Only the assigned technician or an authorized manager may start work.');
   if(next==='waiting'&&!manager&&!technician)throw new Error('Only the assigned technician or an authorized manager may place work on hold.');
   if(next==='resolved'&&String(extra.resolution_summary||'').trim().length<4)throw new Error('Provide a resolution summary of at least four characters.');
   if(['resolved','closed','cancelled'].includes(next)&&String(reason||'').trim().length<4)throw new Error('A reason is required for this transition.');
   const patch={status:next};
   if(next==='resolved'){patch.resolution_summary=String(extra.resolution_summary).trim();patch.resolved_at=new Date().toISOString();}
   if(next==='closed')patch.closed_at=new Date().toISOString();
   if(next==='in_progress'&&t.status==='new')patch.status='in_progress';
   const s=scope();let q=db().from('tickets').update(patch).eq('id',id).eq('organization_id',s.organization_id);if(s.tenant_id)q=q.eq('tenant_id',s.tenant_id);
   const result=await q.select('id,status,resolution_summary,resolved_at,closed_at').single();if(result.error)throw result.error;
   const key=next==='resolved'?'resolved':next==='closed'?'closed':next==='waiting'?'waiting':next==='in_progress'?'in_progress':'triaged';
   await event(t,key,t.status,result.data.status,reason,extra);
   await audit('ticket.'+key,t.id,{from:t.status,to:result.data.status,reason});
   return result.data;
 }
 async function assign(id,assigneeId,reason){
   if(!hasRole(MANAGERS))throw new Error('Assignment requires an authorized service-desk or organization manager role.');
   if(!assigneeId)throw new Error('Choose an assignee.');
   const t=await ticket(id),s=scope();
   const prof=await db().from('profiles').select('id,organization_id,tenant_id,member_status').eq('id',assigneeId).maybeSingle();
   if(prof.error)throw prof.error;
   if(!prof.data||prof.data.organization_id!==s.organization_id||(s.tenant_id&&prof.data.tenant_id!==s.tenant_id)||prof.data.member_status!=='active')throw new Error('Assignee must be an active member of the same authorized organization and tenant.');
   const updated=await db().from('tickets').update({assigned_profile_id:assigneeId,status:'assigned'}).eq('id',id).eq('organization_id',s.organization_id).select('id,status,assigned_profile_id').single();
   if(updated.error)throw updated.error;
   await event(t,'assigned',t.status,'assigned',reason||'Assigned by authorized manager',{assignee_profile_id:assigneeId});
   await audit('ticket.assigned',id,{assignee_profile_id:assigneeId,reason:reason||''});return updated.data;
 }
 async function requestApproval(id,permissionKey,reason){
   if(!permissionKey||String(reason||'').trim().length<4)throw new Error('Specify the requested permission and business reason.');
   const t=await ticket(id),s=scope();
   const r=await db().from('ticket_approval_requests').insert({organization_id:s.organization_id,tenant_id:t.tenant_id||null,ticket_id:id,requested_by:userId(),permission_key:String(permissionKey).slice(0,120),reason:String(reason).trim().slice(0,2000)}).select().single();
   if(r.error)throw r.error;
   await event(t,'approval_requested',t.status,t.status,reason,{approval_request_id:r.data.id,permission_key:permissionKey});
   await audit('ticket.approval_requested',id,{approval_request_id:r.data.id,permission_key:permissionKey});return r.data;
 }
 async function decideApproval(id,decision,reason){
   if(!hasRole(MANAGERS))throw new Error('Approval decisions require an authorized approver role.');
   if(!['approved','denied'].includes(decision)||String(reason||'').trim().length<4)throw new Error('Choose approve/deny and enter a decision reason.');
   const s=scope(),t=await ticket(id);
   const r=await db().from('ticket_approval_requests').update({status:decision,approver_profile_id:userId(),decision_reason:String(reason).trim().slice(0,2000),decided_at:new Date().toISOString()}).eq('ticket_id',id).eq('organization_id',s.organization_id).eq('status','pending').select().single();
   if(r.error)throw r.error;
   await event(t,decision==='approved'?'approval_granted':'approval_denied',t.status,t.status,reason,{approval_request_id:r.data.id,permission_key:r.data.permission_key});
   await audit('ticket.approval_'+decision,id,{approval_request_id:r.data.id,permission_key:r.data.permission_key,reason});return r.data;
 }
 async function escalate(id,level,reason,assigneeId,dueAt){
   if(!hasRole(TECHS))throw new Error('Escalation requires a technician or manager role.');
   const t=await ticket(id),s=scope();
   if(!Number.isInteger(level)||level<1||level>4||String(reason||'').trim().length<4)throw new Error('Select escalation level 1–4 and enter a reason.');
   const r=await db().from('ticket_escalations').insert({organization_id:s.organization_id,tenant_id:t.tenant_id||null,ticket_id:id,level,escalation_reason:String(reason).trim().slice(0,2000),escalated_by:userId(),assigned_to:assigneeId||null,due_at:dueAt||null}).select().single();
   if(r.error)throw r.error;
   await event(t,'escalated',t.status,t.status,reason,{escalation_id:r.data.id,level});await audit('ticket.escalated',id,{escalation_id:r.data.id,level,reason});return r.data;
 }
 async function audit(action,id,data){const s=scope();const r=await db().from('audit_events').insert({organization_id:s.organization_id,tenant_id:s.tenant_id,actor_profile_id:userId(),actor_auth_user_id:userId(),action,resource_type:'ticket',resource_id:String(id),outcome:'success',event_data:data||{}});if(r.error)throw r.error;}
 async function history(id){await ticket(id);const r=await db().from('ticket_lifecycle_events').select('id,event_key,from_status,to_status,reason,metadata,actor_profile_id,created_at').eq('ticket_id',id).order('created_at',{ascending:true});if(r.error)throw r.error;return r.data||[];}
 global.TicketLifecycle=Object.freeze({transition,assign,requestApproval,decideApproval,escalate,history,hasRole});
})(window);
