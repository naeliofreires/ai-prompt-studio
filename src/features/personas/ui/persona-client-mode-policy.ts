export type PersonaClientMode = "bridge" | "local" | "unavailable";

type PersonaClientModeInput = {
  hasPromptBridge: boolean;
  hasCustomPersonaBridge: boolean;
};

export function selectPersonaClientMode({
  hasPromptBridge,
  hasCustomPersonaBridge,
}: PersonaClientModeInput): PersonaClientMode {
  if (hasCustomPersonaBridge) return "bridge";
  if (hasPromptBridge) return "unavailable";
  return "local";
}
