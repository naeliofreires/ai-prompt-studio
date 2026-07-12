# Persona Roles Flow

Tags: renderer, IPC, personas

Custom Personas are represented by `src/features/personas/contract/custom-persona.ts` and loaded by `src/features/personas/ui/useRoles.ts` through `personaClient`.

- `src/features/personas/contract/ipc.ts` defines Custom Persona IPC payloads and results.
- `src/features/personas/ui/persona-client.ts` uses `window.aiPromptStudio.personas` when all Persona bridge methods are available.
- `src/platform/electron/preload.ts` exposes `personas.listCustomPersonas`, `createCustomPersona`, `updateCustomPersona`, and `deleteCustomPersona`.
- `src/features/personas/desktop/register-persona-handlers.ts` registers the desktop handlers, and `resolve-persona-context.ts` resolves a Custom Persona for generation.
- Without the Electron prompt bridge, the renderer uses browser storage and creates Seed Personas once. If the prompt bridge exists but the Persona bridge is incomplete, the client is unavailable rather than falling back to browser storage.

Updated: 2026-07-12
