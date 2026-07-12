# Architecture Boundary Rules

Promptizer is one Electron application organized by feature and runtime boundary.

## Layout and ownership

```text
src/
  features/<feature>/
    ui/        renderer-facing components, hooks, and feature clients
    desktop/   Electron handlers, use cases, stores, and provider integration
    contract/  schemas, types, IPC channels, and stable feature data
  platform/
    electron/  Electron host, preload, handler composition, and logging
    renderer/  renderer bootstrap, bridge access, browser storage, and shared UI shell
  shared/lib/  small runtime-neutral utilities
  spec/        built-in Provider and Seed Persona data
```

`src/main/index.ts`, `src/main/preload.ts`, and `src/renderer/main.tsx` are compatibility entry-point shims. They only delegate to `platform/electron/main.ts`, `platform/electron/preload.ts`, and `platform/renderer/main.tsx`; implementation belongs in those platform locations.

## Allowed dependencies

- `features/*/ui` may use its feature's `contract`, other feature UI public modules, `platform/renderer`, `shared/lib`, and `spec` data exposed through contracts.
- `features/*/desktop` may use its feature's `contract`, other feature desktop or contract modules, `platform/electron`, `shared/lib`, and `spec`.
- `features/*/contract` may use other contracts, `shared/lib`, and `spec`. Contracts remain usable by both Electron and renderer code.
- `platform/electron` composes desktop features and contracts. `platform/renderer` bootstraps and supports UI features and contracts.
- `shared/lib` is runtime-neutral. `spec` is declarative seed/catalog data, not a place for application behavior.

## Prohibited dependencies

- Feature UI must not import `desktop` modules.
- Feature desktop code must not import `ui` modules.
- Feature contracts must not import `ui`, `desktop`, or `platform` modules.
- Renderer code must not access Electron APIs directly; it uses the renderer bridge.
- Do not put persistence, Provider SDK integration, Electron APIs, or UI helpers in `shared/lib` or feature contracts.

ESLint enforces the feature-layer import restrictions for relative imports, including paths such as `../../personas/desktop/...`.

## Electron boundary

There is one preload implementation: `src/platform/electron/preload.ts`, reached through the `src/main/preload.ts` shim. It exposes one namespaced `window.aiPromptStudio` bridge. Feature UI calls that bridge through `src/platform/renderer/api/electron-bridge.ts`; IPC channel names and payloads live in feature `contract` modules.

Keep the preload API narrow, namespaced by capability (`personas`, `providers`, and `promptGeneration`), and validate payloads in desktop handlers before invoking feature behavior.

## Adding a feature

Create only the slices the feature needs under `src/features/<feature>/{ui,desktop,contract}`. Put cross-process types and channels in `contract`, renderer behavior in `ui`, and Electron-only behavior in `desktop`. Update the platform composition root when registering handlers or mounting UI.
