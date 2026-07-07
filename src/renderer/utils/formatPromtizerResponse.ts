import type { PromtizerResponse } from "../types/api";

export function formatPromtizerResponse(response: PromtizerResponse): string {
  const requirements = response.requirements.map((item) => `- ${item}`).join("\n");
  const status = response.goodToGo ? "Good to go" : "Needs revision";

  return [
    `# ${response.title}`,
    "",
    response.description,
    "",
    "## Requirements",
    requirements,
    "",
    "## Expectations",
    response.expectations,
    "",
    "## Status",
    status,
  ].join("\n");
}
