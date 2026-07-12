import { useEffect, useMemo, useState } from "react";
import { PROVIDERS, type ProviderId } from "../../providers/contract/provider";
import { useApiKeyRepository } from "../../providers/ui/useApiKeyRepository";
import { useCopyWithFeedback } from "../../prompt-generation/ui/hooks/useCopyWithFeedback";
import { usePromptGeneration } from "../../prompt-generation/ui/hooks/usePromptGeneration";
import { formatPromtizerResponse } from "../../prompt-generation/ui/utils/formatPromtizerResponse";
import {
  getAiPromptStudioBridge,
  hasBridgeMethod,
} from "../../../platform/renderer/api/electron-bridge";
import { createPromptStudioSession, type PromptStudioSession } from "../contract/session";
import type { PromptStudioScreenProps } from "./PromptStudio.types";

const providersConfig = PROVIDERS;

export function usePromptStudioViewModel(): PromptStudioScreenProps {
  const apiKeySettings = useApiKeyRepository();
  const { isConfigured } = apiKeySettings;
  const [session, setSession] = useState<PromptStudioSession>(() => createPromptStudioSession());
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionSaving, setSessionSaving] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const { providerId: provider, model } = session;

  const { isCopied, copyText, resetCopied } = useCopyWithFeedback();

  const selectedProvider = useMemo(
    () => providersConfig.find((entry) => entry.id === provider) ?? providersConfig[0],
    [provider],
  );

  const keyMissing = !isConfigured(provider);
  const modelIsValid = selectedProvider.models.includes(model);

  useEffect(() => {
    let active = true;
    const bridge = getAiPromptStudioBridge();
    const getSession = hasBridgeMethod(bridge?.promptStudio, "getSession")
      ? bridge.promptStudio.getSession()
      : Promise.reject(
          new Error("Prompt Studio sessions are only available in the Electron desktop app."),
        );

    void getSession
      .then((savedSession) => {
        if (active) setSession(savedSession);
      })
      .catch((error: unknown) => {
        if (active) {
          setSessionError(
            error instanceof Error ? error.message : "Could not load the Prompt Studio session.",
          );
        }
      })
      .finally(() => {
        if (active) setSessionLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function persistSession(nextSession: PromptStudioSession) {
    setSessionError("");
    setSessionSaving(true);
    const bridge = getAiPromptStudioBridge();
    const saveSession = hasBridgeMethod(bridge?.promptStudio, "saveSession")
      ? bridge.promptStudio.saveSession(nextSession)
      : Promise.reject(
          new Error("Prompt Studio sessions are only available in the Electron desktop app."),
        );

    void saveSession
      .then((savedSession) => {
        setSession(savedSession);
      })
      .catch((error: unknown) => {
        setSessionError(
          error instanceof Error ? error.message : "Could not save the Prompt Studio session.",
        );
      })
      .finally(() => {
        setSessionSaving(false);
      });
  }

  const {
    inputIdea,
    setInputIdea,
    isGenerating,
    outputPrompt,
    promtizerResponse,
    usage,
    evaluation,
    evaluationWarning,
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
    persistSession(createPromptStudioSession(nextProvider));
  }

  function handleRecoverSession() {
    setSessionError("");
    setSessionSaving(true);
    const bridge = getAiPromptStudioBridge();
    const recoverSession = hasBridgeMethod(bridge?.promptStudio, "recoverSession")
      ? bridge.promptStudio.recoverSession()
      : Promise.reject(
          new Error(
            "Prompt Studio session recovery is only available in the Electron desktop app.",
          ),
        );

    void recoverSession
      .then((savedSession) => setSession(savedSession))
      .catch((error: unknown) => {
        setSessionError(
          error instanceof Error ? error.message : "Could not recover the Prompt Studio session.",
        );
      })
      .finally(() => setSessionSaving(false));
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
    if (!selectedProvider.models.includes(nextModel)) {
      setSessionError(`Model "${nextModel}" is not available for ${selectedProvider.provider}.`);
      return;
    }
    persistSession({ ...session, model: nextModel });
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
      providers: providersConfig,
      selectedProvider,
      isGenerating,
      keyMissing,
      disabledReason: sessionLoading
        ? "Loading Prompt Studio session."
        : sessionSaving
          ? "Saving Prompt Studio session."
          : sessionError ||
            (!modelIsValid
              ? `Model "${model}" is no longer available for ${selectedProvider.provider}. Select an available model to continue.`
              : undefined),
      allowModelSelectionWhileDisabled: !sessionLoading && !sessionSaving && !modelIsValid,
      onProviderChange: handleProviderChange,
      onModelChange: handleModelChange,
      onGenerate: handleGenerate,
      onOpenSettings: handleOpenSettings,
      onRecoverSession:
        sessionError && !sessionLoading && !sessionSaving ? handleRecoverSession : undefined,
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
      evaluationWarning,
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
