# Prompt Studio App Composition

Tags: renderer, react, composition, prompt-studio

## Summary

Promptizer uses a controller-hook pattern around the main studio screen. The root renderer now mounts it from the app hub.

## Pointers

- `src/ui/app/App.tsx`: hub shell; renders the app side menu and mounts `PromptizerApp` by default.
- `apps/promptizer/ui/app/PromptizerApp.tsx`: Promptizer composition root; runs app-level API key session sync and renders the studio screen.
- `apps/promptizer/ui/app/usePromptStudioController.ts`: composes roles, provider/model selection, generation, copy feedback, persona actions, and modal state into the `PromptStudioScreen` prop contract.
- `apps/promptizer/ui/app/PromptStudioScreen.tsx`: presentational layout; receives grouped view-model props and renders panels/modals.
- `apps/promptizer/ui/components/ComposerPanel/index.tsx`: owns the always-available Settings action in the `Raw Signal` panel header.

## Boundary

- Add cross-panel orchestration and shared UI state to `usePromptStudioController.ts`.
- Keep `PromptStudioScreen.tsx` focused on layout and prop forwarding.
- Keep individual panel components controlled by props instead of importing app stores directly.
- Promptizer no longer renders an app-level header; use the hub app menu for app identity and panel headers for local actions.
- Prefer slots/compound components only when callers need to change the layout structure; this screen currently benefits more from a controller hook.

Updated: 2026-06-09
