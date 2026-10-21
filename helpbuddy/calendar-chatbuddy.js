/**
 * Calendar + ChatBuddy coordination layer for HelpBuddy.
 * The adapter delegates persistence/authorization to the Command Center backend.
 */

export function buildMeetingRequest({ organizerUserId, title, startsAt, endsAt, timezone = 'America/Chicago', participantUserIds = [], workItemId = null, agenda = '' }) {
  return {
    organizerUserId, title, startsAt, endsAt, timezone, workItemId, agenda,
    participants: participantUserIds.map(userId => ({ userId, response: 'pending' }))
  };
}

export function buildMeetingNotification({ eventId, title, startsAt, organizerUserId, workItemId }) {
  return {
    type: 'meeting_invitation',
    title: `Meeting invitation: ${title}`,
    body: `You have been invited to a Command Center meeting at ${startsAt}.`,
    entityType: 'calendar_event',
    entityId: eventId,
    action: 'respond_to_meeting',
    payload: { eventId, workItemId, organizerUserId, actions: ['accept','tentative','decline','view'] }
  };
}

export function buildCalendarEdit({ eventId, changes, actorUserId }) {
  return { eventId, actorUserId, changes, auditAction: 'calendar_event_updated' };
}

export function buildMeetingResponse({ eventId, userId, response }) {
  if (!['accepted','tentative','declined'].includes(response)) throw new Error('Invalid meeting response');
  return { eventId, userId, response, notification: { type: 'meeting_response', entityType: 'calendar_event', entityId: eventId } };
}

export function buildFollowUpTask({ eventId, title, assigneeUserId, dueAt, context = {} }) {
  return { source: 'meeting', sourceId: eventId, title, assigneeUserId, dueAt, context };
}

export function buildChatBuddyWorkNotification({ userId, title, body, entityType, entityId, actions = [] }) {
  return { userId, type: 'work_notification', title, body, entityType, entityId, action: 'open_entity', payload: { actions } };
}
