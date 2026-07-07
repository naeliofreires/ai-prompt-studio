# Settings Modal
> Renderer settings UI; visual modal stays decoupled from the API key store

Entry: `src/renderer/components/SettingsModal/index.tsx`

Flow: `src/renderer/components/ComposerPanel/index.tsx` exposes the Settings action in the `Raw Signal` panel -> `src/renderer/app/usePromptStudioController.ts` opens modal -> `src/renderer/hooks/useApiKeySettings.ts` reads/writes the API key store -> `SettingsModal` receives `keys` and callbacks by props -> save closes modal.

Composer model visibility: `src/renderer/app/usePromptStudioController.ts` filters the providers passed to `ComposerPanel` by `useApiKeySettings().isConfigured(...)`. The full `PROVIDERS` list still goes to `SettingsModal` so users can add keys for hidden providers.

Boundary:
- `src/renderer/components` should not import `src/renderer/store/api-key-store.ts` directly.
- The modal may keep local draft/display state, but persistence and sync stay in hooks/store.
- The renderer may receive configured-provider status from the main process, but never API key values from `.env`.

Provider source: `src/shared/domain/provider.ts` -> `src/spec/providers.json`

Updated: 2026-06-11
