# Output Studio Generation Flow
> Renderer output calls Electron IPC; main process owns provider API access

Entry: `src/renderer/app/App.tsx:handleGenerate()` (L55)
Flow: renderer → `window.aiPromptStudio.generatePrompt()` → `src/main/preload.ts` → `src/main/ipc/register-handlers.ts` → `src/main/services/LLMAdapter.ts`

Renderer:
- Sends `rawInput`, `personaId`, `providerId`, `model`
- Displays `GeneratePromptIpcResult.prompt`
- Shows `tokensUsed` when adapter returns it

Main:
- `registerIpcHandlers()` validates with `generatePromptPayloadSchema`
- Resolves persona context from `PERSONAS`
- `LLMAdapter.generatePrompt()` calls Vercel AI SDK `generateText`

Contract: `src/shared/contracts/ipc.ts`

Updated: 2026-05-12
