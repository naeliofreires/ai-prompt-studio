# Promptizer App Layout

Tags: renderer, app-boundaries

The renderer entry is `src/platform/renderer/main.tsx`, which mounts the Prompt Studio feature. Electron host code is under `src/platform/electron`, and product behavior is organized by feature.

- `src/features/prompt-studio/ui/PromptizerApp.tsx`: renderer composition root.
- `src/platform/electron/main.ts`: Electron shell.
- `src/platform/electron/register-handlers.ts`: composes feature IPC handlers.
- `src/platform/electron/preload.ts`: exposes the namespaced `window.aiPromptStudio` bridge.
- `src/features/<feature>/ui`, `desktop`, and `contract`: renderer UI, Electron-side behavior, and cross-boundary contracts.
- `src/spec`: provider definitions and other product specifications.
- `src/main` and `src/renderer` are compatibility entry-point shims; new implementation code belongs under `src/platform` or the relevant feature.

Updated: 2026-07-12
