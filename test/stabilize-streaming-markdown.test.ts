import { describe, expect, it } from "vitest";
import { stabilizeStreamingMarkdown } from "../src/ui/markdown/stabilizeStreamingMarkdown";

describe("stabilizeStreamingMarkdown", () => {
  it("returns the source unchanged when not streaming", () => {
    const source = "# Title\n\n```ts\nconst x = 1";
    expect(stabilizeStreamingMarkdown(source, false)).toBe(source);
  });

  it("returns the source unchanged when streaming with balanced fences", () => {
    const source = "```ts\nconst x = 1\n```";
    expect(stabilizeStreamingMarkdown(source, true)).toBe(source);
  });

  it("appends a closing fence only for the render pass while streaming", () => {
    const source = "# Title\n\n```ts\nconst x = 1";
    expect(stabilizeStreamingMarkdown(source, true)).toBe(`${source}\n\`\`\``);
    expect(source).toBe("# Title\n\n```ts\nconst x = 1");
  });

  it("returns an empty source unchanged while streaming", () => {
    expect(stabilizeStreamingMarkdown("", true)).toBe("");
  });
});
