# Promptizer Modular Boundaries

Tags: architecture, modularity, boundaries, promptizer

## Summary

Promptizer should remain one bounded context for now. The current pressure is better handled with explicit sub-unit ownership and a smaller shared public surface than with new packages or process boundaries.

## Outer Boundary

- `src/renderer`: renderer presentation, controller hooks, UI state, and renderer clients.
- `src/main`: Electron IPC handlers, application use cases, provider integration, credential sync, and local persistence.
- `src/shared`: stable renderer/main contracts, public catalogs, and narrow shared kernel types.
- `src/renderer/main.tsx`: renderer composition root; it mounts `PromptizerApp` directly.

## Sub-Units

- Prompt Studio UI: `PromptizerApp`, `usePromptStudioController`, `PromptStudioScreen`, and controlled panels.
- Persona Management: built-in persona catalog, custom persona IPC, custom persona store, and persona context resolution.
- Prompt Refinement: `generateRefinedPrompt`, LLM adapter, refinement system prompt builder, and optional evaluator.
- Credential and Provider Config: provider catalog, API key storage/sync, and main-process runtime/env key lookup.
- Prompt Sessions: local snapshots, usage, evaluation, and favorite state. No UI consumes this yet.

## Boundary Rules

- Keep `src/shared/index.ts` intentionally small: IPC contracts, public catalogs, provider metadata, prompt evaluation, and API key helpers only.
- Do not export persistence schemas, stores, adapter contracts, or implementation services from the shared barrel.
- Main-process stores own their persistence details. Renderer code should use IPC clients or browser-mode fallback repositories, not main stores.
- Logs should identify operations and routing metadata without printing raw prompts, system prompts, API keys, or persona text.
- Before splitting a sub-unit into a package, look for real pressure: different language, change cadence, SLO, ownership, consistency boundary, or repeated integration pain.

Updated: 2026-06-10
