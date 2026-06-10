# GH Review Initial Screen

## Objective

Create the first GH Review screen inside the app hub, collecting the GitHub username and access token that will be used later to fetch the user's pull requests.

## Acceptance Criteria

- AC1: Selecting GH Review in the hub renders a GH Review screen instead of the placeholder.
- AC2: The screen exposes a labeled GitHub username text field.
- AC3: The screen exposes a labeled GitHub access token field that masks input.
- AC4: Both fields accept typed values without submitting or calling GitHub.
- AC5: The screen keeps the root hub boundary intact; GH Review is mounted by the hub and does not import Promptizer internals.
- AC6: The GH Review screen uses the Promptizer visual identity: dark studio canvas, subtle grid/radial atmosphere, translucent dark panels, monospace uppercase labels, and cyan/fuchsia accent colors.

## Traceable Tests

- T1 covers AC1, AC2, and AC3 in `test/app-hub.test.tsx`.
- T2 covers AC4 by typing into both fields in `test/app-hub.test.tsx`.
- T3 covers AC5 through the existing app hub rendering path and targeted TypeScript/Vitest validation.
- T4 covers AC6 with `test/gh-review-visual-identity.test.ts`, checking the GH Review stylesheet for the same Promptizer palette and dark studio tokens.

## TDD Plan

- Task 1: Initial GH Review form
  - Red: extend `test/app-hub.test.tsx` to expect username and access token fields after selecting GH Review, including password masking for the token.
  - Green: replace the placeholder with a GH Review screen containing controlled username and token inputs.
  - Refactor: style the screen with the existing hub CSS module and keep the hub/app boundary simple.
  - Mara/System Owner verification: AC1-AC5 are covered by targeted tests or validation; no GitHub integration is introduced before credentials handling is designed.
- Task 2: Promptizer identity alignment
  - Red: add a stylesheet contract test that expects Promptizer dark canvas, cyan/fuchsia accents, monospace labels, and no light page canvas.
  - Green: restyle `GhReviewApp.module.css` to match the existing Promptizer studio language.
  - Refactor: keep styling local to GH Review until there is a second real consumer for shared design tokens outside Promptizer.
  - Mara/System Owner verification: AC6 is covered by test and desktop/mobile visual smoke checks.
