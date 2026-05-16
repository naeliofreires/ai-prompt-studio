# Prompt Studio App Composition

Tags: renderer, react, composition, prompt-studio

## Summary

The renderer app uses a controller-hook pattern around the main studio screen.

## Pointers

- `src/ui/app/App.tsx`: composition root; runs app-level API key session sync and renders the studio screen.
- `src/ui/app/usePromptStudioController.ts`: composes roles, provider/model selection, generation, copy feedback, persona actions, and modal state into the `PromptStudioScreen` prop contract.
- `src/ui/app/PromptStudioScreen.tsx`: presentational layout; receives grouped view-model props and renders panels/modals.

## Boundary

- Add cross-panel orchestration and shared UI state to `usePromptStudioController.ts`.
- Keep `PromptStudioScreen.tsx` focused on layout and prop forwarding.
- Keep individual panel components controlled by props instead of importing app stores directly.
- Prefer slots/compound components only when callers need to change the layout structure; this screen currently benefits more from a controller hook.

Updated: 2026-05-16
