# Prompt Studio App Composition

Tags: renderer, React, composition, prompt-studio

`src/platform/renderer/main.tsx` mounts `PromptizerApp` from `src/features/prompt-studio/ui/PromptizerApp.tsx`. The app delegates state composition to `usePromptStudioViewModel.ts` and renders `PromptStudioScreen.tsx`.

- `usePromptStudioViewModel.ts` composes refinement configuration, provider/model selection, API-key configuration, generation, copy feedback, attachments, navigation, and Settings modal state.
- `PromptStudioScreen.tsx` is presentational: it renders the Studio and forwards grouped props to feature components.
- `ComposerPanel` comes from `features/prompt-generation/ui`; `SettingsModal` comes from `features/providers/ui`.
- Keep cross-feature orchestration in the view model and feature persistence behind feature clients or repositories, not in presentational components.

Updated: 2026-07-12
