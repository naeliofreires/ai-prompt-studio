# Promptizer

Promptizer is the working repository for **AI Prompt Studio**, a local Electron desktop app that turns rough ideas into paste-ready LLM prompts. The app lets you choose a persona, pick a provider/model, enter an API key, refine an idea, and copy the generated prompt.

The current implementation is a local-first desktop app with Electron packaging scripts for unsigned local releases.

## Current Features

- Electron desktop shell with a React + TypeScript renderer.
- Built-in personas for frontend, backend, UI/UX, and general prompting.
- Custom persona creation and deletion.
- Provider/model selection from `spec/providers.json`.
- Provider adapters for Google Gemini, GLM, and DeepSeek through the Vercel AI SDK.
- API key settings UI, with environment-variable fallback in the Electron main process.
- Prompt refinement through a validated IPC contract.
- Markdown output rendering, copy-to-clipboard feedback, and token usage display when the provider returns it.
- Vitest coverage for adapter behavior, IPC/shared contracts, API key storage, persona client behavior, and streaming markdown helpers.

Planned but not implemented yet: 0-5 AI scoring, qualitative prompt feedback, history, favorites, signed releases, notarization, and auto-update.

## Stack

- **Desktop:** Electron
- **Renderer:** React 19, TypeScript, Vite
- **State:** Zustand and React hooks
- **LLM access:** Vercel AI SDK with Google and OpenAI-compatible providers
- **Validation:** Zod
- **Storage:** `electron-store` for desktop custom personas, `localStorage` for renderer-held API keys and browser-mode persona fallback
- **Tests:** Vitest, React Testing Library, jsdom
- **Styling:** CSS Modules and SCSS modules

## Project Layout

```text
src/
  main/       Electron main process, IPC handlers, provider resolution, stores
  ui/         React app, panels, modals, hooks, renderer clients
  shared/     Domain types, Zod schemas, IPC contracts, provider/persona registries
spec/         JSON source for built-in personas and provider/model options
test/         Vitest test suite
docs/         Product and technical planning docs
scripts/      Build helper scripts
```

## Prerequisites

- A recent Node.js/npm installation.
- At least one API key for a supported provider if you want to generate prompts.

The app supports these providers:

| Provider      | Models                               | API key                          |
| ------------- | ------------------------------------ | -------------------------------- |
| Google Gemini | `gemini-2.5-pro`                     | `GOOGLE_GENERATIVE_AI_API_KEY`   |
| GLM           | `glm-4.6`, `glm-4.7`, `glm-5`        | `GLM_API_KEY` or `ZHIPU_API_KEY` |
| DeepSeek      | `deepseek-chat`, `deepseek-reasoner` | `DEEPSEEK_API_KEY`               |

You can enter keys in the Settings modal at runtime, or set them in `.env` for local development.

## Getting Started

Install dependencies:

```bash
npm install
```

Optional: copy the example environment file and fill in provider keys:

```bash
cp .env.example .env
```

Run the desktop app in development mode:

```bash
npm run dev
```

This starts the Vite renderer on port `5173`, watches the Electron main-process TypeScript build, waits for both pieces, and then launches Electron.

## Useful Scripts

```bash
npm run dev            # Start Vite, Electron main watch, and Electron
npm run build          # Build renderer and Electron main process
npm run build:ui       # Build only the Vite renderer
npm run build:main     # Compile Electron main process and copy spec JSON files
npm run dist           # Build the app and package for the current platform
npm run dist:mac       # Build a macOS DMG
npm run dist:win       # Build a Windows NSIS installer
npm run dist:linux     # Build a Linux AppImage
npm run preview        # Preview the renderer build only
npm run lint           # Run ESLint over src
npm run test           # Run the Vitest suite once
npm run test:watch     # Run Vitest in watch mode
npm run format         # Format source files with Prettier
npm run format:check   # Check Prettier formatting
```

`npm run preview` serves only the renderer build. Prompt generation requires the Electron preload bridge, so use `npm run dev` for the full app.

## Packaging

Generate a local macOS installer:

```bash
npm run dist:mac
```

The DMG is written to `release/`. Windows and Linux installers can be generated with `npm run dist:win` and `npm run dist:linux`, preferably on their target operating systems or in CI.

The generated macOS app is ad-hoc signed for local use. Public distribution still needs a developer signing identity, notarization, and release pipeline.

## Configuration

`src/main/index.ts` loads `.env` only when Electron is not packaged. Runtime keys entered in Settings are synchronized from the renderer to the Electron main process through IPC.

Supported environment variables:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=
GLM_API_KEY=
ZHIPU_API_KEY=
GLM_BASE_URL=
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=
```

Defaults:

- GLM uses `https://api.z.ai/api/paas/v4/` unless `GLM_BASE_URL` is set.
- DeepSeek uses `https://api.deepseek.com/v1` unless `DEEPSEEK_BASE_URL` is set.

Security note: API keys entered in Settings are stored in renderer `localStorage` and mirrored into main-process memory for local use. This is appropriate for a local BYOK development tool, but a production deployment should move provider credentials behind a server-side proxy or native secure storage.

## How Prompt Generation Works

1. The user selects a persona and provider/model in the renderer.
2. `usePromptGeneration` validates basic UI state and sends the request through `promptStudioClient`.
3. The preload bridge exposes `window.aiPromptStudio.generatePrompt`.
4. `src/main/ipc/register-handlers.ts` validates the payload with Zod and resolves the selected persona.
5. `src/main/services/LLMAdapter.ts` builds the refinement system prompt and calls `generateText`.
6. The renderer displays the returned prompt and token usage when available.

The system instruction used for refinement lives in `src/main/services/prompt-instructions.ts`; the human-facing copy is mirrored in `docs/prompt-instructions.md`.

## Extending the App

To add a built-in persona:

1. Add an entry to `spec/personas.json`.
2. Keep `id`, `label`, and `role` non-empty and unique.
3. Add or adjust tests if the change affects persona behavior.

To add a provider:

1. Add the provider and model list to `spec/providers.json`.
2. Add provider resolution logic in `src/main/utils/resolve-language-model.ts`.
3. Add provider key metadata in `src/shared/domain/provider-meta.ts`.
4. Document the environment variable in `.env.example`.
5. Cover the provider contract with focused tests.

Shared contracts live under `src/shared`; update them first when renderer and main-process behavior need to change together.

## Documentation

- `docs/prd-ai-prompt-studio.md` describes the original product direction.
- `docs/tech-spec-ai-prompt-studio.md` describes the planned architecture.
- `.notebook/` contains implementation notes about current flows and boundaries.

When these docs disagree with the source, treat the source as the current behavior and update the relevant document as part of the change.
