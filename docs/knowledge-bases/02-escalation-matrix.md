# 2. Escalation Matrix & Authority

**Status:** Proposed operating model; each customer must configure actual teams, users, thresholds, and service commitments.

## Purpose
Define who owns work, who may make decisions, and how unresolved tickets and incidents move across technical, management, security, executive, and platform-authority paths.

## Suggested levels
- **Level 1 — Frontline support:** intake, classification, approved basic troubleshooting, documentation, and initial resolution.
- **Level 2 — Advanced support:** deeper diagnostics, application/system expertise, and issues beyond approved L1 scope.
- **Level 3 — Senior specialist / technical leadership:** complex defects, architecture-level decisions, or high-impact technical remediation.
- **CEO / executive authority:** business-impact decisions, risk acceptance, continuity priorities, and executive communications within delegated authority.
- **Global Administrator / platform authority:** platform configuration, cross-tenant platform operations, and global governance within explicit privileges. This is not automatically the next technical support level.

Security and network escalation may branch directly from any level when incident criteria require it. Escalation paths are not necessarily one linear ladder.

## Configuration walkthrough
1. For each organization, identify its support queues, named role assignments, coverage hours, backup contacts, and escalation owner.
2. Define severity using customer-approved impact and urgency criteria; record response targets and escalation timers.
3. Map each severity/category to an owner, next owner, required evidence, and approved communication channel.
4. Define peer-to-peer handoff rules, including who can transfer, what context must travel, and whether receiver acceptance is required.
5. Define when management, CEO, Security Operations, Network Operations, or Global Admin is notified.
6. Test normal, after-hours, unavailable-owner, wrong-tenant, duplicate-handoff, and failed-handoff scenarios.
7. Review and approve the matrix with operational owners before activating automated escalation.

## Minimum handoff record
Include ticket/incident ID, current owner and queue, receiving owner/queue, reason, severity, timestamp, concise summary, completed diagnostics, relevant nonrestricted notes, next action, due time/SLA, and acknowledgement status. Preserve history; do not erase the original assignment trail.

## HelpBuddy protocol
HelpBuddy may recommend the configured next step, summarize authorized context, and initiate a permitted handoff through a verified workflow. It must confirm the resulting assignment from the system of record. If the operation fails or returns an unknown outcome, it must say so and preserve the existing assignment.

## Governance
Keep operational escalation, security escalation, executive decision authority, and platform administration distinct. Avoid notifying the CEO for every routine ticket. Store customer-specific names, thresholds, contact methods, and contractual SLAs in protected configuration—not in a universal static article.