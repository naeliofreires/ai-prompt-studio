import { z } from "zod";
import { PROVIDER_IDS, type ProviderId } from "./provider.js";

export const apiKeyMapSchema = z.record(
  z.enum(PROVIDER_IDS),
  z.string().min(1),
);

export type ApiKeyMap = z.infer<typeof apiKeyMapSchema>;

const MASK_VISIBLE_CHARS = 4;

export function maskKey(value: string): string {
  if (value.length <= MASK_VISIBLE_CHARS + 4) {
    return value.slice(0, 2) + "..." + value.slice(-2);
  }
  return value.slice(0, 2) + "\u2022".repeat(Math.min(value.length - MASK_VISIBLE_CHARS * 2, 16)) + value.slice(-MASK_VISIBLE_CHARS);
}

export function hasKey(map: Partial<Record<ProviderId, string>>, providerId: ProviderId): boolean {
  const val = map[providerId];
  return typeof val === "string" && val.trim().length > 0;
}

export function getKey(map: Partial<Record<ProviderId, string>>, providerId: ProviderId): string | undefined {
  const val = map[providerId];
  return typeof val === "string" ? val.trim() : undefined;
}
