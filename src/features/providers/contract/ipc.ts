import { z } from "zod";
import { PROVIDER_IDS } from "./provider.js";

export const providerIpcChannels = {
  listConfiguredApiKeys: "apiKeys:listConfigured",
  setApiKeys: "apiKeys:set",
  clearAllApiKeys: "apiKeys:clearAll",
} as const;

export const setApiKeysPayloadSchema = z.record(z.string(), z.string());

export const listConfiguredApiKeysResultSchema = z.object({
  providerIds: z.array(z.enum(PROVIDER_IDS)),
});

export type SetApiKeysPayload = z.infer<typeof setApiKeysPayloadSchema>;
export type ListConfiguredApiKeysResult = z.infer<typeof listConfiguredApiKeysResultSchema>;
