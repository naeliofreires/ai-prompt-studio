# Prompt Studio App Composition

Tags: renderer, react, composition, prompt-studio

## Summary

Promptizer uses a controller-hook pattern around the main Prompt Studio screen. The root renderer mounts it directly as the app entry.

## Pointers

- `src/renderer/main.tsx`: renderer entry; mounts `PromptizerApp` directly.
- `src/renderer/app/PromptizerApp.tsx`: Promptizer composition root; runs app-level API key session sync and renders the studio screen.
- `src/renderer/app/usePromptStudioController.ts`: composes roles, provider/model selection, generation, copy feedback, persona actions, and modal state into the `PromptStudioScreen` prop contract.
- `src/renderer/app/PromptStudioScreen.tsx`: presentational layout; receives grouped view-model props and renders panels/modals.
- `src/renderer/components/ComposerPanel/index.tsx`: owns the always-available Settings action in the `Raw Signal` panel header.

## Boundary

- Add cross-panel orchestration and shared UI state to `usePromptStudioController.ts`.
- Keep `PromptStudioScreen.tsx` focused on layout and prop forwarding.
- Keep individual panel components controlled by props instead of importing app stores directly.
- Promptizer owns the app identity directly; use panel headers for local actions.
- Prefer slots/compound components only when callers need to change the layout structure; this screen currently benefits more from a controller hook.

Updated: 2026-06-09
