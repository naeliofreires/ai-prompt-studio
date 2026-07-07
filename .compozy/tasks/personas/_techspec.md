# Personas Page TechSpec

## Executive Summary

Implement the Personas page as a local view inside Promptizer, not as a global app route. The feature will reuse the existing persona domain shape, CRUD bridge, persistence layer, and generation pipeline while adding a dedicated inline-management UI.

The primary technical trade-off is simplicity over future navigation flexibility: a local view switch avoids introducing routing infrastructure now, but future Promptizer pages may require a stronger navigation model. The second trade-off is seeding editable personas instead of preserving immutable built-ins; this directly satisfies edit/delete requirements but requires careful one-time seed logic and test updates.

## System Architecture

### Component Overview

- `PromptizerApp`: owns or receives the active Promptizer view state: `studio` or `personas`.
- `PromptStudioScreen`: remains the generation workspace and links to the Personas page.
- `PersonasPage`: new UI surface for listing, selecting, creating, editing, and deleting personas with inline forms.
- `usePromptStudioController`: coordinates persona state, selected persona ID, view transitions, and generation props.
- `useRoles`: remains the persona data source and CRUD action owner; it will support seeded editable personas.
- `persona-client`: continues to abstract desktop IPC and browser fallback CRUD operations.
- `custom-personas-store`: persists editable personas and handles one-time MVP seed records.
- `usePromptGeneration`: keeps generation guardrails and returns a clear blocked state when no persona is selected.
- Main generation pipeline: `generate-refined-prompt`, `resolve-persona-context`, `LLMAdapter`, and `build-refinement-system-prompt` continue to apply the selected persona description to generation.

Data flow:

1. App starts and `useRoles` loads editable personas through `persona-client`.
2. The persistence layer ensures the Frontend Specialist and Backend Specialist seed personas exist on first run.
3. `PromptizerApp` renders either Studio or Personas based on local view state.
4. PersonasPage reads personas and CRUD handlers from the controller/hook layer.
5. Inline create/edit forms submit title and description as `label` and `role`.
6. Delete requires confirmation, then removes the persona through the same CRUD path.
7. Selection state updates after create/delete/edit so the selected persona is valid or explicitly absent.
8. Generate uses the selected persona ID. If no valid persona exists, UI blocks generation and the hook keeps the defensive guard.

## Implementation Design

### Core Interfaces

Primary persona contract, represented in Go-style form for specification clarity:

```go
type Persona struct {
    ID    string
    Label string // UI title
    Role  string // UI description used in generation context
}
```

Existing TypeScript domain shape should remain equivalent:

```ts
type CustomPersona = {
  id: string;
  label: string;
  role: string;
};
```

New local view type:

```ts
type PromptizerView = 'studio' | 'personas';
```

Inline form state:

```ts
type PersonaFormState = {
  id?: string;
  title: string;
  description: string;
  mode: 'create' | 'edit';
};
```

### Data Models

No new business entity is required. The MVP keeps the existing persona data model:

- `id`: stable persona identifier.
- `label`: persona title shown in the UI.
- `role`: persona description attached to generation context.

Seed personas:

- `Frontend Specialist`: editable and deletable.
- `Backend Specialist`: editable and deletable.

Seed requirements:

- Seed only once per fresh editable store.
- Do not recreate a seed persona after the user deletes it.
- Avoid duplicate seed records across app launches.

### API Endpoints

No HTTP API is introduced.

Existing local IPC/browser client operations remain the integration surface:

- list personas.
- create persona.
- update persona.
- delete persona.
- generate prompt with selected persona ID.

The exact function names and IPC channels should follow the existing `persona-client`, preload, IPC contract, and handler conventions.

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|----------------------|-----------------|
| `apps/promptizer/ui/app/PromptizerApp.tsx` | modified | Add local view switch between Studio and Personas. Low risk. | Add view state and render branch or pass view state into controller. |
| `apps/promptizer/ui/app/PromptStudioScreen.tsx` | modified | Add entry point to Personas page and show selected persona/blocked state clearly. Medium risk due to UX coupling. | Add navigation action and disabled/empty persona messaging. |
| `apps/promptizer/ui/app/usePromptStudioController.ts` | modified | Coordinate view state, persona selection, and CRUD handlers. Medium risk. | Expose page navigation, persona actions, and valid selected-persona state. |
| `apps/promptizer/ui/hooks/useRoles.ts` | modified | Support seed-aware editable persona loading and selection behavior. Medium risk. | Ensure list/create/update/delete state stays consistent. |
| `apps/promptizer/ui/components/PersonasPage/*` | new | Dedicated inline CRUD UI. Medium risk due to form states. | Build list, inline create/edit form, delete confirmation, empty state. |
| `apps/promptizer/ui/api/persona-client.ts` | modified if needed | Browser fallback may need seed behavior alignment. Low/medium risk. | Keep fallback behavior consistent with desktop. |
| `apps/promptizer/main/store/custom-personas-store.ts` | modified | Seed two editable personas once. Medium risk around duplicate or recreated seed data. | Add seed metadata or first-run guard. |
| `apps/promptizer/spec/personas.json` | modified or deprecated for MVP persona source | Current four built-ins conflict with two editable initial personas. Medium risk. | Remove dependency from UI list or reduce/replace built-ins according to implementation path. |
| `apps/promptizer/main/utils/resolve-persona-context.ts` | modified if built-ins are removed from active source | Resolution currently merges built-in and custom personas. Medium risk. | Ensure selected editable personas resolve correctly. |
| `apps/promptizer/ui/hooks/usePromptGeneration.ts` | modified | Existing guard already blocks missing persona; may need clearer empty-list error. Low risk. | Keep defensive guard and align message with UI. |
| Tests under `test/` | modified/new | Existing persona assumptions may change from four immutable built-ins to two editable seeds. Medium risk. | Update unit/component tests and add PersonasPage coverage. |

## Testing Approach

### Unit Tests

- `useRoles`: loads the two seeded personas on first run, does not duplicate seeds, does not recreate deleted seeds, and updates state after create/update/delete.
- `custom-personas-store`: persists seeded personas and user changes across reloads.
- `usePromptGeneration`: blocks generation when selected persona is missing or no persona exists.
- Validation helpers: title and description are required and trimmed before persistence.

### Integration Tests

- `persona-client` and preload/IPC handlers: list/create/update/delete behavior remains consistent across desktop bridge and browser fallback.
- Prompt generation: selected persona description reaches persona context resolution and system prompt construction.
- PersonasPage component: list display, inline create, inline edit, delete confirmation, empty state, and selection behavior.

Recommended validation commands:

- `npm run test`
- `npm run lint`
- `npm run build`

## Development Sequencing

### Build Order

1. Update persona seed strategy in the persistence/domain layer - no dependencies.
2. Update `useRoles` loading and CRUD behavior - depends on step 1.
3. Add local Promptizer view state and navigation entry points - depends on step 2.
4. Build `PersonasPage` with list, inline create/edit form, delete confirmation, and empty state - depends on steps 2 and 3.
5. Wire selection validity and Generate blocked messaging across Studio and generation hook - depends on steps 2 and 3.
6. Update prompt resolution assumptions if immutable built-ins are removed from the active source - depends on step 1.
7. Add and update tests for seed behavior, page CRUD, selection, and generate guardrails - depends on steps 1 through 6.
8. Run validation commands and fix regressions - depends on step 7.

### Technical Dependencies

- Existing persona CRUD IPC/browser fallback must remain available.
- Existing Electron-store/localStorage persistence must remain compatible with current users.
- Existing generation pipeline must continue accepting a selected persona ID and resolving the persona description.

## Monitoring and Observability

No new production telemetry is required for the MVP.

Useful local diagnostics:

- Log or surface user-facing errors for persona load/create/update/delete failures.
- Preserve current generation error handling for missing or unknown personas.
- Keep validation errors visible near the inline form fields.

## Technical Considerations

### Key Decisions

- Decision: Use local Promptizer view state instead of adding a router.
  - Rationale: The MVP needs only Studio and Personas views.
  - Trade-off: Future pages may need refactoring into route-based navigation.
  - Alternatives rejected: Internal router and global shell navigation.

- Decision: Seed two editable personas in the editable persona store.
  - Rationale: The PRD requires the initial personas to be editable and deletable.
  - Trade-off: Seed lifecycle must prevent duplicate or recreated personas.
  - Alternatives rejected: Immutable built-ins with overrides or conversion migration.

- Decision: Use inline forms on the Personas page.
  - Rationale: The approved UX keeps management visible and direct.
  - Trade-off: Inline editing requires explicit save/cancel and active-form state.
  - Alternatives rejected: Reusing create/edit modals or separate detail pages.

- Decision: Validate title and description with required trimmed values only.
  - Rationale: Matches MVP scope and existing title/description-only model.
  - Trade-off: No length constraints are added now.
  - Alternatives rejected: Richer validation and advanced prompt-quality scoring.

### Known Risks

- Seed lifecycle risk: seed personas could duplicate or reappear after deletion. Mitigation: persist a seed completion marker or equivalent first-run guard.
- Selection risk: deleting the active persona can leave stale selected IDs. Mitigation: clear or reassign selection after deletion and keep generation blocked when invalid.
- Source-of-truth risk: existing built-ins may conflict with seeded editable personas. Mitigation: explicitly choose the editable store as the MVP page source and adjust resolution tests.
- Form-state risk: inline editing may lose unsaved changes during navigation. Mitigation: keep one active form and use explicit cancel/save actions.

## Architecture Decision Records

- [ADR-001: Dedicated Personas Page MVP](adrs/adr-001.md) — Use a simple dedicated Personas page inside Promptizer with editable and deletable personas, title and description fields only, and Generate blocked when no persona is available.
- [ADR-002: Local Promptizer View with Seeded Editable Personas](adrs/adr-002.md) — Use local Promptizer view state, seed two editable personas, implement inline CRUD, confirm deletion, and validate required trimmed fields.
