# Persona Roles Flow

Tags: renderer, shared, ipc, personas

## Summary

Promptizer has a canonical built-in persona registry in `apps/promptizer/spec/personas.json`, validated by `apps/promptizer/shared/domain/persona.ts`, plus custom personas stored by the main process.

## Pointers

- `apps/promptizer/shared/domain/persona.ts`: imports and validates `apps/promptizer/spec/personas.json`, then exports `PERSONAS` and `PERSONA_IDS`.
- `apps/promptizer/shared/contracts/ipc.ts`: accepts built-in persona IDs and UUID custom persona IDs.
- `apps/promptizer/main/ipc/register-handlers.ts`: validates persona IPC payloads and delegates prompt generation to the application layer.
- `apps/promptizer/main/utils/resolve-persona-context.ts`: resolves built-in personas from `PERSONAS` first, then custom personas from `custom-personas-store`.
- `apps/promptizer/ui/hooks/useRoles.ts`: maps `PERSONAS` into the renderer role tab shape and appends custom personas returned by `personaClient`.

## Gotcha

Renderer fallback custom personas are only for browser-mode/dev rendering when the Electron bridge is absent. In the desktop app, custom personas should round-trip through IPC so prompt generation and role tabs read from the same main-process store.
