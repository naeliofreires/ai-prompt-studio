import { PROVIDERS } from "./provider.js";
import type { ProviderId } from "./provider.js";

function keyPlaceholderFor(id: ProviderId): string {
  switch (id) {
    case "gemini":
      return "AIzaSy...";
    case "glm":
      return "glm-...";
    case "deepseek":
      return "sk-...";
    default: {
      const _exhaustive: never = id;
      throw new Error(`No placeholder for provider: ${id}`);
    }
  }
}

export const PROVIDER_META = Object.fromEntries(
  PROVIDERS.map((p) => [p.id, {
    label: `${p.provider} API Key`,
    placeholder: keyPlaceholderFor(p.id as ProviderId),
  }]),
) as Record<ProviderId, { label: string; placeholder: string }>;
