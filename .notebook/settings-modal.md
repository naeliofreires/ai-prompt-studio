# Settings Modal
> Renderer settings UI; visual modal stays decoupled from the API key store

Entry: `apps/promptizer/ui/components/SettingsModal/index.tsx`

Flow: `apps/promptizer/ui/components/ComposerPanel/index.tsx` exposes the Settings action in the `Raw Signal` panel -> `apps/promptizer/ui/app/usePromptStudioController.ts` opens modal -> `apps/promptizer/ui/hooks/useApiKeySettings.ts` reads/writes the API key store -> `SettingsModal` receives `keys` and callbacks by props -> save closes modal.

Composer model visibility: `apps/promptizer/ui/app/usePromptStudioController.ts` filters the providers passed to `ComposerPanel` by `useApiKeySettings().isConfigured(...)`. The full `PROVIDERS` list still goes to `SettingsModal` so users can add keys for hidden providers.

Boundary:
- `apps/promptizer/ui/components` should not import `apps/promptizer/ui/store/api-key-store.ts` directly.
- The modal may keep local draft/display state, but persistence and sync stay in hooks/store.
- The renderer may receive configured-provider status from the main process, but never API key values from `.env`.

Provider source: `apps/promptizer/shared/domain/provider.ts` -> `apps/promptizer/spec/providers.json`

Updated: 2026-06-11
