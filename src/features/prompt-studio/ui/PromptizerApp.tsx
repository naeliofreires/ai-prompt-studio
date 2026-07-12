import { PromptStudioScreen } from "./PromptStudioScreen";
import { usePromptStudioViewModel } from "./usePromptStudioViewModel";

export function PromptizerApp() {
  const promptStudio = usePromptStudioViewModel();

  return <PromptStudioScreen {...promptStudio} />;
}
