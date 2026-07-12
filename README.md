# Promptizer

Promptizer is a local Electron app for turning rough ideas into structured, paste-ready LLM prompts. It lets you choose a provider/model, enter API keys, refine an idea, and copy the result.

The app is local-first and currently packaged for unsigned local releases.

## Features

- Electron desktop shell with a React + TypeScript renderer.
- Provider/model selection from `src/spec/providers.json`.
- Provider adapters for Google Gemini, GLM, DeepSeek, and OpenCode Zen through the Vercel AI SDK.
- API key Settings UI with development `.env` fallback in the Electron main process.
- Prompt refinement through a validated IPC bridge.
- Structured output rendering, copy feedback, token usage, and prompt evaluation when available.
- Vitest coverage for core UI, IPC, provider, and generation flows.

## Stack

- **Desktop:** Electron
- **Renderer:** React 19, TypeScript, Vite
- **LLM access:** Vercel AI SDK
- **Validation:** Zod
- **Storage:** `localStorage` for renderer API keys
- **Tests:** Vitest, React Testing Library, jsdom
- **Styling:** CSS Modules and SCSS modules

## Project Layout

```text
src/
  features/
    <feature>/ui/        Renderer components, hooks, and feature clients
    <feature>/desktop/   Electron handlers, use cases, stores, and integrations
    <feature>/contract/  Zod schemas, types, and IPC contracts
  platform/electron/     Electron host, handler composition, preload, and logging
  platform/renderer/     Renderer bootstrap, bridge access, storage, and shared UI shell
  shared/lib/            Runtime-neutral helpers
  spec/                  Provider/model options
  main/, renderer/       Compatibility entry-point shims to platform roots
test/         Vitest test suite
docs/         Product and technical planning docs
scripts/      Build helper scripts
```

## Prerequisites

- Node.js and npm.
- At least one API key for generation.

Supported providers:

| Provider      | Models                                                  | API key                          |
| ------------- | ------------------------------------------------------- | -------------------------------- |
| Google Gemini | `gemini-2.5-pro`                                        | `GOOGLE_GENERATIVE_AI_API_KEY`   |
| GLM           | `glm-4.6`, `glm-4.7`, `glm-5`                           | `GLM_API_KEY` or `ZHIPU_API_KEY` |
| DeepSeek      | `deepseek-reasoner`                                     | `DEEPSEEK_API_KEY`               |
| OpenCode Zen  | `big-pickle`, `minimax-m3-free`, `north-mini-code-free` | `OPENCODE_API_KEY`               |

You can enter keys in Settings at runtime or set them in `.env` for local development.

## Getting Started

```bash
npm install
cp .env.example .env # optional
npm run dev
```

`npm run dev` starts Vite, watches the Electron main-process TypeScript build, waits for both, and launches Electron.

## Scripts

```bash
npm run dev            # Start Vite, Electron main watch, and Electron
npm run build          # Build renderer and Electron main process
npm run dist           # Build and package for the current platform
npm run dist:mac       # Build a macOS DMG
npm run dist:win       # Build a Windows NSIS installer
npm run dist:linux     # Build a Linux AppImage
npm run preview        # Preview the renderer build only
npm run lint           # Run ESLint
npm run test           # Run Vitest once
npm run test:watch     # Run Vitest in watch mode
npm run format         # Format source files with Prettier
npm run format:check   # Check Prettier formatting
```

`npm run preview` serves only the renderer build. Use `npm run dev` for prompt generation because it requires the Electron preload bridge.

## Packaging

```bash
npm run dist:mac
```

Packages are written to `release/`. Windows and Linux installers can be built with `npm run dist:win` and `npm run dist:linux`, preferably on their target OS or in CI.

The macOS build is ad-hoc signed for local use. Public distribution still needs a signing identity, notarization, and a release pipeline.

## Configuration

`src/platform/electron/main.ts` owns the Electron shell and loads `.env` only when Electron is not packaged. `src/main/index.ts` is its package entry-point shim. Runtime keys entered in Settings are synced from the renderer to the Electron main process through the preload bridge and IPC.

The single preload implementation is `src/platform/electron/preload.ts` (reached by `src/main/preload.ts`). It exposes the namespaced `window.aiPromptStudio` bridge; renderer feature clients access it through `src/platform/renderer/api/electron-bridge.ts`.

Supported environment variables:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=
GLM_API_KEY=
ZHIPU_API_KEY=
GLM_BASE_URL=
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=
OPENCODE_API_KEY=
OPENCODE_ZEN_BASE_URL=
# Legacy compatibility alias: OPENCODE_BASE_URL=
```

Default base URLs:

- GLM: `https://api.z.ai/api/paas/v4/`
- DeepSeek: `https://api.deepseek.com/v1`
- OpenCode Zen: `https://opencode.ai/zen/v1`

API keys saved in Settings are stored in renderer `localStorage` and mirrored into main-process memory. This is acceptable for a local BYOK tool; production distribution should use native secure storage or a server-side proxy.

## How Generation Works

1. `features/prompt-studio/ui` validates the selected Provider/model, API key, and raw input.
2. `features/prompt-generation/ui/api/prompt-studio-client.ts` sends the request through the namespaced preload bridge.
3. `platform/electron/register-handlers.ts` composes the feature handlers; `features/prompt-generation/desktop/register-prompt-generation-handlers.ts` validates the IPC payload.
4. `features/prompt-generation/desktop/LLMAdapter.ts` builds the refinement system prompt and calls `generateText`.
5. The renderer displays the structured response, usage, and evaluation data when available.

The refinement instruction and its exact JSON response schema live in `src/features/prompt-generation/desktop/prompt-instructions.ts`; `docs/prompt-instructions.md` is its human-readable counterpart.

## Extending Promptizer

### Add a provider

1. Add the provider to `src/spec/providers.json`.
2. Ensure `src/features/providers/desktop/provider-registry.ts` supports its `sdkType`.
3. Document the environment variable in `.env.example`.
4. Add focused tests for provider resolution and request behavior.

Feature contracts live under `src/features/<feature>/contract`; update the relevant contract first when behavior crosses the process boundary. Keep them independent of UI, desktop, and platform code.

## Documentation

- `docs/prd-ai-prompt-studio.md` describes the original product direction.
- `docs/tech-spec-ai-prompt-studio.md` describes the planned architecture.
- `.notebook/` contains implementation notes about current flows and boundaries.

When docs disagree with source code, treat source code as current behavior and update the relevant document in the same change.
