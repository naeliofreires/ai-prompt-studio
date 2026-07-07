---
status: completed
title: Update prompt resolution and regression coverage for editable personas
type: refactor
complexity: medium
dependencies:
  - task_01
  - task_02
  - task_03
---

# Task 4: Update prompt resolution and regression coverage for editable personas

## Overview
This task closes the integration loop from edited persona description to generated prompt behavior. It removes or resolves conflicts with old immutable built-in assumptions and adds regression coverage for the complete persona-to-generation path.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- Prompt resolution MUST use the editable persona description selected by the user.
- Old immutable built-in persona assumptions MUST NOT cause four personas to appear in the MVP list.
- Unknown or deleted persona IDs MUST fail with clear behavior consistent with the UI guardrails.
- The generation pipeline MUST continue attaching persona context to the system prompt.
- Final validation MUST include test, lint, and build commands unless blocked by an environment issue.
</requirements>

## Subtasks
- [x] 4.1 Audit persona resolution after seeded editable persona changes.
- [x] 4.2 Align built-in or legacy persona behavior with the MVP two-persona source of truth.
- [x] 4.3 Verify edited persona descriptions reach prompt context construction.
- [x] 4.4 Add regression tests for editable persona generation flow.
- [x] 4.5 Run full validation commands and address regressions.
- [x] 4.6 Document any intentional legacy behavior that remains.

## Implementation Details
Follow the TechSpec sections "Impact Analysis", "Testing Approach", and "Technical Considerations". This task should not introduce new persona features; it should ensure the implemented MVP behavior is consistent across renderer, main process, and prompt construction.

### Relevant Files
- `apps/promptizer/main/utils/resolve-persona-context.ts` — Resolves persona IDs for generation.
- `apps/promptizer/main/application/generate-refined-prompt.ts` — Main application flow for prompt generation.
- `apps/promptizer/main/services/LLMAdapter.ts` — Sends system/user prompts to the model adapter.
- `apps/promptizer/main/utils/build-refinement-system-prompt.ts` — Builds the system prompt with persona context.
- `apps/promptizer/spec/personas.json` — Legacy built-in persona source that may need adjustment or removal from active MVP paths.
- `apps/promptizer/shared/contracts/llm.ts` — Contract for prompt generation and persona context plumbing.

### Dependent Files
- `apps/promptizer/ui/hooks/usePromptGeneration.ts` — Sends selected persona ID into generation.
- `apps/promptizer/ui/hooks/useRoles.ts` — Provides the selected persona list used by UI and generation.
- `test/use-prompt-generation.test.ts` — Renderer generation flow tests.
- `test/custom-personas-store.test.ts` — Persistence behavior for editable personas.
- Existing or new tests for `resolve-persona-context` and system prompt construction — Required regression coverage for persona description use.

### Related ADRs
- [ADR-001: Dedicated Personas Page MVP](adrs/adr-001.md) — Requires selected persona description to affect Generate behavior.
- [ADR-002: Local Promptizer View with Seeded Editable Personas](adrs/adr-002.md) — Requires editable store source of truth and handling of built-in conflicts.

## Deliverables
- Prompt resolution aligned with editable persona source of truth.
- Regression tests showing edited persona descriptions affect generation context.
- Legacy built-in persona assumptions resolved or documented.
- Full validation results for test, lint, and build.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for persona-to-generation prompt flow **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Resolving an editable persona ID returns its current edited description.
  - [x] Resolving a deleted or unknown persona ID returns the expected error behavior.
  - [x] System prompt construction includes the selected persona description.
  - [x] Legacy built-in persona data does not add unintended MVP personas to the active list.
- Integration tests:
  - [x] User edits a persona description and the next generate request uses the edited description.
  - [x] Full persona CRUD plus generate path works after all dependent tasks are complete.
  - [x] `npm run test`, `npm run lint`, and `npm run build` complete successfully or report documented environment blockers.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Edited persona descriptions are the source used by generation.
- The MVP exposes two editable initial personas rather than four immutable built-ins.
- Full validation succeeds or any blocker is documented with exact command output.
