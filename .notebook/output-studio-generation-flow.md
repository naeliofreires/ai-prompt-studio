# Output Studio Generation Flow
> Renderer output calls Electron IPC; main process owns provider API access

Entry: `apps/promptizer/ui/app/usePromptStudioController.ts` delegates generation state to `apps/promptizer/ui/hooks/usePromptGeneration.ts`
Flow: renderer → `promptStudioClient.generatePrompt()` → `window.aiPromptStudio.generatePrompt()` → `apps/promptizer/main/preload.ts` → `apps/promptizer/main/ipc/register-handlers.ts` → `apps/promptizer/main/application/generate-refined-prompt.ts` → `apps/promptizer/main/services/LLMAdapter.ts` → optional `apps/promptizer/main/services/PromptEvaluator.ts` → optional snapshot save in `apps/promptizer/main/store/prompt-sessions-store.ts`

Renderer:
- Sends `rawInput`, `personaId`, `providerId`, `model`
- Displays `GeneratePromptIpcResult.prompt`
- Maps top-level `tokensUsed` from IPC into renderer `GenerationUsage` (`usage`), not evaluation
- Maps optional `GeneratePromptIpcResult.evaluation` into renderer `GenerationEvaluation`
- Shows token usage and optional prompt score/feedback separately in `OutputPanel`

Main:
- `registerIpcHandlers()` validates with `generatePromptPayloadSchema`
- `generateRefinedPrompt()` resolves persona context from `PERSONAS`
- `LLMAdapter.generatePrompt()` calls Vercel AI SDK `generateText`
- `PromptEvaluator.evaluate()` reuses the selected provider/model, asks for JSON, validates `score`, `summary`, and `suggestions`, and returns `null` when evaluation fails
- Evaluation failure is best-effort: prompt generation can still return `ok: true` without `evaluation`
- Successful generations are saved best-effort as `PromptSession` snapshots with raw input, persona, provider/model, output, optional usage/evaluation, `favorite`, and `createdAt`; no history/favorites UI consumes this yet
- API keys resolve in main-process code: runtime keys from Settings take priority, then environment variables loaded from `.env` in dev mode.

Contract: `apps/promptizer/shared/contracts/ipc.ts`

Updated: 2026-06-09
