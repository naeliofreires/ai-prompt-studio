# Promptizer App Layout

Tags: renderer, app-boundaries

## Summary

The root renderer now mounts Promptizer directly as a single app. The previous multi-app split was collapsed into `src`.

## Pointers

- `src/renderer/main.tsx`: Vite renderer entry; mounts `PromptizerApp` directly.
- `src/renderer/app/PromptizerApp.tsx`: Promptizer renderer root.
- `src/main/index.ts`: Electron window shell; registers IPC from `src/main/ipc/register-handlers.ts`.

## Boundary

- Keep renderer code under `src/renderer`.
- Keep main-process code under `src/main`.
- Keep renderer/main contracts under `src/shared`.
- Keep built-in Persona and Provider specs under `src/spec`.

Updated: 2026-06-09
