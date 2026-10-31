# IntelliStack Systems — Maximus Optimus Global Command Center
## Master UI/UX Build Specification
Status: Canonical design requirements; implementation and verification tracked separately.

## Product principle
The Command Center is a modular, data-driven operating workspace, not a static dashboard, decorative card wall, or single giant page. Its guiding promise is **Bring the Work to You**: surface urgent work, current assignments, what changed, what is next, approvals, recommendations, and where to get help.

The experience must be bright, colorful, welcoming, accessible, responsive, and distinctly IntelliStack. White/light-blue/light-gray surfaces, IntelliStack blue identity, and purposeful semantic accents are the default. Do not use the previous predominantly black/dark interface as the default. Use familiar usability principles without copying another product's branding or proprietary layout.

## Core workspace relationship
- **Left — Where I can go:** complete independently scrollable navigation.
- **Center — What I need to do:** Bring the Work to You and its work items/workflows.
- **Right — How I can get help:** HelpBuddy, independently scrollable and persistent where screen size permits.
These are separate modular regions with their own purpose, state, scrolling, permissions, configuration, and expandable modules.

## Persistent header and profile
Top-left: hamburger/navigation control visually associated with the IntelliStack shield.
Branding: “IntelliStack Systems presents”, “MAXIMUS OPTIMUS”, “GLOBAL COMMAND CENTER”; Maximus uses blue and Optimus uses a context-appropriate readable color. Use a light header by default.
Compact top-right controls: profile picture, name, role, status, notifications, weather, current time, quick settings, search, and company/global context without overloading the header.

The profile panel must support: full/upper-body headshot, name, title, role, department/company, Global User ID, Global Company ID, location, work email, work phone where appropriate, manager dropdown, shift, last login, and current presence. Include profile quick actions and recent activity. Presence options include Active/Available, Away, and Busy; richer organization-configured choices may include Out at Lunch, Working from Home, and Out of Office. Selection must update actual presence state when the feature is connected, not merely change decorative text.

## Greeting, search, clocks, and news
Immediately below or integrated with the header, provide a dynamic greeting/message bar based on user, time of day, role, status, and organization, with welcoming copy, priorities, and optional visual treatment.
Provide global search for people, Global IDs, companies, devices, tickets, knowledge, documents, calendar, chat, Marketplace, work items, security events, and network information. Results must respect the user's permissions.
Global clocks are distinct from a calendar. Support configurable locations/time zones including Chicago, New York, Australia, Europe, Africa, South America, Russia, and additional configured company locations. Wrap responsively.
Provide a compact, role-aware news/information feed for cybersecurity, network, business, company announcements, and system alerts.

## Quick Picks
Show five Quick Picks by default and allow up to five additional items. Support touch-friendly add, remove, drag/reorder, and saved personal preferences. Authorized administrators may configure organization defaults. Examples include Help Desk, Calendar, Knowledge Base, Global ID, Active Directory, IntelliChat, Marketplace, Security, Network, Reports, and Work Board. Respect roles and enabled modules.

## Hamburger/navigation
The menu is a major application navigation system, not a tiny dropdown with a handful of links. It must be independently scrollable and usable without scrolling the center workspace. Support approximately 20+ sections, expandable hierarchy, touch-friendly drill-down, press-and-hold/drag reorder, and persisted order. Authorized admins may define organization defaults.

Initial navigation inventory:
- Global ID
- Active Directory
- IntelliChat
- IntelliCalendar
- Intella Notes
- Intella Sheets
- Knowledge Base
- My Knowledge Base
- Help Desk
- Work Board
- Workflow Companion
- Security / SOC
- Threat Intelligence
- Network / NOC
- War Room
- Breakout Rooms
- Marketplace
- Reports / Analytics
- Administration
- Design Studio
- Auditing / Governance
- Maximus
- Optimus
- Trinity
- Logout

## Center: Bring the Work to You
This is the primary work surface, not generic analytics. Use prioritized, data-driven content with a default visible cap of about 30 items and a configurable range around 20–30. Prioritize by severity, SLA, due date, role, assignment, escalation, security/business/customer impact, dependencies, age, and status. Make the next action obvious.

Core sections:
1. Critical / Time-Sensitive: critical tickets, security incidents, network outages, SLA violations, executive requests, approvals, escalations, expiring tasks, and system alerts.
2. My Primary Work / History: current assignments, recently opened/completed work, frequently accessed records, last viewed tickets/users/devices, projects, and documents.
3. Bring the Work to You: central prioritized dynamic queue.
4. Next Up / Scheduled: meetings, scheduled work/maintenance, SLA checkpoints, follow-ups, calendar events, and planned tasks.
5. Additional role/module-based sections: waiting on me/others, approvals, recently completed, recommended actions, team activity, security posture, and network status.

Work cards should quickly show an ID, title, affected service/device/customer, severity/priority, owner/assignee, SLA/due state, and meaningful actions such as Open, Take Ownership, Escalate, Add Note, and View Device, subject to permissions. Support addable integrations for Help Desk, Calendar, Chat, Knowledge, Security, Network, Work Board, Marketplace, Active Directory, Workflow Companion, Reports, business systems, and future modules without redesigning the home page.

## Right rail: HelpBuddy
HelpBuddy is the persistent workflow companion, not a generic chatbot. It explains work, prioritizes tasks, guides users, provides checklists/next steps, explains errors, surfaces knowledge, assists tickets/workflows, tracks progress, reminds, encourages, and connects to Knowledge Base, IntelliChat, IntelliCalendar, Work Board, and Workflow Companion.
Use a friendly professional identity, character/avatar or sticky-note-inspired treatment, task bubbles, checklist modules, and progress indicators. Keep its own vertical scroll independent of center and navigation.
Make the rail modular: My Tasks, Today's Checklist, SLA Countdown, Knowledge Suggestions, Recent Activity, Calendar, Reminders, Ticket Guidance, Security/Network Guidance, Team Activity, Motivation, Recommended Actions, Training, and Announcements.
Checklist completion must persist when connected and can surface the next task. Workflow Companion remains the formal system of record for required steps, SLA checkpoints, escalation, approvals, exceptions, audit timestamps, signoffs, handoffs, ownership, and recognition/stars.

## AI Systems Bar and assistant hierarchy
Provide a distinct AI Systems Bar near the bottom, above the footer:
- Trinity: independent senior oversight across security, network, SOC, IT operations, architecture, global administration, leadership, governance, risk, and cross-system analysis.
- Maximus: higher-level operational intelligence for leadership, security, network, and command-center functions.
- Optimus: everyday end-user/help-desk technical assistance.
- HelpBuddy: task/workflow companion.
Trinity sits above Maximus and Optimus in the intelligence hierarchy; it is not the default everyday assistant for ordinary users. Trinity must be original and premium/cinematic; do not copy Matrix characters or imagery, use corny robots, or generic AI stock art.

## Subscription and Marketplace
The home understands Basic, Premium, Full Experience, individual services, add-ons, trials, expiring services, and upgrades. Clearly label Included, Active, Available, Upgrade, Add-on, and Not enabled. Avoid aggressive sales prompts.
Marketplace is the commercial layer; Command Center is the operational layer. Link role-relevant operational modules to relevant Marketplace services/packages. HelpBuddy may explain upgrade benefits and open actual package comparison; never imply a purchase occurred without a completed purchase workflow.

## Responsive behavior
- Desktop: three-column navigation / center work / HelpBuddy.
- Tablet landscape: retain three regions where practical.
- Tablet portrait: collapsible/overlay navigation and intentionally prioritized workspace layout.
- Mobile: hamburger drawer, primary workspace, slide-in HelpBuddy, Quick Picks, and AI Systems Bar.
Do not merely shrink desktop. Keep drawer and rail independently scrollable; closing overlays must preserve workspace state. Do not make the whole browser one giant scroll region when avoidable. The core capabilities must remain reachable in every layout.

## Visual system and accessibility
Default to white, light blue, soft gray, IntelliStack blue, and purposeful semantic accents:
- Green: healthy/active/success
- Red: critical/emergency/failure
- Orange: warning/attention
- Yellow: pending/review
- Purple: contractor/special designated contexts
- Light blue: information/navigation
Maintain contrast and readable typography. Use clean, consistent, moderately rounded cards, subtle borders/shadows, strong visual hierarchy, touch-friendly targets, keyboard/accessibility support, and no hover-only interactions. Avoid giant rounded boxes and overly dark panels. Use original IntelliStack branding and components.

## Data, permissions, and functionality
Build modular, data-driven components with role-aware and tenant-aware access. Development data may be seeded but must be labeled sample/demo; support migration to real data. Search and every data surface must respect authorization. Features must clearly distinguish live, sample, unavailable, and not configured states.
No dead buttons, fake connectors, or decorative-only blocks. Every major block must display data, trigger a real action, navigate to a real module, open a workflow, or expose a meaningful interactive state. Backend-dependent actions must not pretend to have succeeded when not connected.
Personal preferences should persist: navigation order, Quick Picks, workspace, filters, favorites, HelpBuddy modules, theme, density, and display settings. Authorized Design Studio users can control accent colors, typography, backgrounds, profile imagery, card styles, module visibility, navigation defaults, Quick Picks, and HelpBuddy modules; admins may set organization defaults.

## Notifications, activity, footer, and system status
Group notifications into Critical, Security, Work, Messages, Calendar, System, Marketplace, and HelpBuddy. Show role-aware activity such as ticket/profile/device/security/meeting/work/subscription/knowledge changes.
Include a compact footer with IntelliStack Systems, Maximus Optimus Global Command Center, version, system status, Help, Documentation, Privacy, Terms, Security, Accessibility, Contact, and copyright. AI Systems Bar sits above it. System status opens details when selected.
The user should understand the page in seconds: (1) who am I, (2) what is happening, (3) what do I need to do, (4) what next, (5) where can I get help, (6) what systems can I access.

## Implementation and verification requirements
This specification is the design source of truth. It does not itself prove that a feature has been implemented.
Verify desktop/horizontal, tablet landscape, tablet portrait, and mobile/vertical layouts in the actual deployed preview. Verify navigation and HelpBuddy independent scrolling, drawer state preservation, all routes, role/tenant access boundaries, saved reorder/personalization, presence updates, and meaningful behavior for every control. Do not call a feature complete until it has been tested. Record each feature as implemented and verified, partially implemented, sample/demo only, unavailable, or not configured.


## Help Buddy personal companion workspace (Build 059)
The personal Help Buddy surface places the checklist and star values on the left and the named companion character on the right. The character can change expression and message in response to progress. Users can personalize the companion name (for example, “Maria, My Help Buddy”). Conversation attachments and notes use a compact five-across visible row; additional items are tucked behind a disclosure/drop-down and revealed in further five-item rows. Add Modules remains available beside the personal module list. The detailed behavior, responsive rules, accessibility and prototype limitations are specified in [Help Buddy Personal Companion Visual Specification](HELP_BUDDY_PERSONAL_COMPANION_VISUAL_SPEC.md). Star previews are not authoritative awards; real awards require the verified backend ledger. Attachment drafts are not persistent until the storage service confirms success.
