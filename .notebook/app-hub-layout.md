# App Hub Layout

Tags: renderer, hub, app-boundaries

## Summary

The root renderer is now an app hub. Promptizer is isolated under `apps/promptizer`, and `src/ui/app/App.tsx` owns the app side menu plus active app selection.

## Pointers

- `src/ui/app/App.tsx`: hub shell, side app menu, and default Promptizer route.
- `src/ui/app/App.module.css`: hub rail and app icon button states.
- The Promptizer side menu item intentionally renders `/icon.svg`, matching the Promptizer header brand mark instead of using a generic lucide icon.
- `apps/promptizer/ui/app/PromptizerApp.tsx`: Promptizer renderer root mounted by the hub.
- `src/main/index.ts`: Electron window shell; imports Promptizer IPC from `apps/promptizer/main/ipc/register-handlers.ts`.

## Boundary

- Keep app-specific renderer code under `apps/<app>/ui`.
- Keep app-specific main-process code under `apps/<app>/main`.
- Keep shared contracts that are specific to an app under `apps/<app>/shared`.
- The hub should mount app roots and own cross-app navigation, but it should not import app internals beyond each app root component.

Updated: 2026-06-09
