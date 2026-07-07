import { PromptStudioScreen } from "./PromptStudioScreen";
import { usePromptStudioController } from "./usePromptStudioController";

export function PromptizerApp() {
  const promptStudio = usePromptStudioController();

  return <PromptStudioScreen {...promptStudio} />;
}
