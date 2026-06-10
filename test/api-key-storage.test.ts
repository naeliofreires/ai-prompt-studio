import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readApiKeys,
  writeApiKeys,
  clearApiKeys,
  STORAGE_KEY,
} from "../apps/promptizer/ui/config/api-key-storage.js";

describe("api-key-storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns empty object when nothing stored", () => {
    expect(readApiKeys()).toEqual({});
  });

  it("writes and reads keys", () => {
    writeApiKeys({ gemini: "AIzaSy-test" });
    expect(readApiKeys()).toEqual({ gemini: "AIzaSy-test" });
  });

  it("merges with existing keys", () => {
    writeApiKeys({ gemini: "AIzaSy-test" });
    writeApiKeys({ deepseek: "sk-deep" });
    expect(readApiKeys()).toEqual({ gemini: "AIzaSy-test", deepseek: "sk-deep" });
  });

  it("overwrites existing key on same provider", () => {
    writeApiKeys({ gemini: "old-key" });
    writeApiKeys({ gemini: "new-key" });
    expect(readApiKeys()).toEqual({ gemini: "new-key" });
  });

  it("deletes key when empty string written", () => {
    writeApiKeys({ gemini: "AIzaSy-test" });
    writeApiKeys({ gemini: "" });
    expect(readApiKeys()).toEqual({});
  });

  it("deletes key when whitespace-only string written", () => {
    writeApiKeys({ gemini: "AIzaSy-test" });
    writeApiKeys({ gemini: "   " });
    expect(readApiKeys()).toEqual({});
  });

  it("trims values on write", () => {
    writeApiKeys({ gemini: "  AIzaSy-test  " });
    expect(readApiKeys()).toEqual({ gemini: "AIzaSy-test" });
  });

  it("clearApiKeys removes stored entry", () => {
    writeApiKeys({ gemini: "AIzaSy-test" });
    clearApiKeys();
    expect(readApiKeys()).toEqual({});
  });

  it("handles corrupt JSON gracefully", () => {
    window.localStorage.setItem(STORAGE_KEY, "not-json");
    expect(readApiKeys()).toEqual({});
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("handles invalid schema gracefully", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ gemini: 123 }));
    expect(readApiKeys()).toEqual({});
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("writeApiKeys skips providers not in the schema", () => {
    writeApiKeys({ gemini: "valid", unknownProvider: "should-be-ignored" as any });
    const keys = readApiKeys();
    expect(keys).toEqual({ gemini: "valid" });
    expect("unknownProvider" in keys).toBe(false);
  });

  it("no-ops when window is unavailable", () => {
    vi.stubGlobal("window", undefined);

    expect(readApiKeys()).toEqual({});
    expect(() => writeApiKeys({ gemini: "AIzaSy-test" })).not.toThrow();
    expect(() => clearApiKeys()).not.toThrow();
  });
});
