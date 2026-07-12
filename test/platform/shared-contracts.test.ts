import { describe, expect, it } from "vitest";
import {
  generatePromptIpcResultSchema,
  generatePromptPayloadSchema,
} from "../../src/features/prompt-generation/contract/ipc";
import { promptEvaluationSchema } from "../../src/features/prompt-generation/contract/prompt-evaluation";
import { promptSessionSchema } from "../../src/features/prompt-generation/contract/prompt-session";
import { listConfiguredApiKeysResultSchema } from "../../src/features/providers/contract/ipc";

describe("shared IPC contracts", () => {
  const input = { rawInput: "Refine this idea", providerId: "gemini", model: "gemini-2.5-pro" };

  it("accepts a valid generation payload", () => {
    expect(generatePromptPayloadSchema.parse(input)).toEqual(input);
  });

  it("validates prompt attachments", () => {
    const markdown = {
      name: "notes.md",
      mimeType: "text/markdown",
      sizeBytes: 52,
      content: "# Notes",
    };
    expect(
      generatePromptPayloadSchema.parse({
        ...input,
        attachments: Array.from({ length: 5 }, () => markdown),
      }).attachments,
    ).toHaveLength(5);
    expect(() =>
      generatePromptPayloadSchema.parse({
        ...input,
        attachments: Array.from({ length: 6 }, () => markdown),
      }),
    ).toThrow();
    expect(() =>
      generatePromptPayloadSchema.parse({
        ...input,
        attachments: [{ ...markdown, name: "notes.txt" }],
      }),
    ).toThrow();
    expect(() =>
      generatePromptPayloadSchema.parse({
        ...input,
        attachments: [{ name: "diagram.png", mimeType: "image/png", sizeBytes: 1, content: "png" }],
      }),
    ).toThrow();
    expect(() =>
      generatePromptPayloadSchema.parse({
        ...input,
        attachments: [
          { name: "large.txt", mimeType: "text/plain", sizeBytes: 1024 * 1024 + 1, content: "x" },
        ],
      }),
    ).toThrow();
  });

  it("rejects invalid generation input", () => {
    expect(() => generatePromptPayloadSchema.parse({ ...input, rawInput: "   " })).toThrow();
    expect(() =>
      generatePromptPayloadSchema.parse({ ...input, providerId: "not-a-provider" }),
    ).toThrow();
  });

  it("reads legacy sessions while ignoring deprecated fields", () => {
    const session = promptSessionSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      rawInput: input.rawInput,
      deprecatedSelection: "frontend",
      providerId: input.providerId,
      model: input.model,
      generatedPrompt: "Refined text",
      usage: { tokensUsed: 42 },
      evaluation: { score: 4, summary: "Clear prompt.", suggestions: ["Add constraints."] },
      favorite: false,
      createdAt: "2026-06-09T12:00:00.000Z",
    });

    expect(session.usage).toEqual({ tokensUsed: 42 });
  });

  it("validates session evaluation snapshots", () => {
    expect(() =>
      promptEvaluationSchema.parse({
        score: 6,
        summary: "Too high.",
        suggestions: ["Use a valid score."],
      }),
    ).toThrow();
    expect(() =>
      promptSessionSchema.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        rawInput: input.rawInput,
        providerId: input.providerId,
        model: input.model,
        generatedPrompt: "Refined text",
        evaluation: { score: 6, summary: "Invalid score.", suggestions: ["Use a valid score."] },
        favorite: false,
        createdAt: "2026-06-09T12:00:00.000Z",
      }),
    ).toThrow();
  });

  it("parses generation success and failure results", () => {
    expect(
      generatePromptIpcResultSchema.parse({
        ok: true,
        prompt: "Refined text",
        tokensUsed: 42,
        evaluation: { score: 4, summary: "Clear prompt.", suggestions: [] },
      }),
    ).toMatchObject({ ok: true, tokensUsed: 42 });
    expect(generatePromptIpcResultSchema.parse({ ok: false, message: "API key missing" })).toEqual({
      ok: false,
      message: "API key missing",
    });
    expect(() =>
      generatePromptIpcResultSchema.parse({ ok: true, message: "wrong shape" }),
    ).toThrow();
  });

  it("parses configured API key provider statuses without secrets", () => {
    expect(listConfiguredApiKeysResultSchema.parse({ providerIds: ["gemini", "glm"] })).toEqual({
      providerIds: ["gemini", "glm"],
    });
  });
});
