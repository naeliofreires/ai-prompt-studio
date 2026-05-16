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

interface PersonaPanelGroup {
  roles: Role[];
  activeRole: string;
  isLoading: boolean;
  loadError: string;
  actionError: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onManage: (role: Role) => void;
}

interface ComposerPanelGroup {
  inputIdea: string;
  onInputChange: (value: string) => void;
  provider: ProviderId;
  model: string;
  providers: Provider[];
  selectedProvider: Provider;
  isGenerating: boolean;
  keyMissing: boolean;
  onProviderChange: (providerId: ProviderId) => void;
  onModelChange: (model: string) => void;
  onGenerate: () => void;
  onOpenSettings: () => void;
}

interface OutputPanelGroup {
  outputPrompt: string;
  outputIsError: boolean;
  generationError: string;
  isCopied: boolean;
  evaluation: GenerationEvaluation | null;
  onCopy: () => void;
}

interface RoleModalGroup {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string) => void | Promise<void>;
}

interface RoleViewModalGroup {
  role: Role | null;
  onClose: () => void;
  onDelete: () => void | Promise<void>;
}

interface SettingsModalGroup {
  open: boolean;
  providers: Provider[];
  keys: Partial<Record<ProviderId, string>>;
  onClose: () => void;
  onSave: () => void;
  onSaveKeys: (patch: Partial<Record<ProviderId, string>>) => void;
  onClearProvider: (id: ProviderId) => void;
  onClearAll: () => void;
}

export interface PromptStudioScreenProps {
  persona: PersonaPanelGroup;
  composer: ComposerPanelGroup;
  output: OutputPanelGroup;
  roleModal: RoleModalGroup;
  roleViewModal: RoleViewModalGroup;
  settingsModal: SettingsModalGroup;
}

export function PromptStudioScreen({
  persona,
  composer,
  output,
  roleModal,
  roleViewModal,
  settingsModal,
}: PromptStudioScreenProps) {
  return (
    <main className={styles.main}>
      <div className={styles.gridOverlay} />
      <div className={styles.radialOverlay} aria-hidden="true" />

      <StudioShell>
        <Header onOpenSettings={composer.onOpenSettings} />

        <section className={styles.workspaceGrid}>
          <section className={styles.panelCyan}>
            <PersonaPanel
              roles={persona.roles}
              activeRole={persona.activeRole}
              isLoading={persona.isLoading}
              loadError={persona.loadError}
              actionError={persona.actionError}
              onSelect={persona.onSelect}
              onCreate={persona.onCreate}
              onManage={persona.onManage}
            />
          </section>

          <section className={styles.panelFuchsia}>
            <ComposerPanel
              inputIdea={composer.inputIdea}
              onInputChange={composer.onInputChange}
              provider={composer.provider}
              model={composer.model}
              providers={composer.providers}
              selectedProvider={composer.selectedProvider}
              isGenerating={composer.isGenerating}
              keyMissing={composer.keyMissing}
              onProviderChange={composer.onProviderChange}
              onModelChange={composer.onModelChange}
              onGenerate={composer.onGenerate}
              onOpenSettings={composer.onOpenSettings}
            />
          </section>

          <section className={styles.panelCyan}>
            <OutputPanel
              outputPrompt={output.outputPrompt}
              outputIsError={output.outputIsError}
              generationError={output.generationError}
              isGenerating={output.isGenerating}
              isCopied={output.isCopied}
              evaluation={output.evaluation}
              onCopy={output.onCopy}
            />
          </section>
        </section>
      </StudioShell>

      <RoleModal
        open={roleModal.open}
        onClose={roleModal.onClose}
        onCreate={roleModal.onCreate}
      />
      <RoleViewModal
        open={roleViewModal.role !== null}
        role={roleViewModal.role}
        onClose={roleViewModal.onClose}
        onDelete={roleViewModal.onDelete}
      />
      <SettingsModal
        open={settingsModal.open}
        providers={settingsModal.providers}
        keys={settingsModal.keys}
        onClose={settingsModal.onClose}
        onSave={settingsModal.onSave}
        onSaveKeys={settingsModal.onSaveKeys}
        onClearProvider={settingsModal.onClearProvider}
        onClearAll={settingsModal.onClearAll}
      />
    </main>
  );
}

function StudioShell({ children }: { children: React.ReactNode }) {
  return <div className={styles.studioShell}>{children}</div>;
}
