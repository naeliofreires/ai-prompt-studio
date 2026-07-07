---
status: completed
title: Enforce generate guardrails for empty or invalid persona state
type: frontend
complexity: medium
dependencies:
  - task_01
  - task_02
---

# Task 3: Enforce generate guardrails for empty or invalid persona state

## Overview
This task ensures users cannot generate when no valid persona is available or selected. It aligns Studio UI state, persona selection behavior, and generation hook errors so the blocked state is clear before and during generation attempts.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- Generate MUST be blocked when the persona list is empty.
- Generate MUST be blocked when the selected persona ID does not resolve to an available persona.
- Deleting the selected persona MUST leave selection in a valid state or explicitly clear it.
- The Studio UI MUST show clear guidance to create or select a persona when generation is blocked.
- The generation hook MUST retain a defensive guard for missing persona selection.
- Existing guards for input, model, API key, and provider configuration MUST continue to work.
</requirements>

## Subtasks
- [x] 3.1 Define the valid persona selection state after load, create, edit, and delete.
- [x] 3.2 Block Generate in the Studio UI when no valid persona is available.
- [x] 3.3 Keep hook-level generation guards aligned with UI-level disabled state.
- [x] 3.4 Add clear user-facing guidance for empty or invalid persona state.
- [x] 3.5 Preserve existing generation guard behavior for unrelated missing inputs.
- [x] 3.6 Add tests for empty list, stale selection, and normal selected persona generation.

## Implementation Details
Follow the TechSpec sections "System Architecture", "Data Flow", and "Testing Approach". This task should not redesign prompt generation; it should connect persona availability and selected-persona validity to existing generation guardrails.

### Relevant Files
- `apps/promptizer/ui/hooks/usePromptGeneration.ts` — Existing generation guard logic for missing persona and other required inputs.
- `apps/promptizer/ui/app/usePromptStudioController.ts` — Selection state and persona CRUD coordination.
- `apps/promptizer/ui/app/PromptStudioScreen.tsx` — Studio UI surface for Generate button and guidance text.
- `apps/promptizer/ui/components/PersonaPanel/index.tsx` — Existing selected persona UI and possible disabled/empty messaging.
- `apps/promptizer/ui/components/ComposerPanel/*` — Likely Generate button or composer state integration point.

### Dependent Files
- `apps/promptizer/ui/components/PersonasPage/*` — Delete and selection actions on the Personas page affect Studio guardrails.
- `apps/promptizer/ui/hooks/useRoles.ts` — Persona list updates drive empty and invalid selection state.
- `test/use-prompt-generation.test.ts` — Existing hook tests should cover blocked generation.
- New or existing UI tests under `test/` — Studio disabled/guidance state coverage should be added.

### Related ADRs
- [ADR-001: Dedicated Personas Page MVP](adrs/adr-001.md) — Requires Generate to be blocked without an available persona.
- [ADR-002: Local Promptizer View with Seeded Editable Personas](adrs/adr-002.md) — Defines selection risk and mitigation after delete.

## Deliverables
- Valid persona selection behavior after persona load, create, edit, and delete.
- Generate disabled or blocked UI state for empty/invalid persona conditions.
- Clear guidance to create or select a persona when generation cannot proceed.
- Tests for generation guardrails and UI blocked state.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for persona selection and Generate blocking **(REQUIRED)**

## Tests
- Unit tests:
  - [x] `usePromptGeneration` returns a missing-persona error when selected persona is absent.
  - [x] Existing input/model/API-key guard tests still pass when persona is valid.
  - [x] Selection state clears or reassigns after deleting the selected persona.
  - [x] Empty persona list produces a blocked generation state.
- Integration tests:
  - [x] Studio disables or blocks Generate after all personas are deleted.
  - [x] Studio shows guidance to create or select a persona when blocked.
  - [x] Creating and selecting a new persona unblocks Generate when other requirements are met.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Generate never proceeds without a valid selected persona.
- The user receives actionable guidance when persona state blocks generation.
- Existing non-persona generation validations remain intact.
