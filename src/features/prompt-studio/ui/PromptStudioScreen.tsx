import { ComposerPanel } from "../../prompt-generation/ui/components/ComposerPanel";
import { OutputPanel } from "../../prompt-generation/ui/components/OutputPanel";
import { PersonaPanel } from "../../personas/ui/PersonaPanel";
import { PersonasPage } from "../../personas/ui/PersonasPage";
import SettingsModal from "../../providers/ui/SettingsModal";
import styles from "./PromptStudioScreen.module.scss";
import type { PromptStudioScreenProps } from "./PromptStudio.types";

export function PromptStudioScreen({
  view,
  onShowStudio,
  onShowPersonas,
  persona,
  composer,
  output,
  personasPage,
  settingsModal,
}: PromptStudioScreenProps) {
  return (
    <main className={styles.main}>
      <div className={styles.gridOverlay} />
      <div className={styles.radialOverlay} aria-hidden="true" />

      <div className={styles.studioShell}>
        <header className={styles.chromeBar}>
          <div>
            <p className={styles.chromeKicker}>Promptizer</p>
            <h1 className={styles.chromeTitle}>AI Prompt Studio</h1>
          </div>

          <div className={styles.viewSwitch} role="tablist" aria-label="Promptizer views">
            <button
              type="button"
              className={[styles.viewButton, view === "studio" ? styles.viewButtonActive : ""].join(
                " ",
              )}
              aria-pressed={view === "studio"}
              onClick={onShowStudio}
            >
              Studio
            </button>
            <button
              type="button"
              className={[
                styles.viewButton,
                view === "personas" ? styles.viewButtonActive : "",
              ].join(" ")}
              aria-pressed={view === "personas"}
              onClick={onShowPersonas}
            >
              Personas
            </button>
          </div>
        </header>

        {view === "studio" ? (
          <section className={styles.workspaceGrid}>
            <section className={styles.panelCyan}>
              <PersonaPanel
                roles={persona.roles}
                activeRole={persona.activeRole}
                isLoading={persona.isLoading}
                loadError={persona.loadError}
                actionError={persona.actionError}
                onSelect={persona.onSelect}
                onManagePersonas={persona.onManagePersonas}
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
                disabledReason={composer.disabledReason}
                onProviderChange={composer.onProviderChange}
                onModelChange={composer.onModelChange}
                onGenerate={composer.onGenerate}
                onOpenSettings={composer.onOpenSettings}
                promptAttachments={composer.promptAttachments}
                onPromptAttachmentsChange={composer.onPromptAttachmentsChange}
                onRemovePromptAttachment={composer.onRemovePromptAttachment}
              />
            </section>

            <section className={styles.panelCyan}>
              <OutputPanel
                outputPrompt={output.outputPrompt}
                promtizerResponse={output.promtizerResponse}
                outputIsError={output.outputIsError}
                generationError={output.generationError}
                isGenerating={output.isGenerating}
                isCopied={output.isCopied}
                usage={output.usage}
                evaluation={output.evaluation}
                onCopy={output.onCopy}
              />
            </section>
          </section>
        ) : (
          <PersonasPage
            roles={personasPage.roles}
            activeRole={personasPage.activeRole}
            isLoading={personasPage.isLoading}
            loadError={personasPage.loadError}
            actionError={personasPage.actionError}
            onSelect={personasPage.onSelect}
            onCreate={personasPage.onCreate}
            onUpdate={personasPage.onUpdate}
            onDelete={personasPage.onDelete}
          />
        )}
      </div>

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
