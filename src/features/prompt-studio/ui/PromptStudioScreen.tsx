import { ComposerPanel } from "../../prompt-generation/ui/components/ComposerPanel";
import { OutputPanel } from "../../prompt-generation/ui/components/OutputPanel";
import SettingsModal from "../../providers/ui/SettingsModal";
import styles from "./PromptStudioScreen.module.scss";
import type { PromptStudioScreenProps } from "./PromptStudio.types";

export function PromptStudioScreen({ composer, output, settingsModal }: PromptStudioScreenProps) {
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
        </header>

        <section className={styles.workspaceGrid}>
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
