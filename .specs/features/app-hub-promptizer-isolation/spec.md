# App Hub and Promptizer Isolation

## Objective

Transform the current Promptizer-only desktop app into an app hub, with Promptizer isolated under `apps/promptizer` and a side menu that can switch between Promptizer and the future GH Review app.

## Acceptance Criteria

- AC1: Promptizer-specific renderer, shared, main-process, and spec code lives under `apps/promptizer`.
- AC2: The root renderer app is a hub shell that shows a persistent side app menu with icon buttons for Promptizer and GH Review.
- AC3: Promptizer remains the default selected app and renders its existing studio UI inside the hub.
- AC4: Clicking GH Review switches the content area to a GH Review placeholder without unmounting the hub shell.
- AC5: Electron, Vite, TypeScript, and Vitest resolve the new Promptizer paths.

## Traceable Tests

- T1 covers AC2, AC3, and AC4 with `test/app-hub.test.tsx`.
- T2 covers AC1 and AC5 through updated imports plus TypeScript/Vitest/build validation.
- T3 keeps existing Promptizer behavior covered by the existing Promptizer component, hook, IPC, and domain tests after path updates.

## TDD Plan

- Task 1: Hub shell
  - Red: add `test/app-hub.test.tsx` expecting app menu buttons, Promptizer default content, and GH Review switching.
  - Green: implement the hub shell and app registry.
  - Refactor: keep the hub styling separate from Promptizer styles.
  - Mara/System Owner verification: AC2-AC4 are traceable and the hub does not know Promptizer internals beyond mounting its app component.
- Task 2: Promptizer isolation
  - Red: move imports in tests/configs to `apps/promptizer` paths and let compilation expose broken boundaries.
  - Green: move Promptizer modules to `apps/promptizer` and update relative imports/configs/scripts.
  - Refactor: rename the Promptizer composition root to `PromptizerApp`.
  - Mara/System Owner verification: AC1 and AC5 are traceable, and no future GH Review code needs to import Promptizer internals.
- Task 3: Validation
  - Red: run the suite/build and capture failing checks.
  - Green: fix failures with minimal changes.
  - Refactor: update README/notebook references that would mislead future work.
  - Mara/System Owner verification: all acceptance criteria have passing tests or explicit validation.
