import { useCallback, useState } from "react";
import type { GeneratePromptIpcResult, GeneratePromptPayload } from "../../contract/ipc";
import type { Provider, ProviderId } from "../../../providers/contract/provider";
import { getErrorMessage } from "../../../../shared/lib/error";
import { promptStudioClient } from "../api/prompt-studio-client";
import { validatePromtizerResponse } from "../services/promtizer";
import type { PromtizerResponse } from "../types/api";
import type { GenerationEvaluation, GenerationUsage } from "../types/generation";
import type { Role } from "../../../personas/ui/role";

export type GeneratePromptFn = (payload: GeneratePromptPayload) => Promise<GeneratePromptIpcResult>;
type PromptAttachments = NonNullable<GeneratePromptPayload["attachments"]>;

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
  const [promtizerResponse, setPromtizerResponse] = useState<PromtizerResponse | null>(null);
  const [usage, setUsage] = useState<GenerationUsage | null>(null);
  const [evaluation, setEvaluation] = useState<GenerationEvaluation | null>(null);
  const [generationError, setGenerationError] = useState("");
  const [promptAttachments, setPromptAttachments] = useState<PromptAttachments>([]);

  const handleGenerate = useCallback(async () => {
    const rawInput = inputIdea.trim();

    if (!rawInput) {
      setOutputPrompt("");
      setPromtizerResponse(null);
      setUsage(null);
      setEvaluation(null);
      setGenerationError("Enter an idea before refining the prompt.");
      return;
    }

    if (keyMissing) {
      setGenerationError(
        `Add your ${selectedProvider.provider} API key in Settings to generate prompts.`,
      );
      return;
    }

    if (!model.trim()) {
      setGenerationError("Select a model before refining the prompt.");
      return;
    }

    if (!selectedRole) {
      setGenerationError("Select a persona before refining the prompt.");
      return;
    }

    onGenerateStart?.();
    setIsGenerating(true);
    setOutputPrompt("");
    setPromtizerResponse(null);
    setUsage(null);
    setEvaluation(null);
    setGenerationError("");

    try {
      const payload: GeneratePromptPayload = {
        rawInput,
        personaId: selectedRole.id,
        providerId: provider,
        model,
      };

      if (promptAttachments.length > 0) {
        payload.attachments = promptAttachments;
      }

      const result = await generatePrompt(payload);

      if (!result.ok) {
        setGenerationError(result.message);
        return;
      }

      const structuredResponse = validatePromtizerResponse(result.prompt);

      setPromtizerResponse(structuredResponse);
      setOutputPrompt(JSON.stringify(structuredResponse, null, 2));
      setUsage({
        tokensUsed: result.tokensUsed,
      });
      setEvaluation(result.evaluation ?? null);
    } catch (err) {
      setGenerationError(getErrorMessage(err, "Could not generate the prompt."));
    } finally {
      setIsGenerating(false);
    }
  }, [
    generatePrompt,
    inputIdea,
    keyMissing,
    model,
    onGenerateStart,
    promptAttachments,
    provider,
    selectedProvider.provider,
    selectedRole,
  ]);

  return {
    inputIdea,
    setInputIdea,
    promptAttachments,
    setPromptAttachments,
    isGenerating,
    outputPrompt,
    promtizerResponse,
    usage,
    evaluation,
    generationError,
    handleGenerate,
  };
}
