import { PromptStudioScreen } from "./PromptStudioScreen";
import { useApiKeySessionSync } from "../hooks/useApiKeySessionSync";
import { usePromptStudioController } from "./usePromptStudioController";

export function App() {
  useApiKeySessionSync();
  const promptStudio = usePromptStudioController();

  return <PromptStudioScreen {...promptStudio} />;
}
