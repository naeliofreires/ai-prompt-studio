import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync("apps/gh-review/ui/app/GhReviewApp.module.css", "utf8");

describe("GH Review visual identity", () => {
  it("uses Promptizer studio palette and avoids the previous light canvas", () => {
    expect(stylesheet).toContain("#05070d");
    expect(stylesheet).toContain("rgba(34, 211, 238");
    expect(stylesheet).toContain("rgba(217, 70, 239");
    expect(stylesheet).toContain("ui-monospace");
    expect(stylesheet).toContain("text-transform: uppercase");
    expect(stylesheet).not.toContain("#f7f8fb");
    expect(stylesheet).not.toContain("background: #ffffff");
  });
});
