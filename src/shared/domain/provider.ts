import { z } from "zod";
import providersRaw from "../../../spec/providers.json" with { type: "json" };

const providerRowSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  models: z.array(z.string()),
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
}
