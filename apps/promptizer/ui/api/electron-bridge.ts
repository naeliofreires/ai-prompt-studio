export type AiPromptStudioBridge = Window["aiPromptStudio"];
export type AiPromptStudioBridgeMethod = keyof AiPromptStudioBridge;

export function getAiPromptStudioBridge(): Partial<AiPromptStudioBridge> | undefined {
  if (typeof window === "undefined") return undefined;
  return window.aiPromptStudio;
}

export function hasBridgeMethod<Key extends AiPromptStudioBridgeMethod>(
  bridge: Partial<AiPromptStudioBridge> | undefined,
  method: Key,
): bridge is Partial<AiPromptStudioBridge> & Pick<AiPromptStudioBridge, Key> {
  return typeof bridge?.[method] === "function";
}
