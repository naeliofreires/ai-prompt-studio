import { useCallback, useState } from "react";
import type { GeneratePromptIpcResult, GeneratePromptPayload, ProviderId } from "../../shared";
import type { Provider } from "../../shared/domain/provider";
import { promptStudioClient } from "../api/prompt-studio-client";
import type { GenerationEvaluation } from "../types/generation";
import type { Role } from "../types/role";

export type GeneratePromptFn = (payload: GeneratePromptPayload) => Promise<GeneratePromptIpcResult>;

export interface UsePromptGenerationArgs {
  selectedRole: Role | undefined;
  provider: ProviderId;
  model: string;
  keyMissing: boolean;
  selectedProvider: Provider;
  /** Called once generation is about to run (after guards); e.g. clear copy-to-clipboard feedback. */
  onGenerateStart?: () => void;
  generatePrompt?: GeneratePromptFn;
}

export function usePromptGeneration({
  selectedRole,
  provider,
  model,
  keyMissing,
  selectedProvider,
  onGenerateStart,
  generatePrompt = promptStudioClient.generatePrompt,
}: UsePromptGenerationArgs) {
  const [inputIdea, setInputIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputPrompt, setOutputPrompt] = useState("");
  const [evaluation, setEvaluation] = useState<GenerationEvaluation | null>(null);
  const [generationError, setGenerationError] = useState("");

  const handleGenerate = useCallback(async () => {
    const rawInput = inputIdea.trim();

    if (!rawInput) {
      setOutputPrompt("");
      setEvaluation(null);
      setGenerationError("Enter an idea before refining the prompt.");
      return;
    }

    if (!model.trim()) {
      setGenerationError("Select a model before refining the prompt.");
      return;
    }

    if (keyMissing) {
      setGenerationError(
        `Add your ${selectedProvider.provider} API key in Settings to generate prompts.`,
      );
      return;
    }

    if (!selectedRole) {
      setGenerationError("Select a persona before refining the prompt.");
      return;
    }

    onGenerateStart?.();
    setIsGenerating(true);
    setOutputPrompt("");
    setEvaluation(null);
    setGenerationError("");

    try {
      const result = await generatePrompt({
        rawInput,
        personaId: selectedRole.id,
        providerId: provider,
        model,
      });

      if (!result.ok) {
        setGenerationError(result.message);
        return;
      }

      setOutputPrompt(result.prompt);
      setEvaluation({
        tokensUsed: result.tokensUsed,
      });
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Could not generate the prompt.");
    } finally {
      setIsGenerating(false);
    }
  }, [
    generatePrompt,
    inputIdea,
    keyMissing,
    model,
    onGenerateStart,
    provider,
    selectedProvider.provider,
    selectedRole,
  ]);

  return {
    inputIdea,
    setInputIdea,
    isGenerating,
    outputPrompt,
    evaluation,
    generationError,
    handleGenerate,
  };
}
