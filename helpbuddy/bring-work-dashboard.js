/* Bring the Work to You role dashboard model. UI can render these panels in-place. */
(function (global) {
  'use strict';
  const ROLE_PANELS = Object.freeze({
    'Help Desk': ['Critical', 'High Impact', 'SLA Risk', 'SLA Breached', 'Medium', 'Unassigned', 'My Active Work', 'Waiting on Me', 'Escalations', 'Quick Workflows'],
    'Security': ['Critical Threats', 'Active Incidents', 'SLA Risk', 'Investigations', 'Escalations', 'My Active Work', 'Waiting on Me', 'Unassigned', 'Quick Workflows'],
    'Network': ['Critical Alerts', 'SLA Risk', 'Device Health', 'Changes', 'Escalations', 'My Active Work', 'Unassigned', 'Waiting on Me', 'Quick Workflows'],
    'Manager': ['Approvals', 'SLA Risk', 'Team Workload', 'Escalations', 'Waiting on Me', 'Unassigned', 'Critical', 'High Impact', 'Quick Workflows'],
    'Executive': ['Critical Business Issues', 'Major Incidents', 'Security Events', 'Executive Decisions', 'Approvals', 'Enterprise Risk', 'Escalations', 'Quick Workflows']
  });
  function panelsFor(role) { return (ROLE_PANELS[role] || ROLE_PANELS['Help Desk']).slice(); }
  function summarize(items = []) { const open=items.filter(x=>!['Closed','Resolved'].includes(x.status)); return { critical:open.filter(x=>x.priority==='Critical').length, high:open.filter(x=>x.priority==='High').length, medium:open.filter(x=>x.priority==='Medium').length, slaRisk:open.filter(x=>x.slaState==='risk').length, slaBreached:open.filter(x=>x.slaState==='breached').length, unassigned:open.filter(x=>!x.assigneeId && x.available!==false).length }; }
  global.HelpBuddyBringWork = Object.freeze({ ROLE_PANELS, panelsFor, summarize });
})(window);
