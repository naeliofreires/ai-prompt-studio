import { z } from "zod";
import { PROVIDER_IDS, type ProviderId } from "./provider.js";

export const apiKeyMapSchema = z.record(z.enum(PROVIDER_IDS), z.string().min(1));

export function hasKey(map: Partial<Record<ProviderId, string>>, providerId: ProviderId): boolean {
  const val = map[providerId];
  return typeof val === "string" && val.trim().length > 0;
}
