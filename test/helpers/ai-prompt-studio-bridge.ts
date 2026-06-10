export function setAiPromptStudioBridge(
  bridge: Partial<Window["aiPromptStudio"]> | undefined,
): void {
  Object.defineProperty(window, "aiPromptStudio", {
    value: bridge,
    configurable: true,
    writable: true,
  });
}
