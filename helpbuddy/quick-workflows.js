/* HelpBuddy Quick Workflows: reusable structured templates. */
(function (global) {
  'use strict';
  const TEMPLATES = Object.freeze({
    USER_CREATION: { id: 'user_creation', title: 'Create User', category: 'Identity', totalTasks: 5, tasks: ['Verify requester', 'Manager/security approval', 'Create identity', 'Validate access', 'Document and close'] },
    ONBOARDING: { id: 'onboarding', title: 'Employee Onboarding', category: 'Onboarding', totalTasks: 7, tasks: ['Verify employee', 'Manager approval', 'Identity setup', 'Device assignment', 'Application access', 'Security validation', 'Final sign-off'] },
    OFFBOARDING: { id: 'offboarding', title: 'Employee Offboarding', category: 'Offboarding', totalTasks: 7, tasks: ['Verify separation', 'Manager approval', 'Disable identity', 'Revoke access', 'Collect assets', 'Security validation', 'Final sign-off'] },
    ACCESS_REQUEST: { id: 'access_request', title: 'Access Request', category: 'Security Access', totalTasks: 5, tasks: ['Identify required permission', 'Manager approval', 'Security/identity action', 'Validate access', 'Document and close'] },
    EQUIPMENT_ASSIGNMENT: { id: 'equipment_assignment', title: 'Equipment Assignment', category: 'Hardware', totalTasks: 5, tasks: ['Verify request', 'Inventory check', 'Assign asset', 'User acknowledgement', 'Document and close'] },
    VPN_ACCESS: { id: 'vpn_access', title: 'VPN Access', category: 'Network Access', totalTasks: 5, tasks: ['Verify requester', 'Manager approval', 'Provision access', 'Test connection', 'Document and close'] }
  });
  function list() { return Object.values(TEMPLATES).map(x => ({ ...x, tasks: x.tasks.map(title => ({ title, completed: false })) })); }
  function create(type, api, input = {}) { const t = TEMPLATES[type] || TEMPLATES.USER_CREATION; return api.createWork({ ...input, title: input.title || t.title, category: input.category || t.category, totalTasks: t.totalTasks, tasks: t.tasks.map(title => ({ title, completed: false })), status: input.status || 'Draft' }); }
  global.HelpBuddyQuickWorkflows = Object.freeze({ TEMPLATES, list, create });
})(window);
