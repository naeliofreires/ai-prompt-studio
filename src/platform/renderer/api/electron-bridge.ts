export type AiPromptStudioBridge = Window["aiPromptStudio"];
export type AiPromptStudioBridgeMethod<Bridge extends object> = keyof Bridge;

export function getAiPromptStudioBridge(): Partial<AiPromptStudioBridge> | undefined {
  if (typeof window === "undefined") return undefined;
  return window.aiPromptStudio;
}

export function hasBridgeMethod<
  Bridge extends object,
  Key extends AiPromptStudioBridgeMethod<Bridge>,
>(bridge: Partial<Bridge> | undefined, method: Key): bridge is Partial<Bridge> & Pick<Bridge, Key> {
  return typeof bridge?.[method] === "function";
}
