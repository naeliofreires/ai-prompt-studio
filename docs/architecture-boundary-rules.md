# Architecture Boundary Rules

These rules protect the single-app Promptizer structure.

## 1. `src` is the application root

- `src/main/**` owns the Electron host, IPC handlers, services, stores, and preload.
- `src/renderer/**` owns the Promptizer renderer.
- `src/shared/**` owns renderer/main contracts and shared domain schemas.
- `src/spec/**` owns built-in Persona and Provider specs.

Allowed examples:

```ts
import { registerIpcHandlers } from "./ipc/register-handlers.js";
import { PromptizerApp } from "./app/PromptizerApp";
```

Disallowed examples:

```ts
import { PromptizerApp } from "../../old-multi-app-path/ui/index";
import { App } from "../old-hub-shell/App";
```

## 2. Public entry points

Current public surfaces:

- `src/main/index.ts`
- `src/renderer/index.ts`

Use these files for bootstrapping when possible.

## 3. Deep app internals are private by default

Files under these folders are implementation details unless re-exported:

- `src/main/ipc/**`
- `src/main/services/**`
- `src/main/store/**`
- `src/renderer/app/**`
- `src/renderer/hooks/**`
- `src/renderer/services/**`

Tests may import them directly for targeted coverage.

## 4. Feature ownership stays inside `src`

For Promptizer, these belong under `src/**`:

- personas
- providers
- prompt generation
- prompt sessions
- API key runtime behavior
- Promptizer IPC contracts

## 5. Shared means contract, not dumping ground

Use `src/shared/**` only for code that must cross process/layer boundaries, such as:

- domain value types
- schema-validated payloads/results
- IPC contracts
- stable constants used by both main and UI

Do not put UI helpers, persistence implementations, service clients, or app-specific orchestration in `shared`.

## 6. Main-process preload

Keep a single preload implementation at `src/main/preload.ts`.

## 7. Boundary checks before merge

Before merging structural changes, check for forbidden imports:

```bash
rg "old-multi-app-path|old-hub-shell" .
```

Any match should be justified as a composition-root exception or refactored behind a public entry point.

## 8. Adding new feature areas

Add new Promptizer feature areas under the existing `src/main`, `src/renderer`, `src/shared`, or `src/spec` boundaries.
