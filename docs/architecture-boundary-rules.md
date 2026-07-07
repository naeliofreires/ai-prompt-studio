# Architecture Boundary Rules

These rules protect the app boundaries introduced by the Promptizer modularization work.

## 1. `src` is the composition shell

- `src/main/**` may create the Electron host and compose app modules.
- `src/ui/**` may render the hub shell and switch between app modules.
- `src/**` must not contain feature-owned domain types, hooks, services, stores, or mock data.

Allowed examples:

```ts
import { registerPromptizerMain } from "../../apps/promptizer/main/index.js";
import { PromptizerApp } from "../../../apps/promptizer/ui/index";
```

Disallowed examples:

```ts
import { registerIpcHandlers } from "../../apps/promptizer/main/ipc/register-handlers.js";
import { PromptizerApp } from "../../../apps/promptizer/ui/app/PromptizerApp";
```

## 2. Apps expose public entry points

Each app must expose public entry points for the host/hub to consume.

Current public surfaces:

- `apps/promptizer/main/index.ts`
- `apps/promptizer/ui/index.ts`

The hub must import from these files, not from deeper implementation paths.

## 3. Deep app internals are private by default

Files under these folders are implementation details unless re-exported by an app entry point:

- `apps/*/main/ipc/**`
- `apps/*/main/services/**`
- `apps/*/main/store/**`
- `apps/*/ui/app/**`
- `apps/*/ui/hooks/**`
- `apps/*/ui/services/**`

Other apps and the hub must not import them directly.

## 4. Feature ownership stays inside the feature app

Feature-specific code must live inside its owning app boundary.

For Promptizer, these belong under `apps/promptizer/**`:

- personas
- providers
- prompt generation
- prompt sessions
- API key runtime behavior
- Promptizer IPC contracts

## 5. Shared means contract, not dumping ground

Use `apps/*/shared/**` only for code that must cross process/layer boundaries inside that app, such as:

- domain value types
- schema-validated payloads/results
- IPC contracts
- stable constants used by both main and UI

Do not put UI helpers, persistence implementations, service clients, or app-specific orchestration in `shared`.

## 6. Main-process preload paths are app-owned

The Electron host must not hardcode an app's preload implementation path.

Use the app's public main API instead:

```ts
import { getPromptizerPreloadPath } from "../../apps/promptizer/main/index.js";
```

## 7. Boundary checks before merge

Before merging structural changes, check for forbidden imports:

```bash
rg "from ['\"].*apps/.*/(main/ipc|ui/app|ui/hooks|ui/services)" src apps
rg 'src/(hooks|services|types)' apps
```

Any match should be justified as a composition-root exception or refactored behind a public entry point.

## 8. When adding a new app

A new app must start with explicit public surfaces:

```txt
apps/new-app/main/index.ts   # if it has main-process behavior
apps/new-app/ui/index.ts     # if it has renderer UI
apps/new-app/shared/**       # only if contracts/types cross layers
```

The hub may import only from those public surfaces.
