import { useMemo, useState } from "react";
import { PromptStudioScreen } from "./PromptStudioScreen";
import { useApiKeySessionSync } from "../hooks/useApiKeySessionSync";
import { useCopyWithFeedback } from "../hooks/useCopyWithFeedback";
import { usePromptGeneration } from "../hooks/usePromptGeneration";
import { useRoles } from "../hooks/useRoles";
import type { Role } from "../types/role";
import { PERSONA_IDS, PROVIDERS, type ProviderId } from "../../shared";
import { useApiKeyStore, isProviderConfigured } from "../store/api-key-store";

const providersConfig = PROVIDERS;

function modelForProvider(providerId: ProviderId): string | undefined {
  const entry = providersConfig.find((provider) => provider.id === providerId);
  if (!entry || entry.models.length === 0) {
    return undefined;
  }

  return entry.models[0];
}

export function App() {
  const { roles, addRole, deleteRole, isLoading, error: rolesError } = useRoles();

  useApiKeySessionSync();

  const storeKeys = useApiKeyStore((s) => s.keys);
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

  const keyMissing = !isProviderConfigured(storeKeys, provider);

  const {
    inputIdea,
    setInputIdea,
    isGenerating,
    outputPrompt,
    evaluation,
    generationError,
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

  return (
    <PromptStudioScreen
      roles={roles}
      activeRole={activeRole}
      isRolesLoading={isLoading}
      rolesLoadError={rolesError}
      personaActionError={personaActionError}
      onSelectRole={setActiveRole}
      onCreatePersona={() => setIsRoleModalOpen(true)}
      onManagePersona={setManagedRole}
      inputIdea={inputIdea}
      onInputIdeaChange={setInputIdea}
      provider={provider}
      model={model}
      providers={providersConfig}
      selectedProvider={selectedProvider}
      isGenerating={isGenerating}
      keyMissing={keyMissing}
      onProviderChange={handleProviderChange}
      onModelChange={setModel}
      onGenerate={handleGenerate}
      outputPrompt={outputPrompt}
      outputIsError={outputIsError}
      generationError={generationError}
      isCopied={isCopied}
      evaluation={evaluation}
      onCopyOutput={handleCopyOutput}
      isRoleModalOpen={isRoleModalOpen}
      onCloseRoleModal={() => setIsRoleModalOpen(false)}
      onCreateRole={handleCreateRole}
      managedRole={managedRole}
      onCloseRoleView={() => setManagedRole(null)}
      onDeleteManagedRole={handleDeleteManagedRole}
      isSettingsModalOpen={isSettingsModalOpen}
      providersForSettings={providersConfig}
      onCloseSettings={() => setIsSettingsModalOpen(false)}
      onSaveSettings={() => setIsSettingsModalOpen(false)}
      onOpenSettings={() => setIsSettingsModalOpen(true)}
    />
  );
}
