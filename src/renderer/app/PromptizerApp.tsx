import { PromptStudioScreen } from "./prompt-studio/PromptStudioScreen";
import { usePromptStudioController } from "./prompt-studio/usePromptStudioController";

export function PromptizerApp() {
  const promptStudio = usePromptStudioController();

  return <PromptStudioScreen {...promptStudio} />;
}
