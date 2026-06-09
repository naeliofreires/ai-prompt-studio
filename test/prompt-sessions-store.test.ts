import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  listPromptSessions,
  savePromptSession,
  togglePromptSessionFavorite,
} from "../src/main/store/prompt-sessions-store";

const mocks = vi.hoisted(() => ({
  randomUUID: vi.fn(() => "550e8400-e29b-41d4-a716-446655440000"),
  values: new Map<string, unknown>(),
}));

vi.mock("node:crypto", () => ({
  default: {
    randomUUID: mocks.randomUUID,
  },
  randomUUID: mocks.randomUUID,
}));

vi.mock("electron-store", () => ({
  default: class MockStore {
    constructor() {
      if (!mocks.values.has("promptSessions")) {
        mocks.values.set("promptSessions", []);
      }
    }

    get(key: string): unknown {
      return mocks.values.get(key);
    }

    set(key: string, value: unknown): void {
      mocks.values.set(key, value);
    }
  },
}));

describe("prompt-sessions-store", () => {
  beforeEach(() => {
    mocks.values.clear();
    mocks.values.set("promptSessions", []);
    mocks.randomUUID.mockReturnValue("550e8400-e29b-41d4-a716-446655440000");
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
