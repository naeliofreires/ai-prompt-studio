# Settings Modal

> Renderer settings UI; the modal keeps drafts local while the provider-key repository owns persistence and bridge sync.

Entry: `src/features/prompt-studio/ui/PromptStudioScreen.tsx` renders `src/features/providers/ui/SettingsModal/index.tsx` from props supplied by `usePromptStudioViewModel.ts`.

Flow: `ComposerPanel` opens the modal → `usePromptStudioViewModel` controls its visibility → `useApiKeyRepository` provides keys and save/clear callbacks → `SettingsModal` keeps only draft, visibility, and confirmation state.

- The Composer shows configured providers; the Settings modal receives all provider definitions so users can add a key for any provider.
- The modal does not import a key store directly.
- Provider definitions are `src/spec/providers.json`, exposed through `src/features/providers/contract/provider.ts`.
- The namespaced bridge is `window.aiPromptStudio.providers`, with `listConfiguredApiKeys`, `setApiKeys`, and `clearAllApiKeys` exposed from `src/platform/electron/preload.ts`.
- Environment keys are read only in the Electron main process; the renderer receives configured status, not `.env` values.

Updated: 2026-07-12
