# Output Studio Generation Flow

> Renderer generation crosses the namespaced Electron bridge; desktop code owns provider access.

Entry: `src/features/prompt-studio/ui/usePromptStudioViewModel.ts` delegates generation state to `src/features/prompt-generation/ui/hooks/usePromptGeneration.ts`.

Flow: renderer → `promptStudioClient.generatePrompt()` → `window.aiPromptStudio.promptGeneration.generatePrompt()` → `src/platform/electron/preload.ts` → `src/platform/electron/register-handlers.ts` → `src/features/prompt-generation/desktop/register-prompt-generation-handlers.ts` → `generateRefinedPrompt()` → `LLMAdapter()`.

- The renderer sends `rawInput`, `providerId`, `model`, and optional attachments.
- The result contains either an error message or the generated prompt, optional token usage, and optional evaluation.
- Prompt-generation IPC validates its payload before generation.
- `LLMAdapter` calls the Vercel AI SDK; evaluation is best-effort and does not make a successful generation fail.
- API keys come from the Settings runtime store first, then development environment variables in the Electron main process.
- Prompt sessions are **not registered or persisted in the current desktop handler**. The optional session-save dependency exists in the use case but is not supplied by `registerPromptGenerationHandlers`.

Provider options come from `src/spec/providers.json`. OpenCode Zen uses `OPENCODE_API_KEY` and optional `OPENCODE_ZEN_BASE_URL`; `OPENCODE_BASE_URL` remains a legacy compatibility alias. Its default is `https://opencode.ai/zen/v1`.

Updated: 2026-07-12
