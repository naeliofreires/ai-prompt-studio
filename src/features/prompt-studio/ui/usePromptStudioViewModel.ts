import { useEffect, useMemo, useState } from "react";
import { PROVIDERS, type ProviderId } from "../../providers/contract/provider";
import { useApiKeyRepository } from "../../providers/ui/useApiKeyRepository";
import { useCopyWithFeedback } from "../../prompt-generation/ui/hooks/useCopyWithFeedback";
import { usePromptGeneration } from "../../prompt-generation/ui/hooks/usePromptGeneration";
import { formatPromtizerResponse } from "../../prompt-generation/ui/utils/formatPromtizerResponse";
import type { PromptStudioScreenProps } from "./PromptStudio.types";

const providersConfig = PROVIDERS;

function modelForProvider(providerId: ProviderId): string | undefined {
  const entry = providersConfig.find((provider) => provider.id === providerId);
  if (!entry || entry.models.length === 0) {
    return undefined;
  }

  return entry.models[0];
}

export function usePromptStudioViewModel(): PromptStudioScreenProps {
  const apiKeySettings = useApiKeyRepository();
  const { configuredProviderIds, isConfigured } = apiKeySettings;
  const [provider, setProvider] = useState<ProviderId>("gemini");
  const [model, setModel] = useState("gemini-2.5-pro");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const { isCopied, copyText, resetCopied } = useCopyWithFeedback();

  const configuredProviders = useMemo(
    () => providersConfig.filter((entry) => configuredProviderIds.includes(entry.id)),
    [configuredProviderIds],
  );

  const selectedProvider = useMemo(
    () =>
      configuredProviders.find((entry) => entry.id === provider) ??
      configuredProviders[0] ??
      providersConfig.find((entry) => entry.id === provider) ??
      providersConfig[0],
    [configuredProviders, provider],
  );

  const keyMissing = !isConfigured(provider);

  useEffect(() => {
    const firstConfiguredProvider = configuredProviders[0];

    if (!firstConfiguredProvider) {
      setModel("");
      return;
    }

    if (!isConfigured(provider)) {
      setProvider(firstConfiguredProvider.id);
      setModel(modelForProvider(firstConfiguredProvider.id) ?? "");
    }
  }, [configuredProviders, isConfigured, provider]);

  const {
    inputIdea,
    setInputIdea,
    isGenerating,
    outputPrompt,
    promtizerResponse,
    usage,
    evaluation,
    generationError,
    promptAttachments,
    setPromptAttachments,
    handleGenerate,
  } = usePromptGeneration({
    provider,
    model,
    keyMissing,
    selectedProvider,
    onGenerateStart: resetCopied,
  });

  const outputIsError = Boolean(generationError && !outputPrompt);

  function handleProviderChange(nextProvider: ProviderId) {
    setProvider(nextProvider);
    setModel(modelForProvider(nextProvider) ?? "");
  }

  async function handleCopyOutput() {
    await copyText(promtizerResponse ? formatPromtizerResponse(promtizerResponse) : outputPrompt);
  }

  function handleRemovePromptAttachment(index: number) {
    setPromptAttachments((currentAttachments) =>
      currentAttachments.filter((_, attachmentIndex) => attachmentIndex !== index),
    );
  }

  function handleModelChange(nextModel: string) {
    setModel(nextModel);
  }

  function handleOpenSettings() {
    setIsSettingsModalOpen(true);
  }

  function handleCloseSettings() {
    setIsSettingsModalOpen(false);
  }

  return {
    composer: {
      inputIdea,
      onInputChange: setInputIdea,
      provider,
      model,
      providers: configuredProviders,
      selectedProvider,
      isGenerating,
      keyMissing,
      onProviderChange: handleProviderChange,
      onModelChange: handleModelChange,
      onGenerate: handleGenerate,
      onOpenSettings: handleOpenSettings,
      promptAttachments,
      onPromptAttachmentsChange: setPromptAttachments,
      onRemovePromptAttachment: handleRemovePromptAttachment,
    },
    output: {
      outputPrompt,
      promtizerResponse,
      outputIsError,
      generationError,
      isGenerating,
      isCopied,
      usage,
      evaluation,
      onCopy: handleCopyOutput,
    },
    settingsModal: {
      open: isSettingsModalOpen,
      providers: providersConfig,
      keys: apiKeySettings.keys,
      onClose: handleCloseSettings,
      onSave: handleCloseSettings,
      onSaveKeys: apiKeySettings.saveKeys,
      onClearProvider: apiKeySettings.clearProvider,
      onClearAll: apiKeySettings.clearAll,
    },
  };
}
