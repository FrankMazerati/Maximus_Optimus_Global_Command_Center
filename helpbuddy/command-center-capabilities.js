/** HelpBuddy operational AI capability contract. */
export const HELP_BUDDY_CAPABILITIES = Object.freeze({
  tickets: ['create','find','view','accept','update','transfer','escalate','close'],
  tasks: ['create','assign','prioritize','resume','complete','verify'],
  incidents: ['create','correlate','investigate','escalate','coordinate','close'],
  network: ['findAlerts','findDevices','findChanges','surfaceOutages'],
  security: ['findThreats','requestAccess','routeApproval','surfaceIncidents'],
  knowledge: ['search','summarize','recommend','attachToWork'],
  warRooms: ['create','join','invite','assignAction','trackTimeline'],
  calendar: ['createEvent','editEvent','cancelEvent','addParticipant','respondToInvite'],
  meetings: ['schedule','prepare','join','attachContext','createFollowUps'],
  documents: ['find','create','attach','routeApproval'],
  approvals: ['request','approve','decline','sign','close'],
  people: ['findAuthorizedUser','findManager','findEscalationPath'],
  audit: ['record','retrieveAuthorizedHistory'],
  experience: ['recordStars','updateLevel','recordCategoryExperience','recommendWork'],
});

export const ACTIONS = Object.freeze([
  'view_more','accept','do_more','not_now','transfer','escalate',
  'request_approval','sign','close'
]);

export const SECURITY_FIRST = Object.freeze({
  checkpoint: 'Security Access',
  rule: 'If a requested operation requires authorization the current user does not have, surface the required approval or authority as the first checkpoint while independent authorized work may continue.'
});

export function canRecommendWork({ permissions = [], requiredPermission }) {
  return !requiredPermission || permissions.includes(requiredPermission);
}

export function buildCapabilityContext({ user, work, permissions = [], experience = {} }) {
  return { user, work, permissions, experience, securityFirst: SECURITY_FIRST, availableActions: ACTIONS, capabilities: HELP_BUDDY_CAPABILITIES };
}
