import { useMemo, useState } from "react";
import { useApiKeySettings } from "../hooks/useApiKeySettings";
import { useCopyWithFeedback } from "../hooks/useCopyWithFeedback";
import { usePromptGeneration } from "../hooks/usePromptGeneration";
import { useRoles } from "../hooks/useRoles";
import type { Role } from "../types/role";
import { PERSONA_IDS, PROVIDERS, type ProviderId } from "../../shared";
import type { PromptStudioScreenProps } from "./PromptStudioScreen";

const providersConfig = PROVIDERS;

function modelForProvider(providerId: ProviderId): string | undefined {
  const entry = providersConfig.find((provider) => provider.id === providerId);
  if (!entry || entry.models.length === 0) {
    return undefined;
  }

  return entry.models[0];
}

export function usePromptStudioController(): PromptStudioScreenProps {
  const { roles, addRole, deleteRole, isLoading, error: rolesError } = useRoles();
  const apiKeySettings = useApiKeySettings();
  const [activeRole, setActiveRole] = useState<string>(PERSONA_IDS[0]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [managedRole, setManagedRole] = useState<Role | null>(null);
  const [personaActionError, setPersonaActionError] = useState("");
  const [provider, setProvider] = useState<ProviderId>("gemini");
  const [model, setModel] = useState("gemini-2.5-pro");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const { isCopied, copyText, resetCopied } = useCopyWithFeedback();

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === activeRole) ?? roles[0],
    [activeRole, roles],
  );

  const selectedProvider = useMemo(
    () => providersConfig.find((entry) => entry.id === provider) ?? providersConfig[0],
    [provider],
  );

  const keyMissing = !apiKeySettings.isConfigured(provider);

  const {
    inputIdea,
    setInputIdea,
    isGenerating,
    outputPrompt,
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
    await copyText(outputPrompt);
  }

  function handleRemovePromptAttachment(index: number) {
    setPromptAttachments((currentAttachments) =>
      currentAttachments.filter((_, attachmentIndex) => attachmentIndex !== index),
    );
  }

  async function handleCreateRole(title: string, description: string) {
    setPersonaActionError("");

    try {
      const role = await addRole(title, description);
      setActiveRole(role.id);
    } catch (err) {
      setPersonaActionError(
        err instanceof Error ? err.message : "Could not create the custom persona.",
      );
    }
  }

  async function handleDeleteManagedRole() {
    if (!managedRole) return;

    setPersonaActionError("");

    try {
      const deleted = await deleteRole(managedRole.id);
      if (!deleted) {
        setPersonaActionError("Could not delete the custom persona.");
        return;
      }

      if (activeRole === managedRole.id) {
        setActiveRole(PERSONA_IDS[0]);
      }

      setManagedRole(null);
    } catch (err) {
      setPersonaActionError(
        err instanceof Error ? err.message : "Could not delete the custom persona.",
      );
    }
  }

  return {
    persona: {
      roles,
      activeRole,
      isLoading,
      loadError: rolesError,
      actionError: personaActionError,
      onSelect: setActiveRole,
      onCreate: () => setIsRoleModalOpen(true),
      onManage: setManagedRole,
    },
    composer: {
      inputIdea,
      onInputChange: setInputIdea,
      provider,
      model,
      providers: providersConfig,
      selectedProvider,
      isGenerating,
      keyMissing,
      onProviderChange: handleProviderChange,
      onModelChange: setModel,
      onGenerate: handleGenerate,
      onOpenSettings: () => setIsSettingsModalOpen(true),
      promptAttachments,
      onPromptAttachmentsChange: setPromptAttachments,
      onRemovePromptAttachment: handleRemovePromptAttachment,
    },
    output: {
      outputPrompt,
      outputIsError,
      generationError,
      isGenerating,
      isCopied,
      usage,
      evaluation,
      onCopy: handleCopyOutput,
    },
    roleModal: {
      open: isRoleModalOpen,
      onClose: () => setIsRoleModalOpen(false),
      onCreate: handleCreateRole,
    },
    roleViewModal: {
      role: managedRole,
      onClose: () => setManagedRole(null),
      onDelete: handleDeleteManagedRole,
    },
    settingsModal: {
      open: isSettingsModalOpen,
      providers: providersConfig,
      keys: apiKeySettings.keys,
      onClose: () => setIsSettingsModalOpen(false),
      onSave: () => setIsSettingsModalOpen(false),
      onSaveKeys: apiKeySettings.saveKeys,
      onClearProvider: apiKeySettings.clearProvider,
      onClearAll: apiKeySettings.clearAll,
    },
  };
}
