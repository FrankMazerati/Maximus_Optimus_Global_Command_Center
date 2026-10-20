# 020 — Core Platform Services & Incident Intelligence

**System:** IntelliStack Systems / Optimus Maximus
**Status:** Founder-approved architectural direction — 2026-10-20
**Purpose:** Establish the three flagship Core Platform Services and the coordinated intelligence/incident model that differentiates Optimus Maximus from conventional ticketing systems.

## 1. The Three Core Platform Services

### 1.1 New Active Directory
The identity and organizational control plane.

The New Active Directory establishes the authoritative relationship between:

`Global Company ID → Global User ID → Role → Organization → Devices → Access → Permissions → Work`

It is responsible for identity lifecycle, organization membership, directory relationships, device relationships, provisioning/deprovisioning, access context, and authorization boundaries. Active Directory, Microsoft Entra ID, and Microsoft 365 remain distinct integrations even when connected.

### 1.2 HelpBuddy
The personalized work and action engine.

HelpBuddy answers: **“What do I need to do right now?”**

It receives work from incidents, tickets, War Rooms, AI assessments, management, workflows, checklists, escalations, and compliance requirements. It presents the correct work to the correct person based on Global ID, role, company/tenant, permissions, duty status, incident assignment, and authority.

HelpBuddy is not merely a chatbot or generic task list. Each role can receive a different governed task set for the same incident.

### 1.3 Bring the Work to You
The contextual work-delivery engine.

The platform should minimize the need for users to hunt through menus and queues. Relevant work, context, approvals, checklists, and next actions are surfaced to the authorized person at the time they are needed.

The intended operating principle is:

**Identity → Intelligence → Context → Work → Action → Verification**

## 2. Intelligence Layer

The platform includes three first-class intelligence modules/pages:

### Maximus AI
Executive intelligence for CEO/CIO-level assistance. It uses authorized project/system knowledge to provide strategic context, business impact, priorities, risks, decisions, planning, and executive recommendations.

### Optimus AI
Operational/technical intelligence for daily work. It assists with ticketing, general questions, procedures, troubleshooting, knowledge retrieval, navigation, and operational workflows.

### Trinity Security Threat Matrix
Security intelligence and adjudication. It correlates incident/security context, evaluates threat severity, compares operational and executive assessments, identifies gaps, and produces security recommendations for response coordination.

These are separate application pages and future backend AI services, not merely chat widgets.

## 3. Shared Knowledge Foundation

Maximus AI and Optimus AI should initially be grounded in the authorized Optimus Maximus knowledge corpus, including project inception, founder requirements, architectural decisions, build/version information, feature/module definitions, documented workflows, governance requirements, repository documentation, and approved conversation-derived knowledge.

Conversation material must be treated as source evidence, not automatically as authoritative instructions. Founder-approved requirements and current validated system state take precedence over brainstorming, stale requirements, or superseded decisions.

Every knowledge record should retain provenance, status, version, sensitivity, related records, and supersession history where applicable.

## 4. Major Incident Intelligence Flow

For a major event such as a password breach:

1. A security notification/event creates or escalates an incident.
2. The incident receives severity, scope, company/tenant context, affected systems/users, incident ID, timestamp, and available threat context.
3. HelpBuddy immediately alerts authorized personnel according to role, company/tenant, permissions, duty status, on-call/emergency policy, and need-to-know.
4. The appropriate coordination team is automatically mobilized into a restricted War Room.
5. Optimus AI produces an operational/user-impact assessment.
6. Maximus AI produces an executive/business-impact assessment.
7. Trinity Security Threat Matrix compares and analyzes the assessments against available security context and identifies gaps, conflicts, severity, and recommended response.
8. HelpBuddy converts approved response requirements into role-specific governed tasks.
9. Teams may move into restricted Breakout Rooms for continued remediation.
10. Breakout-room findings, evidence, completed checklists, and recommendations flow back to the parent War Room.
11. The War Room maintains the authoritative incident timeline and command record.
12. Resolution, recovery, verification, and post-incident actions are captured with audit evidence.

## 5. Role-Specific HelpBuddy

The same incident may generate different HelpBuddy workspaces.

- **CEO/CIO:** executive briefing, business exposure, notification decisions, resource authorization, executive approvals.
- **Security/SOC:** compromised-account identification, authentication analysis, session revocation, credential reset coordination, threat hunting, evidence collection.
- **Network Engineer:** affected endpoints/infrastructure, network telemetry, source-address review, segmentation, firewall investigation, infrastructure remediation.
- **Help Desk:** affected-user contact, identity verification, password reset assistance, MFA verification, user documentation and escalation.
- **Other roles:** tasks generated according to their authorized responsibility and incident playbook.

Recommendations are not completion. High-impact or privileged actions require the applicable authorization, approval, confirmation, and audit controls.

## 6. Duty Status and Emergency Mobilization

A major incident may notify both on-duty and off-duty personnel when policy requires it. Duty status is an input to mobilization, not a substitute for authorization.

Example policy states:

- On duty + required role → immediate response.
- Off duty + emergency-response role → emergency notification/mobilization according to policy.
- On call → immediate escalation.
- Authorized awareness-only role → limited notification appropriate to need-to-know.
- Unauthorized user → no sensitive incident details.

The platform must not expose breach details merely because a person is an employee. Incident access remains governed by identity, role, company/tenant, incident permissions, and need-to-know.

## 7. War Room and Breakout Rooms

The War Room is the restricted command and coordination layer for a major incident.

Typical breakout rooms may include:

- SOC / Security
- Network
- Infrastructure
- Help Desk / User Response
- Identity / Active Directory
- Executive
- Other specialized teams

Each breakout room remains linked to the parent incident and receives only the context appropriate to its participants. Findings, evidence, tasks, approvals, and recommendations are returned to the War Room for consolidation.

## 8. Core Differentiation

Traditional ticketing is commonly centered on recording, assigning, and tracking requests. Optimus Maximus is designed to coordinate the work around the request or incident:

**Identity → Intelligence → Context → Work → Action → Verification**

The differentiators are the combination of:

1. New Active Directory as the identity/control plane.
2. HelpBuddy as the personalized work/action engine.
3. Bring the Work to You as contextual work delivery.
4. Maximus AI, Optimus AI, and Trinity Threat Matrix as differentiated intelligence layers.
5. War Room and Breakout Rooms as coordinated incident command/remediation spaces.
6. Governed checklists, authority chains, approvals, and audit evidence throughout execution.

## 9. Implementation Truth

This document defines the intended architecture. Individual capabilities must not be represented as production functionality until they are implemented, tested, and verified against the actual repository, backend, permissions, integrations, and deployed build.

## 10. Related Knowledge Sources

- 001 — Executive Talking Points & Core Differentiators
- 002 — Idea Capture, Change Control & Executive Readiness
- 008 — Portable Maximus & Optimus Memory Architecture
- 009 — Founder Timeline & Milestone Control
- 010 — Optimus Maximus Integrity Doctrine
- 014 — Scenario Simulator & Global Incident Coordination Specification
- 018 — Knowledge Base Index & Documentation Boundaries
