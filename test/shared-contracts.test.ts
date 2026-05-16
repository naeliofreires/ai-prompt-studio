import { describe, expect, it } from "vitest";
import {
  generatePromptIpcResultSchema,
  generatePromptPayloadSchema,
  listConfiguredApiKeysResultSchema,
} from "../src/shared";

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
