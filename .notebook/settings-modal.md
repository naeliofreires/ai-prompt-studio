# Settings Modal
> Renderer settings UI; visual modal stays decoupled from the API key store

Entry: `src/ui/components/SettingsModal/index.tsx`

Flow: `src/ui/app/App.tsx` opens modal -> `src/ui/hooks/useApiKeySettings.ts` reads/writes the API key store -> `SettingsModal` receives `keys` and callbacks by props -> save closes modal.

Boundary:
- `src/ui/components` should not import `src/ui/store/api-key-store.ts` directly.
- The modal may keep local draft/display state, but persistence and sync stay in hooks/store.

Provider source: `src/shared/domain/provider.ts` -> `spec/providers.json`

Updated: 2026-05-16
