# Deepening Plan — Promptizer Architecture

5 candidates, ordered by recommendation strength. Each section follows the same structure: context, files involved, step-by-step tasks, verification criteria, rollback notes.

---

## Candidate 1 — Open the IPC handler composition root for injection

**Strength:** Strong | **Category:** ports & adapters

### Context

`register-handlers.ts` creates `LLMAdapter` and `PromptEvaluator` at module scope (lines 35-36), baking the real `generateText` from Vercel AI SDK into every IPC handler. The existing `LlmAdapter` and `PromptEvaluator` interfaces already define the seam, but the seam is hypothetical — there is only one adapter (production). Making `generateText` injectable through the public entry point gives tests a real seam with two adapters (production + in-memory fake).

### Files

| File | Role | Change type |
|------|------|-------------|
| `main/index.ts` | Public entry point | Edit — add options param to re-export |
| `main/ipc/register-handlers.ts` | Composition root | Edit — accept options, remove module-scope instantiation |
| `main/services/LLMAdapter.ts` | LLM adapter factory | No change (already injectable) |
| `main/services/PromptEvaluator.ts` | Evaluator factory | No change (already injectable) |

### Tasks

#### Task 1.1 — Define `RegisterHandlersOptions` in `register-handlers.ts`

Define an options interface that carries the two injectable dependencies:

```ts
export interface RegisterHandlersOptions {
  generateText: GenerateTextFn;
}
```

Import `GenerateTextFn` from `../services/LLMAdapter.js` (already exported).

#### Task 1.2 — Change `registerIpcHandlers` signature

Change from `registerIpcHandlers(): void` to `registerIpcHandlers(options: RegisterHandlersOptions): void`.

Move the module-scope lines:
```ts
const llmAdapter = LLMAdapter({ generateText });
const promptEvaluator = PromptEvaluator({ generateText });
```
inside the function body, using `options.generateText`.

#### Task 1.3 — Update `main/index.ts` public surface

Change the registration seam so the Electron entry can pass options:

```ts
export { registerIpcHandlers as registerPromptizerMain, type RegisterHandlersOptions } from "./ipc/register-handlers.js";
```

The Electron entry calls `registerIpcHandlers({ generateText })` from `ai` at wiring time.

#### Task 1.4 — Update Electron wiring

In `src/main/` (the Electron entry), update the call site to pass `{ generateText }` from the Vercel AI SDK. This keeps composition responsibility at the process entry.

#### Task 1.5 — Write tests for `generatePrompt` IPC handler

With injection in place, write a test that:
- Creates a fake `generateText` that returns a canned JSON response
- Calls the registered handler with a valid payload
- Asserts the result matches `generatePromptIpcResultSchema.parse({ ok: true, ... })`
- Tests the `ok: false` path (unknown configuration, validation error)

### Verification

- [ ] `registerIpcHandlers` accepts `options` param; no module-scope `generateText` import
- [ ] Existing `main/index.ts` re-exports the options type
- [ ] Electron wiring compiles and app starts normally
- [ ] New test file `main/ipc/__tests__/register-handlers.test.ts` passes with fake `generateText`
- [ ] No change to `LLMAdapter.ts` or `PromptEvaluator.ts` internals

### Rollback

Revert `register-handlers.ts` to module-scope instantiation. Revert `main/index.ts` re-export. Delete test file.

---

## Candidate 2 — Collapse the API key management module

**Strength:** Strong | **Category:** in-process

### Context

Six modules across two layers manage one concept — API keys. The Zustand store (`api-key-store.ts`, 88 lines) is a thin proxy over `localStorage` with fire-and-forget IPC sync that swallows errors. The `api-key-storage.ts` (44 lines) handles raw localStorage I/O. The `api-key-sync-client.ts` (34 lines) bridges to main process. The `useApiKeySettings.ts` hook (24 lines) is a 3-line Zustand selector wrapper. On the main side, `api-key-manager.ts` (57 lines) holds runtime keys in a `Map` with env var fallback. `shared/domain/api-keys.ts` (32 lines) provides masking/validation helpers.

The deletion test confirms depth: deleting the Zustand store moves its logic into callers (the hook and the session sync hook). Deleting `api-key-storage.ts` does the same. These are pass-through modules that add no leverage — the caller must still understand localStorage keys, sync timing, and hydration races.

### Files

| File | Role | Change type |
|------|------|-------------|
| `ui/store/api-key-store.ts` | Zustand store | Delete |
| `ui/config/api-key-storage.ts` | localStorage I/O | Delete (absorbed) |
| `ui/api/api-key-sync-client.ts` | IPC bridge | Delete (absorbed) |
| `ui/hooks/useApiKeySettings.ts` | Hook wrapper | Delete (absorbed) |
| `shared/domain/api-keys.ts` | Masking/validation | Keep (shared, used by main) |
| `ui/hooks/useApiKeySessionSync.ts` | Session hydration | Edit — use new repository |
| `ui/app/usePromptStudioController.ts` | Controller | Edit — use new repository instead of `useApiKeySettings` |

### New file

| File | Role |
|------|------|
| `ui/api/api-key-repository.ts` | Single deep module |

### Tasks

#### Task 2.1 — Create `ApiKeyRepository` in `ui/api/api-key-repository.ts`

Interface:
```ts
export interface ApiKeyRepository {
  getKeys(): Partial<Record<ProviderId, string>>;
  setKeys(patch: Partial<Record<ProviderId, string>>): void;
  clearProvider(id: ProviderId): void;
  clearAll(): void;
  isConfigured(providerId: ProviderId): boolean;
  configuredProviderIds(): ProviderId[];
  hydrateFromSession(): void;
  refreshConfiguredProviders(): Promise<void>;
}
```

Implementation absorbs:
- localStorage read/write from `api-key-storage.ts`
- IPC sync from `api-key-sync-client.ts` (with error handling surfaced instead of swallowed)
- Masking logic from `shared/domain/api-keys.ts` (re-exported, not duplicated)
- `isProviderConfigured` and `configuredProviderIds` from the old store

The IPC sync client becomes an internal detail — not exported, not a separate module.

#### Task 2.2 — Create `useApiKeyRepository` hook

A thin hook that returns the repository's methods + reactive state. Uses `useSyncExternalStore` or simple `useState` + `useEffect` to trigger re-renders when keys change. Much simpler than the Zustand store — no store library needed.

```ts
export function useApiKeyRepository(): ApiKeyRepository
```

This replaces both `useApiKeySettings` and the direct `useApiKeyStore` selectors.

#### Task 2.3 — Update `useApiKeySessionSync.ts`

Replace `useApiKeyStore` import with `useApiKeyRepository()`. Call `repository.hydrateFromSession()` on mount and visibility change. No other changes.

#### Task 2.4 — Update `usePromptStudioController.ts`

Replace `useApiKeySettings()` with `useApiKeyRepository()`. The returned shape is the same (`keys`, `saveKeys`, `clearProvider`, `clearAll`, `isConfigured`), so the controller's event handlers need only an import change.

#### Task 2.5 — Delete the old modules

Delete:
- `ui/store/api-key-store.ts`
- `ui/config/api-key-storage.ts`
- `ui/api/api-key-sync-client.ts`
- `ui/hooks/useApiKeySettings.ts`

#### Task 2.6 — Remove Zustand dependency (if no other store uses it)

Check if any other module imports from `zustand`. If not, remove it from `package.json`. Currently `api-key-store.ts` is the only Zustand store in the codebase.

### Verification

- [ ] `useApiKeyRepository()` returns same surface as `useApiKeySettings()` plus `configuredProviderIds()`
- [ ] `usePromptStudioController.ts` compiles with new import
- [ ] `useApiKeySessionSync.ts` triggers hydration correctly
- [ ] Setting a key persists to localStorage AND syncs to main process
- [ ] Clearing a provider removes from localStorage AND syncs to main
- [ ] `isConfigured()` returns true for both renderer-local and main-configured keys
- [ ] No import of `zustand` remains in the codebase
- [ ] Deleted files: 4 files, ~190 lines removed

### Rollback

Restore the 4 deleted files from git. Revert `useApiKeySessionSync.ts` and `usePromptStudioController.ts` imports.

---

## Candidate 3 — Consolidate the provider registry

**Strength:** Worth exploring | **Category:** in-process

### Context

Provider knowledge is scattered across 4 files:
1. `spec/providers.json` — raw data
2. `shared/domain/provider.ts` — validation, exports `PROVIDERS`, `PROVIDER_IDS`
3. `shared/domain/provider-meta.ts` — labels and key placeholders (27 lines, hardcoded switch)
4. `main/services/api-key-manager.ts` — env var mapping (lines 11-16, hardcoded record)
5. `main/utils/resolve-language-model.ts` — 99-line switch that maps providers to AI SDK adapters

Adding a new provider requires coordinated edits in at least 4 places. The `resolve-language-model.ts` switch is the deepest pain point — 99 lines of repeated pattern: get API key → create SDK client → call `.chat(model)` or `.chatModel(model)`.

### Files

| File | Role | Change type |
|------|------|-------------|
| `spec/providers.json` | Provider data | Edit — extend schema |
| `shared/domain/provider.ts` | Validation | Edit — parse extended schema |
| `shared/domain/provider-meta.ts` | Labels/placeholders | Delete (absorbed into registry) |
| `main/services/api-key-manager.ts` | Env var mapping | Edit — remove `PROVIDER_API_KEY_ENV_KEYS` (absorbed) |
| `main/utils/resolve-language-model.ts` | Model resolution | Delete or heavily simplify |

### New file

| File | Role |
|------|------|
| `shared/domain/provider-registry.ts` | Single deep module |

### Tasks

#### Task 3.1 — Extend `providers.json` schema

Add optional fields per provider:
```json
{
  "id": "gemini",
  "provider": "Google Gemini",
  "models": ["gemini-2.5-pro"],
  "sdkType": "google",
  "envKeys": ["GOOGLE_GENERATIVE_AI_API_KEY"],
  "keyPlaceholder": "AIzaSy...",
  "defaultBaseUrl": null,
  "modelNameFn": "chat"
}
```

This moves provider-specific knowledge into the data layer instead of code.

#### Task 3.2 — Update `shared/domain/provider.ts`

Parse the extended schema. The `Provider` type gains optional fields. The validation already throws on unknown structure.

#### Task 3.3 — Create `shared/domain/provider-registry.ts`

Exports:
```ts
export function getProviderMeta(providerId: ProviderId): { label: string; placeholder: string };
export function getProviderEnvKeys(providerId: ProviderId): readonly string[];
export function resolveLanguageModel(providerId: ProviderId, model: string): LanguageModelV3;
```

The model resolution absorbs the switch from `resolve-language-model.ts`. It uses the `sdkType` field from the provider spec to dispatch to the correct AI SDK factory. The `defaultBaseUrl` and `envKeys` come from the spec, not from hardcoded maps.

This module imports AI SDK factories (`@ai-sdk/google`, `@ai-sdk/openai`, etc.) — these are main-process-only dependencies. If this file must live in `shared/`, the model resolution function should be injected rather than imported directly. Alternative: keep it in `main/` and only export the metadata functions from `shared/`.

#### Task 3.4 — Update `api-key-manager.ts`

Remove `PROVIDER_API_KEY_ENV_KEYS`. Import `getProviderEnvKeys()` from the registry (or inline the lookup from the extended provider spec).

#### Task 3.5 — Delete `shared/domain/provider-meta.ts`

Its logic (label generation + placeholder switch) is absorbed into the registry's `getProviderMeta()`.

#### Task 3.6 — Delete or gut `main/utils/resolve-language-model.ts`

The switch moves into the registry. This file becomes a one-liner re-export or is deleted entirely.

#### Task 3.7 — Update all importers

Update `LLMAdapter.ts` and `PromptEvaluator.ts` to import from the new registry instead of the old `resolve-language-model.ts`. Update any UI component that imports `PROVIDER_META` to use `getProviderMeta()`.

### Verification

- [ ] Adding a new provider = one JSON entry + (optionally) a new `sdkType` handler
- [ ] `resolveLanguageModel("gemini", "gemini-2.5-pro")` returns a valid `LanguageModelV3`
- [ ] `getProviderMeta("glm")` returns `{ label: "GLM API Key", placeholder: "glm-..." }`
- [ ] `getProviderEnvKeys("deepseek")` returns `["DEEPSEEK_API_KEY"]`
- [ ] `api-key-manager.ts` no longer contains hardcoded provider-specific keys
- [ ] No switch statement on provider ID outside the registry
- [ ] Files deleted: `provider-meta.ts`, `resolve-language-model.ts`

### Rollback

Restore deleted files. Revert `providers.json`, `provider.ts`, `api-key-manager.ts`. Revert import paths in `LLMAdapter.ts` and `PromptEvaluator.ts`.

### Open question

Should the registry live in `shared/` (cross-process metadata) or `main/` (since model resolution uses AI SDK, which is main-only)? Recommended split: metadata in `shared/`, model resolution in `main/`, both behind the same conceptual interface.

---

## Candidate 5 — Remove orphaned modules and unexercised store

**Strength:** Speculative | **Category:** in-process

### Context

Three modules have no consumers or are only partially consumed:

| Module | Lines | Consumer status |
|--------|-------|----------------|
| `ui/hooks/usePromtizer.ts` | 53 | No consumer — superseded by `usePromptGeneration.ts` |
| `ui/hooks/useStreamedMarkdown.ts` | 79 | No consumer — streaming not wired |
| `main/store/prompt-sessions-store.ts` | 65 | `savePromptSession` called from `register-handlers.ts`, but `listPromptSessions` and `togglePromptSessionFavorite` have no callers. No UI reads sessions. |

Additionally, `ui/services/promtizer.ts` exports `fetchPromtizerResponse` and `PromtizerResponseValidationError`, but only `validatePromtizerResponse` is actually consumed (by `usePromptGeneration.ts:99`). The `fetchPromtizerResponse` function and `PromtizerResponseValidationError` class are only used by the dead `usePromtizer.ts`.

### Files

| File | Role | Change type |
|------|------|-------------|
| `ui/hooks/usePromtizer.ts` | Unused hook | Delete |
| `ui/hooks/useStreamedMarkdown.ts` | Unused hook | Delete |
| `main/store/prompt-sessions-store.ts` | Unexercised store | Delete — requires handling `savePromptSession` dependency |
| `ui/services/promtizer.ts` | Partially superseded | Edit — remove dead exports |

### Tasks

#### Task 5.1 — Delete `ui/hooks/usePromtizer.ts`

No imports anywhere. Safe deletion.

#### Task 5.2 — Delete `ui/hooks/useStreamedMarkdown.ts`

No imports anywhere. Safe deletion.

#### Task 5.3 — Handle `prompt-sessions-store.ts` dependency

`savePromptSession` is imported by `register-handlers.ts:31` and passed to `generateRefinedPrompt` as a dependency. Two options:

**Option A — Delete the store, stop saving sessions.**
Remove the `savePromptSession` import from `register-handlers.ts`. Remove it from the `generateRefinedPrompt` dependencies object. Sessions will no longer be persisted. The domain types in `shared/domain/prompt-session.ts` survive for future use.

**Option B — Keep the store but acknowledge it's latent.**
If session history is planned soon, keep the store but add a comment explaining it's wired but unexercised by UI. Add an ADR recording the decision.

#### Task 5.4 — Clean up `ui/services/promtizer.ts`

Remove `fetchPromtizerResponse`, `PromtizerResponseValidationError`, `PromtizerRequest`, `GeneratePromtizerResponse`, `parseJsonResponse`, and `normalizeRequest`. Keep only `validatePromtizerResponse` and the `PromtizerResponse` type import.

Update `usePromptGeneration.ts` if needed — it only imports `validatePromtizerResponse`, so no change required.

### Verification

- [ ] No import of `usePromtizer` or `useStreamedMarkdown` anywhere
- [ ] `register-handlers.ts` compiles (if Option A: no `savePromptSession` import)
- [ ] `usePromptGeneration.ts` still imports `validatePromtizerResponse` successfully
- [ ] App starts and generates prompts normally
- [ ] `~200 lines` of dead code removed

### Rollback

Restore all deleted files from git. Revert `promtizer.ts` edits.

---

## Execution order recommendation

1. **Candidate 5 first** — zero risk, pure deletion, clears noise before deeper work.
2. **Candidate 1 next** — opens the main-process seam, unblocks testing for all subsequent main-process refactors.
3. **Candidate 4** — straightforward dedup, independent of the other candidates.
4. **Candidate 2** — largest change, benefits from having Candidate 1 done first (tests for the IPC layer).
5. **Candidate 3 last** — touches the most files, benefits from Candidates 1 and 2 being stable first.
