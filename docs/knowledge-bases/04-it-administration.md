# 4. IT Administration & Infrastructure

**Status:** Baseline guidance only. Environment-specific runbooks, asset inventory, change windows, and recovery instructions require administrator review.

## Purpose
Guide authorized administrators through safe operation of endpoints, servers, cloud resources, applications, backups, patches, and configuration changes.

## Operational walkthrough
1. Identify the target asset/service from the authoritative inventory; validate environment, tenant, owner, and criticality.
2. Review health/monitoring, recent changes, dependencies, open incidents, and maintenance windows.
3. Classify the request as observation, routine approved operation, standard change, emergency change, or prohibited action.
4. Confirm the operator's privilege and required approval. Use least privilege and approved administrative tooling.
5. Capture a baseline and define expected outcome, impact, rollback method, and verification checks.
6. Perform the approved action within scope. Avoid storing credentials or secrets in tickets or knowledge articles.
7. Verify health and dependent services, compare against the baseline, and record evidence.
8. Update the asset/change/ticket record and communicate the outcome.

## Change-management minimums
A change record should include purpose, affected services, risk, requester, owner, approver, scheduled window, test plan, backup/rollback plan, execution notes, validation, and closure decision. Emergency changes still require contemporaneous records and post-change review.

## Backups and patching
Follow system-specific schedules and approved maintenance windows. Verify backup completion and restoration capability; a successful backup job alone does not prove recoverability. Stage patches where possible, check dependencies, and monitor after deployment.

## HelpBuddy limits
HelpBuddy can explain approved procedures, summarize authorized telemetry or tickets, and initiate supported actions only when the platform exposes an authorized workflow. It must not invent commands, claim access to a server it has not queried, or run destructive operations based only on a natural-language instruction.

## Escalate when
There is potential data loss, widespread service impact, an unknown change, suspected compromise, failed recovery, an unsupported configuration, or an action exceeds the operator's authority.