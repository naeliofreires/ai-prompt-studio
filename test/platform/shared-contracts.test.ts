import { describe, expect, it } from "vitest";
import {
  generatePromptIpcResultSchema,
  generatePromptPayloadSchema,
} from "../../src/features/prompt-generation/contract/ipc";
import { promptEvaluationSchema } from "../../src/features/prompt-generation/contract/prompt-evaluation";
import { promptSessionSchema } from "../../src/features/prompt-generation/contract/prompt-session";
import { listConfiguredApiKeysResultSchema } from "../../src/features/providers/contract/ipc";

describe("shared IPC contracts", () => {
  it("accepts a valid generate prompt payload", () => {
    const result = generatePromptPayloadSchema.parse({
      rawInput: "Refine this idea",
      personaId: "frontend",
      providerId: "gemini",
      model: "gemini-2.5-pro",
    });

    expect(result.personaId).toBe("frontend");
  });

  it('1. accepts a markdown attachment in a generate prompt payload ', () => {
    const attachments = [
      {
        name: "notes.md",
        mimeType: "text/markdown",
        sizeBytes: 52,
        content: "# Notes\n\nUse a calmer tone and keep the structure.",
      },
    ];

    const result = generatePromptPayloadSchema.parse({
      rawInput: "Refine this idea",
      personaId: "frontend",
      providerId: "gemini",
      model: "gemini-2.5-pro",
      attachments,
    });

    expect(result).toMatchObject({ attachments });
  });

  it('2. accepts exactly five markdown attachments in a generate prompt payload ', () => {
    const attachments = Array.from({ length: 5 }, (_, index) => ({
      name: `notes-${index + 1}.md`,
      mimeType: "text/markdown",
      sizeBytes: 52,
      content: `# Notes ${index + 1}\n\nUse this markdown as context.`,
    }));

    const result = generatePromptPayloadSchema.parse({
      rawInput: "Refine this idea",
      personaId: "frontend",
      providerId: "gemini",
      model: "gemini-2.5-pro",
      attachments,
    });

    expect(result.attachments).toHaveLength(5);
    expect(result.attachments).toEqual(attachments);
  });

  it('3. rejects more than five markdown attachments in a generate prompt payload ', () => {
    const attachments = Array.from({ length: 6 }, (_, index) => ({
      name: `notes-${index + 1}.md`,
      mimeType: "text/markdown",
      sizeBytes: 52,
      content: `# Notes ${index + 1}\n\nUse this markdown as context.`,
    }));

    expect(() =>
      generatePromptPayloadSchema.parse({
        rawInput: "Refine this idea",
        personaId: "frontend",
        providerId: "gemini",
        model: "gemini-2.5-pro",
        attachments,
      }),
    ).toThrow();
  });

  it('4. rejects non-markdown prompt attachments ', () => {
    const attachments = [
      {
        name: "notes.txt",
        mimeType: "text/markdown",
        sizeBytes: 52,
        content: "# Notes\n\nThis should require a markdown filename.",
      },
    ];

    expect(() =>
      generatePromptPayloadSchema.parse({
        rawInput: "Refine this idea",
        personaId: "frontend",
        providerId: "gemini",
        model: "gemini-2.5-pro",
        attachments,
      }),
    ).toThrow();
  });

  it('5. accepts markdown files with text/markdown mime type ', () => {
    const attachments = [
      {
        name: "guide.md",
        mimeType: "text/markdown",
        sizeBytes: 52,
        content: "# Guide\n\nUse this markdown file as context.",
      },
    ];

    const result = generatePromptPayloadSchema.parse({
      rawInput: "Refine this idea",
      personaId: "frontend",
      providerId: "gemini",
      model: "gemini-2.5-pro",
      attachments,
    });

    expect(result).toMatchObject({ attachments });
  });

  it('6. accepts markdown files with an empty mime type when the filename ends with .md ', () => {
    const attachments = [
      {
        name: "notes.md",
        mimeType: "",
        sizeBytes: 52,
        content: "# Notes\n\nUse this markdown file as context.",
      },
    ];

    const result = generatePromptPayloadSchema.parse({
      rawInput: "Refine this idea",
      personaId: "frontend",
      providerId: "gemini",
      model: "gemini-2.5-pro",
      attachments,
    });

    expect(result).toMatchObject({ attachments });
  });

  it('1. accepts text attachments in a generate prompt payload ', () => {
    const attachments = [
      {
        name: "notes.txt",
        mimeType: "text/plain",
        sizeBytes: 42,
        content: "Use a calmer tone and keep the structure.",
      },
    ];

    const result = generatePromptPayloadSchema.parse({
      rawInput: "Refine this idea",
      personaId: "frontend",
      providerId: "gemini",
      model: "gemini-2.5-pro",
      attachments,
    });

    expect(result).toMatchObject({ attachments });
  });

  it('2. rejects more than five prompt attachments ', () => {
    const attachments = Array.from({ length: 6 }, (_, index) => ({
      name: `notes-${index + 1}.txt`,
      mimeType: "text/plain",
      sizeBytes: 42,
      content: "Use a calmer tone and keep the structure.",
    }));

    expect(() =>
      generatePromptPayloadSchema.parse({
        rawInput: "Refine this idea",
        personaId: "frontend",
        providerId: "gemini",
        model: "gemini-2.5-pro",
        attachments,
      }),
    ).toThrow();
  });

  it('3. rejects prompt attachments over the total size limit ', () => {
    const limitBytes = 1024 * 1024;
    const attachments = [
      {
        name: "notes-1.txt",
        mimeType: "text/plain",
        sizeBytes: limitBytes,
        content: "Use a calmer tone and keep the structure.",
      },
      {
        name: "notes-2.txt",
        mimeType: "text/plain",
        sizeBytes: 1,
        content: "Add one more byte.",
      },
    ];

    expect(() =>
      generatePromptPayloadSchema.parse({
        rawInput: "Refine this idea",
        personaId: "frontend",
        providerId: "gemini",
        model: "gemini-2.5-pro",
        attachments,
      }),
    ).toThrow();
  });

  it('4. rejects unsupported attachment types in the prompt payload ', () => {
    const attachments = [
      {
        name: "diagram.png",
        mimeType: "image/png",
        sizeBytes: 128,
        content: "png",
      },
    ];

    expect(() =>
      generatePromptPayloadSchema.parse({
        rawInput: "Refine this idea",
        personaId: "frontend",
        providerId: "gemini",
        model: "gemini-2.5-pro",
        attachments,
      }),
    ).toThrow();
  });

  it("rejects empty rawInput after trim", () => {
    expect(() =>
      generatePromptPayloadSchema.parse({
        rawInput: "   ",
        personaId: "frontend",
        providerId: "gemini",
        model: "gemini-2.5-pro",
      }),
    ).toThrow();
  });

  it("accepts a custom persona id", () => {
    const result = generatePromptPayloadSchema.parse({
      rawInput: "Refine this idea",
      personaId: "550e8400-e29b-41d4-a716-446655440000",
      providerId: "gemini",
      model: "gemini-2.5-pro",
    });

    expect(result.personaId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects invalid personaId", () => {
    expect(() =>
      generatePromptPayloadSchema.parse({
        rawInput: "ok",
        personaId: "not-a-persona",
        providerId: "gemini",
        model: "gemini-2.5-pro",
      }),
    ).toThrow();
  });

  it("rejects invalid providerId", () => {
    expect(() =>
      generatePromptPayloadSchema.parse({
        rawInput: "ok",
        personaId: "frontend",
        providerId: "not-a-provider",
        model: "gemini-2.5-pro",
      }),
    ).toThrow();
  });

  it("parses IPC success result", () => {
    const ok = generatePromptIpcResultSchema.parse({
      ok: true,
      prompt: "Refined text",
      tokensUsed: 42,
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.prompt).toBe("Refined text");
      expect(ok.tokensUsed).toBe(42);
    }
  });

  it("parses IPC success result without tokensUsed", () => {
    const ok = generatePromptIpcResultSchema.parse({
      ok: true,
      prompt: "Refined text",
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.tokensUsed).toBeUndefined();
    }
  });

  it("AC9 parses explicit prompt evaluation in IPC success results", () => {
    const ok = generatePromptIpcResultSchema.parse({
      ok: true,
      prompt: "Refined text",
      tokensUsed: 42,
      evaluation: {
        score: 4,
        summary: "Clear prompt with a focused role and expected output.",
        suggestions: ["Add input constraints.", "Specify the desired format."],
      },
    });

    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.evaluation).toEqual({
        score: 4,
        summary: "Clear prompt with a focused role and expected output.",
        suggestions: ["Add input constraints.", "Specify the desired format."],
      });
    }
  });

  it("AC9 rejects prompt evaluation scores outside 0 to 5", () => {
    expect(() =>
      promptEvaluationSchema.parse({
        score: 6,
        summary: "Too high.",
        suggestions: ["Use a valid score."],
      }),
    ).toThrow();
  });

  it("AC12 parses a prompt session snapshot with usage and evaluation", () => {
    const session = promptSessionSchema.parse({
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

    expect(session).toMatchObject({
      rawInput: "Refine this idea",
      personaId: "frontend",
      providerId: "gemini",
      generatedPrompt: "Refined text",
      usage: { tokensUsed: 42 },
      evaluation: {
        score: 4,
        summary: "Clear prompt with a focused role.",
        suggestions: ["Add output constraints."],
      },
      favorite: false,
    });
  });

  it("AC12 rejects invalid prompt session snapshots", () => {
    expect(() =>
      promptSessionSchema.parse({
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
          score: 6,
          summary: "Invalid score.",
          suggestions: ["Use a valid score."],
        },
        favorite: false,
        createdAt: "2026-06-09T12:00:00.000Z",
      }),
    ).toThrow();
  });

  it("parses IPC failure result", () => {
    const fail = generatePromptIpcResultSchema.parse({
      ok: false,
      message: "API key missing",
    });
    expect(fail.ok).toBe(false);
    if (!fail.ok) {
      expect(fail.message).toBe("API key missing");
    }
  });

  it("rejects IPC result with wrong discriminant", () => {
    expect(() =>
      generatePromptIpcResultSchema.parse({
        ok: true,
        message: "wrong shape",
      }),
    ).toThrow();
  });

  it("parses configured API key provider status without secret values", () => {
    const result = listConfiguredApiKeysResultSchema.parse({
      providerIds: ["gemini", "glm"],
    });

    expect(result.providerIds).toEqual(["gemini", "glm"]);
  });
});
