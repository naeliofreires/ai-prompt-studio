# Settings Modal
> Renderer settings UI; secrets stay out of React state

Entry: `src/renderer/components/SettingsModal.tsx`

Flow: `src/renderer/app/App.tsx` opens modal -> modal displays provider API key fields -> save closes modal.

Security:
- API key inputs are display-only for now; no persistence and no React state storage.
- Spec source: `docs/tech-spec-ai-prompt-studio.md` (L189-196) says secrets must be read by main-process secure config or `.env`.

Provider source: `src/shared/domain/provider.ts` -> `spec/providers.json`

Updated: 2026-05-12
