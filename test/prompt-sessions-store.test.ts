import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  listPromptSessions,
  savePromptSession,
  togglePromptSessionFavorite,
} from "../apps/promptizer/main/store/prompt-sessions-store";
import { resetElectronStoreMocks } from "./helpers/electron-store";

vi.mock("node:crypto", async () => {
  const { mockNodeCrypto } = await import("./helpers/electron-store");
  return mockNodeCrypto();
});

vi.mock("electron-store", async () => {
  const { mockElectronStore } = await import("./helpers/electron-store");
  return mockElectronStore("promptSessions");
});

describe("prompt-sessions-store", () => {
  beforeEach(() => {
    resetElectronStoreMocks("promptSessions");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-09T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("AC14 saves, lists, and toggles prompt session favorites without losing data", () => {
    const saved = savePromptSession({
      rawInput: "Refine this idea",
      personaId: "frontend",
      providerId: "gemini",
      model: "gemini-2.5-pro",
      generatedPrompt: "Refined text",
      usage: {
        tokensUsed: 42,
      },
      evaluation: {
        score: 4,
        summary: "Clear prompt with a focused role.",
        suggestions: ["Add output constraints."],
      },
    });

    expect(saved).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
      rawInput: "Refine this idea",
      personaId: "frontend",
      providerId: "gemini",
      model: "gemini-2.5-pro",
      generatedPrompt: "Refined text",
      usage: {
        tokensUsed: 42,
      },
      evaluation: {
        score: 4,
        summary: "Clear prompt with a focused role.",
        suggestions: ["Add output constraints."],
      },
      favorite: false,
      createdAt: "2026-06-09T12:00:00.000Z",
    });
    expect(listPromptSessions()).toEqual([saved]);

    const favorited = togglePromptSessionFavorite(saved.id);

    expect(favorited).toEqual({ ...saved, favorite: true });
    expect(listPromptSessions()).toEqual([{ ...saved, favorite: true }]);
  });

  it("AC14 returns null for unknown prompt sessions without mutating existing sessions", () => {
    const saved = savePromptSession({
      rawInput: "Refine this idea",
      personaId: "frontend",
      providerId: "gemini",
      model: "gemini-2.5-pro",
      generatedPrompt: "Refined text",
    });

    expect(togglePromptSessionFavorite("550e8400-e29b-41d4-a716-446655440099")).toBeNull();
    expect(listPromptSessions()).toEqual([saved]);
  });
});
