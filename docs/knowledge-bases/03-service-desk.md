# 3. Service Desk & Help Desk

**Status:** General runbook framework; populate organization-specific queues, SLAs, and approved troubleshooting steps before live use.

## Purpose
Provide consistent intake, triage, assignment, troubleshooting, communication, and closure for service requests and incidents.

## Intake walkthrough
1. Confirm requester identity and organization/tenant context.
2. Determine whether the item is an incident, service request, access request, question, or change.
3. Capture a clear summary, impact, urgency, affected service/device, start time, scope, error text, and safe evidence.
4. Search existing tickets and known issues before creating a new ticket.
5. Select severity according to the approved matrix; do not inflate or reduce severity without evidence.
6. Assign the correct queue and owner, record the next action, and communicate expected follow-up.
7. Follow the approved diagnostic runbook; record findings and commands/actions performed.
8. Escalate when criteria are met, required access is missing, or the approved troubleshooting boundary is reached.
9. Confirm resolution with evidence and requester validation where appropriate; close only under the organization's closure policy.

## Ticket search and context
HelpBuddy should search existing authorized tickets first for lookup requests. It should create a ticket only when the user explicitly requests creation or the approved workflow clearly calls for it. Ticket context must be fetched from current records and authorized history. Never rely solely on a ticket ID typed into chat without validating access.

## Peer handoffs
Preserve ticket ID, requester context, classification, severity, current history, nonrestricted notes, completed steps, outstanding risks, and next action. Record sender, receiver, time, reason, and outcome. If the receiving queue cannot accept the handoff, retain or restore the prior assignment and report the failure accurately.

## Troubleshooting checklist
- Reproduce or clarify the reported symptom.
- Check known incidents and recent changes.
- Establish scope and business impact.
- Collect only necessary, authorized evidence.
- Follow the relevant approved runbook.
- Avoid destructive commands or broad changes without authorization and rollback.
- Verify the fix and document the result.

## Closure checklist
The issue is resolved or dispositioned; evidence and user communication are recorded; linked work is accounted for; and the closure reason is accurate. If the outcome is uncertain, leave the record in the appropriate active/pending state.

## Metrics
Possible measures include first response, time to resolution, reopen rate, handoff count, SLA attainment, recurring incidents, and user feedback. Metrics must be interpreted with context rather than used to discourage appropriate escalation.