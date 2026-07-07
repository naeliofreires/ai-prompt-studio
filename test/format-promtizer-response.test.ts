import { describe, expect, it } from "vitest";
import { formatPromtizerResponse } from "../src/renderer/utils/formatPromtizerResponse";

describe("formatPromtizerResponse", () => {
  it("formats structured response as readable markdown", () => {
    expect(
      formatPromtizerResponse({
        title: "Refined Prompt",
        description: "A concise prompt for a todo app.",
        requirements: ["Must include CRUD operations.", "Use clear section headings."],
        expectations: "The assistant should provide a complete implementation plan.",
        goodToGo: false,
      }),
    ).toBe(
      [
        "# Refined Prompt",
        "",
        "A concise prompt for a todo app.",
        "",
        "## Requirements",
        "- Must include CRUD operations.",
        "- Use clear section headings.",
        "",
        "## Expectations",
        "The assistant should provide a complete implementation plan.",
        "",
        "## Status",
        "Needs revision",
      ].join("\n"),
    );
  });
});
