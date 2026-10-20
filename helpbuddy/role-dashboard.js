/* HelpBuddy Bring the Work to You role dashboard model.
 * Provides role-specific panel definitions and actionable queue categories.
 * This is presentation/data logic only; authorization must be enforced by the backend.
 */
(function (global) {
  'use strict';

  const PANELS = Object.freeze({
    'Help Desk': [
      ['critical', 'Critical', 'priority', 'Critical'],
      ['high-impact', 'High Impact', 'impact', 'High'],
      ['sla-risk', 'SLA Risk', 'slaState', 'At Risk'],
      ['sla-breached', 'SLA Breached', 'slaState', 'Breached'],
      ['medium', 'Medium', 'priority', 'Medium'],
      ['unassigned', 'Unassigned', 'unassigned', true],
      ['my-active', 'My Active Work', 'myActive', true],
      ['waiting-on-me', 'Waiting on Me', 'status', 'Waiting on Me'],
      ['escalations', 'Escalations', 'status', 'Escalated'],
      ['quick-workflows', 'Quick Workflows', 'quickWorkflow', true]
    ],
    'Security': [
      ['critical-threats', 'Critical Threats', 'priority', 'Critical'],
      ['active-incidents', 'Active Incidents', 'category', 'Security Incident'],
      ['sla-risk', 'SLA Risk', 'slaState', 'At Risk'],
      ['investigations', 'Investigations', 'category', 'Investigation'],
      ['escalations', 'Escalations', 'status', 'Escalated'],
      ['my-active', 'My Active Work', 'myActive', true]
    ],
    'Network': [
      ['critical-alerts', 'Critical Alerts', 'priority', 'Critical'],
      ['network-incidents', 'Network Incidents', 'category', 'Network'],
      ['sla-risk', 'SLA Risk', 'slaState', 'At Risk'],
      ['changes', 'Change Requests', 'category', 'Network Change'],
      ['unassigned', 'Unassigned Network Work', 'unassigned', true],
      ['my-active', 'My Active Work', 'myActive', true]
    ],
    'Manager': [
      ['approvals', 'Approvals', 'status', 'Waiting on Approval'],
      ['sla-risk', 'SLA Risk', 'slaState', 'At Risk'],
      ['team-workload', 'Team Workload', 'teamWorkload', true],
      ['escalations', 'Escalations', 'status', 'Escalated'],
      ['waiting-on-me', 'Waiting on Me', 'status', 'Waiting on Me'],
      ['my-active', 'My Active Work', 'myActive', true]
    ],
    'Executive': [
      ['critical-business', 'Critical Business Issues', 'priority', 'Critical'],
      ['major-incidents', 'Major Incidents', 'category', 'Major Incident'],
      ['approvals', 'Executive Decisions', 'status', 'Waiting on Approval'],
      ['security-events', 'Security Events', 'category', 'Security Incident'],
      ['escalations', 'Escalations', 'status', 'Escalated']
    ]
  });

  function panelsFor(role) {
    return (PANELS[role] || PANELS['Help Desk']).map(([id, label, metric, value]) => ({ id, label, metric, value }));
  }

  function countPanel(items, panel, userId) {
    return items.filter(item => {
      switch (panel.metric) {
        case 'priority': return item.priority === panel.value;
        case 'impact': return item.impact === panel.value;
        case 'slaState': return item.slaState === panel.value;
        case 'status': return item.status === panel.value;
        case 'category': return item.category === panel.value;
        case 'unassigned': return !item.assigneeId;
        case 'myActive': return item.assigneeId === userId && !['Closed', 'Resolved'].includes(item.status);
        case 'quickWorkflow': return item.quickWorkflow === true;
        case 'teamWorkload': return item.assigneeId != null;
        default: return false;
      }
    }).length;
  }

  function dashboard(role, items = [], userId = null) {
    return panelsFor(role).map(panel => ({ ...panel, count: countPanel(items, panel, userId) }));
  }

  global.HelpBuddyRoleDashboard = Object.freeze({ PANELS, panelsFor, countPanel, dashboard });
})(window);
