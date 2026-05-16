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
- API keys resolve in main-process code: runtime keys from Settings take priority, then environment variables loaded from `.env` in dev mode.

Contract: `src/shared/contracts/ipc.ts`

Updated: 2026-05-16
