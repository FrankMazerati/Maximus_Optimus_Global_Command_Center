# Maximus Optimus Global Command Center

IntelliStack Systems' operational environment: one Command Center, one connected intelligence, one audit trail.
Help Buddy guides the work, IntelliDesk holds the mission, and IntelliSync connects the engines that serve both.

## What lives here

| Surface             | Route                  | What it does                                                                                                                                                                                                                                                                                                           |
| ------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Command Center      | `/`                    | The operational dashboard: live work queue, real connector cards, grounded Help Buddy answers and inline mission handling.                                                                                                                                                                                             |
| Help Buddy          | `/help-buddy`          | The live mission window (16-step deployment workflow, character, progress, team, records, controls) plus fifteen folder workspaces: conversation, checklists, knowledge, approvals, attachments, notes, recognition, activity, connectors, signatures, ticket trail, playbooks, tasks, contacts and module activation. |
| Mission Control     | `/mission-control`     | Admission control, checkpoints, pending, escalation, resolution, completion and the ticket trail — every stage recorded separately.                                                                                                                                                                                    |
| Platform Connectors | `/connectors`          | The integration catalog, per-connector workspace, real DOCX/XLSX/PPTX/PDF previews, and link/import/attach actions written to state.                                                                                                                                                                                   |
| IntelliSync         | `/intellisync`         | The backbone: six engines with per-service state, provider adapters and their requirements, the event stream, retries, duplicates and integration health.                                                                                                                                                              |
| Character Studio    | `/character-studio`    | The Help Buddy character: nine interaction states, appearance presets, voice and mission-aware messaging.                                                                                                                                                                                                              |
| Module catalog      | command menu → modules | Entitlement-aware module activation, including modules surfaced inside Help Buddy.                                                                                                                                                                                                                                     |

## Design rules the build follows

- **Nothing is decorative.** Every control dispatches a reducer action that changes state, writes a trail and, where relevant, the recognition ledger.
- **Admission is not acceptance, acceptance is not work, work is not accomplishment.** Viewing, accepting, starting, recording a checkpoint, resolving and completing are separate, timestamped events.
- **Authorization is separate from work.** A technician can complete physical setup but cannot mark administrator work complete. Restricted steps complete only through a named approver's decision, recorded with their identity.
- **Assigned tasks do not move ownership.** A checklist item can be assigned to another person or department; only that person records its outcome, and the mission owner keeps the mission.
- **Unconfigured integrations are labelled.** Directory writes, email delivery, calendar invitations and MDM actions show the exact missing configuration instead of a simulated success.
- **One authoritative home per application.** The Command Menu encodes ownership (IntelliDrive owns files, IntelliDocs owns documents, IntelliDesk owns missions) so a module links to an application instead of duplicating its data. Every destination has its own address and its own page.
- **Help Buddy is a character, not an icon.** The mascot in `src/assets/help-buddy-character.png` wears the blue hoodie, white trim and `I` shield from the brand reference, and carries a headset for voice states.
- **Tablet first.** Dense layouts, 8–11px label type and internal scrolling are deliberate; the workspace fits 1024×768 and 768×1024 without horizontal scrolling.

## Development

```sh
npm install
npm run dev          # http://localhost:8080
npm test -- --run    # 40 domain tests
npm run build        # production build
npx tsc --noEmit     # strict type check
```

Screenshots of every surface live in `docs/screenshots/`. The IntelliSync standard and the exact configuration gaps are documented in [`docs/INTELLISYNC.md`](docs/INTELLISYNC.md); the relational target is in [`supabase/schema.sql`](supabase/schema.sql).

## Sample documents

`public/documents/` holds real files generated by `scripts/generate-sample-documents.py` (`python-docx`, `python-pptx`, `openpyxl`, `reportlab`). They are parsed in the browser by a dependency-free ZIP + OOXML reader — no server round trip, no fabricated preview text.

## State

The application runs on a persisted command state (`src/lib/domain/store.tsx` → `localStorage`) with a reducer that owns every transition (`src/lib/domain/reducer.ts`). That state is the development stand-in for the Supabase layer described in `supabase/schema.sql`: the same entities, ids and relationships, ready to move server-side.
