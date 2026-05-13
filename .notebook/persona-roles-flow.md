# Persona Roles Flow

Tags: renderer, shared, ipc, personas

## Summary

The app has one canonical fixed persona registry in `spec/personas.json`, validated by `src/shared/domain/persona.ts`.

## Pointers

- `src/shared/domain/persona.ts`: imports and validates `spec/personas.json`, then exports `PERSONAS` and `PERSONA_IDS`.
- `src/shared/contracts/ipc.ts`: validates `personaId` against `PERSONA_IDS`.
- `src/main/ipc/register-handlers.ts`: resolves the selected persona from `PERSONAS` and builds the LLM persona context.
- `src/renderer/app/App.tsx`: maps `PERSONAS` into the renderer role tab shape.

## Gotcha

Locally-created renderer roles with generated IDs are not valid personas for prompt generation unless the IPC contract and main-process persona lookup are extended to accept custom persona definitions.
