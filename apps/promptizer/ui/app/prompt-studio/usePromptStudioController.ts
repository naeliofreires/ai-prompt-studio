import { useEffect, useMemo, useState } from "react";
import { PROVIDERS, type ProviderId } from "../../../shared";
import { getErrorMessage } from "../../../shared/utils/error";
import { useApiKeyRepository } from "../../hooks/useApiKeyRepository";
import { useCopyWithFeedback } from "../../hooks/useCopyWithFeedback";
import { usePromptGeneration } from "../../hooks/usePromptGeneration";
import { useRoles } from "../../hooks/useRoles";
import { formatPromtizerResponse } from "../../utils/formatPromtizerResponse";
import type { PromptStudioScreenProps, PromptizerView } from "./PromptStudio.types";

const providersConfig = PROVIDERS;

function modelForProvider(providerId: ProviderId): string | undefined {
  const entry = providersConfig.find((provider) => provider.id === providerId);
  if (!entry || entry.models.length === 0) {
    return undefined;
  }

  return entry.models[0];
}

export function usePromptStudioController(): PromptStudioScreenProps {
  const {
    roles,
    addRole,
    deleteRole,
    updateRole,
    isLoading,
    error: rolesError,
  } = useRoles();
  const apiKeySettings = useApiKeyRepository();
  const [view, setView] = useState<PromptizerView>("studio");
  const [activeRole, setActiveRole] = useState<string>("");
  const [personaActionError, setPersonaActionError] = useState("");
  const [provider, setProvider] = useState<ProviderId>("gemini");
  const [model, setModel] = useState("gemini-2.5-pro");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const { isCopied, copyText, resetCopied } = useCopyWithFeedback();

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === activeRole),
    [activeRole, roles],
  );
  const personaGuardMessage = useMemo(() => {
    if (isLoading) return "";
    if (roles.length === 0) return "Create a persona before generating.";
    if (!selectedRole) return "Select a persona before generating.";
    return "";
  }, [isLoading, roles.length, selectedRole]);

  useEffect(() => {
    if (roles.length === 0) {
      if (activeRole !== "") {
        setActiveRole("");
      }

      return;
    }

    const hasActiveRole = roles.some((role) => role.id === activeRole);
    if (!hasActiveRole) {
      setActiveRole(roles[0]?.id ?? "");
    }
  }, [activeRole, roles]);

  const configuredProviders = useMemo(
    () => providersConfig.filter((entry) => apiKeySettings.configuredProviderIds.includes(entry.id)),
    [apiKeySettings.configuredProviderIds],
  );

  const selectedProvider = useMemo(
    () =>
      configuredProviders.find((entry) => entry.id === provider) ??
      configuredProviders[0] ??
      providersConfig.find((entry) => entry.id === provider) ??
      providersConfig[0],
    [configuredProviders, provider],
  );

  const keyMissing = !apiKeySettings.isConfigured(provider);

  useEffect(() => {
    const firstConfiguredProvider = configuredProviders[0];

    if (!firstConfiguredProvider) {
      setModel("");
      return;
    }

    if (!apiKeySettings.isConfigured(provider)) {
      setProvider(firstConfiguredProvider.id);
      setModel(modelForProvider(firstConfiguredProvider.id) ?? "");
    }
  }, [apiKeySettings.isConfigured, configuredProviders, provider]);

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
    selectedRole,
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

  function handleShowStudio() {
    setView("studio");
  }

  function handleShowPersonas() {
    setView("personas");
  }

  function handleSelectPersona(id: string) {
    setActiveRole(id);
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

  async function handleCreateRole(title: string, description: string) {
    setPersonaActionError("");

    try {
      const role = await addRole(title, description);
      setActiveRole(role.id);
      return role;
    } catch (err) {
      setPersonaActionError(getErrorMessage(err, "Could not create the custom persona."));
      throw err;
    }
  }

  async function handleDeleteRole(id: string) {
    setPersonaActionError("");

    try {
      const deleted = await deleteRole(id);
      if (!deleted) {
        setPersonaActionError("Could not delete the custom persona.");
        return false;
      }

      if (activeRole === id) {
        const nextRole = roles.find((role) => role.id !== id);
        setActiveRole(nextRole?.id ?? "");
      }

      return true;
    } catch (err) {
      setPersonaActionError(getErrorMessage(err, "Could not delete the custom persona."));
      throw err;
    }
  }

  async function handleSavePersona(id: string, patch: { title: string; description: string }) {
    setPersonaActionError("");

    try {
      await updateRole(id, patch);
      return;
    } catch (err) {
      setPersonaActionError(getErrorMessage(err, "Could not save the persona."));
      throw err;
    }
  }

  return {
    view,
    onShowStudio: handleShowStudio,
    onShowPersonas: handleShowPersonas,
    persona: {
      roles,
      activeRole,
      isLoading,
      loadError: rolesError,
      actionError: personaActionError,
      onSelect: handleSelectPersona,
      onManagePersonas: handleShowPersonas,
    },
    composer: {
      inputIdea,
      onInputChange: setInputIdea,
      provider,
      model,
      providers: configuredProviders,
      selectedProvider,
      isGenerating,
      keyMissing,
      disabledReason: personaGuardMessage,
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
    personasPage: {
      roles,
      activeRole,
      isLoading,
      loadError: rolesError,
      actionError: personaActionError,
      onSelect: handleSelectPersona,
      onCreate: handleCreateRole,
      onUpdate: handleSavePersona,
      onDelete: handleDeleteRole,
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
