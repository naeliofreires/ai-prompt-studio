---
status: completed
title: Add Personas page with inline CRUD inside Promptizer
type: frontend
complexity: high
dependencies:
  - task_01
---

# Task 2: Add Personas page with inline CRUD inside Promptizer

## Overview
This task adds the dedicated Personas page inside Promptizer using local view state. It gives users a visible place to list, select, create, edit, and delete personas through inline forms while keeping the existing Studio screen intact.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- Promptizer MUST support a local `studio` and `personas` view switch without adding a router.
- The Personas page MUST list all editable personas with title and description.
- The Personas page MUST show which persona is currently selected for generation.
- Users MUST be able to create personas with title and description using an inline form.
- Users MUST be able to edit existing personas with an inline form.
- Users MUST confirm before deleting a persona.
- The page MUST show an actionable empty state when no personas exist.
- Title and description inputs MUST be required and trimmed before save.
</requirements>

## Subtasks
- [x] 2.1 Add local Promptizer view state for Studio and Personas.
- [x] 2.2 Add navigation actions between the Studio screen and Personas page.
- [x] 2.3 Create the Personas page UI with persona list and selected state.
- [x] 2.4 Add inline create and edit form states with save/cancel actions.
- [x] 2.5 Add delete confirmation and empty-state actions.
- [x] 2.6 Wire page actions to existing persona CRUD handlers.
- [x] 2.7 Add component and interaction tests for the page.

## Implementation Details
Follow the TechSpec sections "System Architecture", "Core Interfaces", and "Development Sequencing". The page should reuse existing visual language and persona CRUD hooks while replacing modal-first management with inline page management for this MVP path.

### Relevant Files
- `apps/promptizer/ui/app/PromptizerApp.tsx` — Promptizer composition point for local view rendering.
- `apps/promptizer/ui/app/PromptStudioScreen.tsx` — Existing Studio UI that needs a Personas page entry point.
- `apps/promptizer/ui/app/usePromptStudioController.ts` — Controller for persona state and UI actions.
- `apps/promptizer/ui/hooks/useRoles.ts` — Existing persona CRUD hook used by the page.
- `apps/promptizer/ui/components/PersonaPanel/index.tsx` — Current persona list/action pattern to align with or retire.
- `apps/promptizer/ui/components/RoleModal/index.tsx` — Existing create form behavior to reference for validation/copy patterns.
- `apps/promptizer/ui/components/EditPersonaModal/index.tsx` — Existing edit behavior to reference for save states.
- `apps/promptizer/ui/components/RoleViewModal/index.tsx` — Existing delete behavior to reference for confirmation semantics.
- `apps/promptizer/ui/app/App.module.scss` — Current visual system and layout tokens.

### Dependent Files
- `apps/promptizer/ui/types/role.ts` — Role/persona UI type mapping may be reused by the page.
- `apps/promptizer/ui/components/shared/ModalShell.tsx` — Existing modal shell may remain for confirmation or be replaced by inline confirmation.
- `test/use-roles.test.ts` — Hook behavior affects page interaction tests.
- New or existing UI test files under `test/` — PersonasPage rendering and interaction coverage should be added.

### Related ADRs
- [ADR-001: Dedicated Personas Page MVP](adrs/adr-001.md) — Requires a dedicated page inside Promptizer.
- [ADR-002: Local Promptizer View with Seeded Editable Personas](adrs/adr-002.md) — Requires local view state and inline CRUD.

## Deliverables
- Local Promptizer view switch between Studio and Personas.
- New Personas page with list, selected state, inline create/edit, delete confirmation, and empty state.
- Required + trimmed validation for title and description inputs.
- UI tests for list, create, edit, delete confirmation, empty state, and navigation.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for Personas page CRUD interactions **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Personas page renders seeded personas with title and description.
  - [x] Create form rejects blank or whitespace-only title.
  - [x] Create form rejects blank or whitespace-only description.
  - [x] Edit form trims title and description before save.
  - [x] Delete requires confirmation before calling the delete handler.
- Integration tests:
  - [x] User navigates from Studio to Personas and back without losing selected persona state.
  - [x] User creates a persona from the page and sees it in the list.
  - [x] User edits a persona from the page and sees updated title and description.
  - [x] User deletes all personas and sees the actionable empty state.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Users can manage personas from a dedicated page inside Promptizer.
- No router or global shell navigation is introduced.
- CRUD actions use existing persona data paths rather than a separate page-only store.
