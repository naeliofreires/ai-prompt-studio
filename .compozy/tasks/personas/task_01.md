---
status: completed
title: Seed editable personas and align persona data source
type: backend
complexity: medium
dependencies: []
---

# Task 1: Seed editable personas and align persona data source

## Overview
This task establishes the editable persona source of truth required by the PRD. It ensures the app starts with Frontend Specialist and Backend Specialist personas that users can edit or delete without creating duplicate seed records or restoring deleted defaults.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The editable persona store MUST seed exactly two initial personas: Frontend Specialist and Backend Specialist.
- Seeded personas MUST use the existing `label` and `role` domain fields, mapped to UI title and description.
- Seeded personas MUST be editable and deletable through the same CRUD path as user-created personas.
- Deleted seeded personas MUST NOT be recreated on later app launches.
- The implementation MUST avoid duplicate seed personas across repeated loads or app restarts.
- Existing persona client and hook consumers SHOULD continue using the current persona CRUD abstraction.
</requirements>

## Subtasks
- [x] 1.1 Define the editable seed behavior for the two MVP personas.
- [x] 1.2 Align the persona store so seeded personas persist and do not duplicate.
- [x] 1.3 Ensure deleting a seeded persona is durable across reloads.
- [x] 1.4 Keep the persona domain shape limited to title/description via `label` and `role`.
- [x] 1.5 Update persona loading behavior used by renderer hooks and clients.
- [x] 1.6 Update tests covering seeded, edited, deleted, and reloaded personas.

## Implementation Details
Follow the TechSpec sections "Data Models", "Impact Analysis", and "Technical Considerations". The work should keep the existing persona CRUD abstraction and avoid adding new persona fields beyond the MVP model.

### Relevant Files
- `apps/promptizer/shared/domain/custom-persona.ts` — Existing persona schema and validation for editable personas.
- `apps/promptizer/shared/contracts/ipc.ts` — Existing local contract surface for persona CRUD.
- `apps/promptizer/main/store/custom-personas-store.ts` — Persistence layer that should own durable seed behavior.
- `apps/promptizer/main/ipc/register-handlers.ts` — IPC handlers for create, update, delete, and list personas.
- `apps/promptizer/ui/api/persona-client.ts` — Renderer/browser abstraction used by UI hooks.
- `apps/promptizer/ui/hooks/useRoles.ts` — Hook that loads and mutates persona state.
- `apps/promptizer/spec/personas.json` — Current built-in persona source that may conflict with two editable MVP personas.

### Dependent Files
- `apps/promptizer/main/utils/resolve-persona-context.ts` — Persona resolution must still find editable personas during generation.
- `apps/promptizer/ui/components/PersonaPanel/index.tsx` — Existing persona display may observe changed list semantics.
- `test/custom-personas-store.test.ts` — Store persistence tests need seed lifecycle coverage.
- `test/persona-client.test.ts` — Client behavior should remain consistent after seed changes.
- `test/preload.test.ts` — IPC/preload contract coverage may need updates.
- `test/use-roles.test.ts` — Hook tests should assert seeded editable personas and CRUD state.

### Related ADRs
- [ADR-001: Dedicated Personas Page MVP](adrs/adr-001.md) — Requires initial personas to be editable and deletable.
- [ADR-002: Local Promptizer View with Seeded Editable Personas](adrs/adr-002.md) — Defines seeded editable personas as the technical approach.

## Deliverables
- Durable seed behavior for Frontend Specialist and Backend Specialist personas.
- Persona CRUD paths that treat seeded personas like user-created personas.
- Updated tests for seed creation, no duplicate seeds, durable deletion, editing, and reload behavior.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for persona persistence/client behavior **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Fresh store load returns exactly Frontend Specialist and Backend Specialist seed personas.
  - [x] Repeated store loads do not create duplicate seed personas.
  - [x] Deleting a seeded persona persists and does not recreate it on reload.
  - [x] Updating a seeded persona persists changed `label` and `role` values.
  - [x] Creating a user persona still works after seed initialization.
- Integration tests:
  - [x] Renderer persona client lists seeded personas through the desktop bridge or browser fallback.
  - [x] `useRoles` exposes seeded personas and updates local state after create, update, and delete.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- The app starts with exactly two editable personas for the MVP.
- Seeded personas are not restored after user deletion.
- Existing persona CRUD consumers continue to work without a new public model.
