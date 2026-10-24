# 7. War Room & Major Incident Management

**Status:** Proposed operating playbook; define local severity thresholds, commander roles, communication channels, and activation rules.

## Purpose
Coordinate high-impact incidents through a shared, time-ordered operational picture and clear decision ownership.

## Activation
Activate the War Room when approved criteria are met—for example, broad service disruption, major security event, critical business process outage, multi-team dependency failure, or executive-designated crisis. The incident commander may activate under delegated authority. Routine tickets should not automatically become War Room events.

## Roles
- **Incident commander:** owns coordination, priorities, and the incident record.
- **Technical leads:** investigate and execute approved remediation in their domains.
- **Operations scribe:** maintains timeline, decisions, action items, and status.
- **Communications lead:** issues approved internal/customer/executive updates.
- **Security/legal/compliance liaison:** participates when incident type requires it.
- **Executive sponsor:** makes business-risk and continuity decisions within delegated authority.

One person may temporarily cover multiple roles, but responsibilities must remain explicit.

## War Room walkthrough
1. Open or link the authoritative incident record and declare scope, severity, commander, and start time.
2. Establish a shared timeline and update cadence.
3. Assign work by owner, expected result, due time, dependencies, and status.
4. Separate confirmed facts, working hypotheses, and unknowns.
5. Record decisions, approvals, rejected options, and rationale.
6. Coordinate cross-team escalation through the Escalation Matrix.
7. Publish situation reports that state impact, current status, actions underway, blockers, next update, and decisions needed.
8. Confirm recovery through authoritative telemetry and service-owner validation.
9. Stand down only when exit criteria are met; assign follow-up work and schedule a post-incident review.

## HelpBuddy role
HelpBuddy can retrieve authorized incident/ticket context, draft status reports from verified data, identify overdue actions, summarize decisions, and help locate relevant runbooks. It must label missing or stale data and cannot invent updates or act as incident commander unless an explicit authorized design assigns that responsibility.

## Post-incident review
Capture impact, timeline, detection, response, contributing factors, what worked, gaps, corrective actions, owners, due dates, and lessons suitable for publication. Review sensitive details before moving lessons into broadly searchable knowledge.