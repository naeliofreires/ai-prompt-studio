# Promptizer Modular Boundaries

Tags: architecture, modularity, boundaries, promptizer

## Summary

Promptizer should remain one bounded context for now. The current pressure is better handled with explicit sub-unit ownership and a smaller shared public surface than with new packages or process boundaries.

## Outer Boundary

- `src/features/<feature>/ui`: renderer presentation, hooks, and feature clients.
- `src/features/<feature>/desktop`: Electron handlers, use cases, provider integration, credential sync, and local persistence.
- `src/features/<feature>/contract`: stable feature schemas, types, and IPC channel definitions.
- `src/platform/electron`: Electron host, handler composition, logging, and the single preload implementation.
- `src/platform/renderer`: renderer bootstrap, the namespaced bridge client, browser storage, and shared renderer shell components.
- `src/shared/lib`: small runtime-neutral helpers; `src/spec`: declarative Provider and Seed Persona data.
- `src/main/index.ts`, `src/main/preload.ts`, and `src/renderer/main.tsx` are entry-point shims to the platform composition roots.

## Implemented Feature Slices

- Personas: `features/personas/ui`, `features/personas/desktop`, and `features/personas/contract` isolate screens and clients from custom Persona persistence and IPC.
- Providers: `features/providers/ui`, `features/providers/desktop`, and `features/providers/contract` isolate Settings from API-key runtime management and Provider resolution.
- Prompt generation: `features/prompt-generation/ui`, `features/prompt-generation/desktop`, and `features/prompt-generation/contract` isolate generation panels from LLM adapters and generation IPC.
- Prompt Studio: `features/prompt-studio/ui` composes the renderer-facing feature slices.

## Boundary Rules

- UI never imports a feature `desktop` module; desktop code never imports a feature `ui` module.
- Contracts never import `ui`, `desktop`, or `platform`. They can be consumed by both runtimes.
- Renderer code reaches Electron only through the single `window.aiPromptStudio` bridge, namespaced by capability.
- Main-process stores own persistence details. Renderer code uses IPC clients or browser-mode fallback repositories, not desktop stores.
- Keep `shared/lib` runtime-neutral; do not move Electron APIs, Provider SDK integration, persistence, or UI helpers there.
- Logs should identify operations and routing metadata without printing raw prompts, system prompts, API keys, or Persona text.
- Before splitting a sub-unit into a package, look for real pressure: different language, change cadence, SLO, ownership, consistency boundary, or repeated integration pain.

Updated: 2026-07-12
