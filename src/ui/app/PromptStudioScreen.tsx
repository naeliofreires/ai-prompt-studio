import { ComposerPanel } from "../components/ComposerPanel";
import { Header } from "../components/Header";
import { OutputPanel } from "../components/OutputPanel";
import { PersonaPanel } from "../components/PersonaPanel";
import RoleModal from "../components/RoleModal";
import RoleViewModal from "../components/RoleViewModal";
import SettingsModal from "../components/SettingsModal";
import type { GenerationEvaluation } from "../types/generation";
import type { Role } from "../types/role";
import type { Provider, ProviderId } from "../../shared";
import styles from "./App.module.scss";

export interface PromptStudioScreenProps {
  roles: Role[];
  activeRole: string;
  isRolesLoading: boolean;
  rolesLoadError: string;
  personaActionError: string;
  onSelectRole: (id: string) => void;
  onCreatePersona: () => void;
  onManagePersona: (role: Role) => void;

  inputIdea: string;
  onInputIdeaChange: (value: string) => void;
  provider: ProviderId;
  model: string;
  providers: Provider[];
  selectedProvider: Provider;
  isGenerating: boolean;
  keyMissing: boolean;
  onProviderChange: (id: ProviderId) => void;
  onModelChange: (model: string) => void;
  onGenerate: () => void;

  outputPrompt: string;
  outputIsError: boolean;
  generationError: string;
  isCopied: boolean;
  evaluation: GenerationEvaluation | null;
  onCopyOutput: () => void;

  isRoleModalOpen: boolean;
  onCloseRoleModal: () => void;
  onCreateRole: (title: string, description: string) => void | Promise<void>;

  managedRole: Role | null;
  onCloseRoleView: () => void;
  onDeleteManagedRole: () => void | Promise<void>;

  isSettingsModalOpen: boolean;
  providersForSettings: Provider[];
  onCloseSettings: () => void;
  onSaveSettings: () => void;

  onOpenSettings: () => void;
}

export function PromptStudioScreen({
  roles,
  activeRole,
  isRolesLoading,
  rolesLoadError,
  personaActionError,
  onSelectRole,
  onCreatePersona,
  onManagePersona,
  inputIdea,
  onInputIdeaChange,
  provider,
  model,
  providers,
  selectedProvider,
  isGenerating,
  keyMissing,
  onProviderChange,
  onModelChange,
  onGenerate,
  outputPrompt,
  outputIsError,
  generationError,
  isCopied,
  evaluation,
  onCopyOutput,
  isRoleModalOpen,
  onCloseRoleModal,
  onCreateRole,
  managedRole,
  onCloseRoleView,
  onDeleteManagedRole,
  isSettingsModalOpen,
  providersForSettings,
  onCloseSettings,
  onSaveSettings,
  onOpenSettings,
}: PromptStudioScreenProps) {
  return (
    <main className={styles.main}>
      <div className={styles.gridOverlay} />
      <div className={styles.radialOverlay} aria-hidden="true" />

      <StudioShell>
        <Header onOpenSettings={onOpenSettings} />

        <section className={styles.workspaceGrid}>
          <section className={styles.panelCyan}>
            <PersonaPanel
              roles={roles}
              activeRole={activeRole}
              isLoading={isRolesLoading}
              loadError={rolesLoadError}
              actionError={personaActionError}
              onSelect={onSelectRole}
              onCreate={onCreatePersona}
              onManage={onManagePersona}
            />
          </section>

          <section className={styles.panelFuchsia}>
            <ComposerPanel
              inputIdea={inputIdea}
              onInputChange={onInputIdeaChange}
              provider={provider}
              model={model}
              providers={providers}
              selectedProvider={selectedProvider}
              isGenerating={isGenerating}
              keyMissing={keyMissing}
              onProviderChange={onProviderChange}
              onModelChange={onModelChange}
              onGenerate={onGenerate}
              onOpenSettings={onOpenSettings}
            />
          </section>

          <section className={styles.panelCyan}>
            <OutputPanel
              outputPrompt={outputPrompt}
              outputIsError={outputIsError}
              generationError={generationError}
              isGenerating={isGenerating}
              isCopied={isCopied}
              evaluation={evaluation}
              onCopy={onCopyOutput}
            />
          </section>
        </section>
      </StudioShell>

      <RoleModal open={isRoleModalOpen} onClose={onCloseRoleModal} onCreate={onCreateRole} />
      <RoleViewModal
        open={managedRole !== null}
        role={managedRole}
        onClose={onCloseRoleView}
        onDelete={onDeleteManagedRole}
      />
      <SettingsModal
        open={isSettingsModalOpen}
        providers={providersForSettings}
        onClose={onCloseSettings}
        onSave={onSaveSettings}
      />
    </main>
  );
}

function StudioShell({ children }: { children: React.ReactNode }) {
  return <div className={styles.studioShell}>{children}</div>;
}
