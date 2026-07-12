import { z } from "zod";
import providersRaw from "../../../spec/providers.json" with { type: "json" };

const providerRowSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  models: z.array(z.string()),
  sdkType: z.string().optional(),
  envKeys: z.array(z.string()).optional(),
  keyPlaceholder: z.string().optional(),
  defaultBaseUrl: z.string().nullable().optional(),
  modelFn: z.string().optional(),
});

const providersArraySchema = z.array(providerRowSchema).min(1);

export const PROVIDERS = providersArraySchema.parse(providersRaw);

const ids = PROVIDERS.map((p) => p.id);
if (new Set(ids).size !== ids.length) {
  throw new Error("providers.json: duplicate id");
}

function toNonEmptyTuple<T>(items: T[]): [T, ...T[]] {
  const [first, ...rest] = items;
  if (first === undefined) {
    throw new Error("providers.json must list at least one provider");
  }
  return [first, ...rest];
}

export const PROVIDER_IDS = toNonEmptyTuple(ids);
export type ProviderId = (typeof PROVIDER_IDS)[number];

export interface Provider {
  id: ProviderId;
  provider: string;
  models: string[];
  sdkType?: string;
  envKeys?: string[];
  keyPlaceholder?: string;
  defaultBaseUrl?: string | null;
  modelFn?: string;
}

export function getProviderMeta(providerId: ProviderId): { label: string; placeholder: string } {
  const provider = PROVIDERS.find((p) => p.id === providerId);
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);
  return {
    label: `${provider.provider} API Key`,
    placeholder: provider.keyPlaceholder ?? "",
  };
}
