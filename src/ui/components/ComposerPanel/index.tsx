import { useRef } from "react";
import { Loader2, Trash2, Wand2 } from "lucide-react";
import type { Provider, ProviderId } from "../../../shared";
import { PanelHeader } from "../shared/PanelHeader";
import styles from "./ComposerPanel.module.scss";

export interface ComposerPanelProps {
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

const ScanlineOverlay = () => <div aria-hidden="true" className={styles.scanlineOverlay} />;

function ComposerControls({
  provider,
  model,
  selectedProvider,
  providers,
  isGenerating,
  onProviderChange,
  onModelChange,
  onGenerate,
}: {
  provider: ProviderId;
  model: string;
  selectedProvider: Provider;
  providers: Provider[];
  isGenerating: boolean;
  onProviderChange: (providerId: ProviderId) => void;
  onModelChange: (model: string) => void;
  onGenerate: () => void;
}) {
  return (
    <div className={styles.composerControls}>
      <div className={styles.controlsGrid}>
        <label className={styles.fieldLabel}>
          Provider
          <select
            value={provider}
            onChange={(event) => onProviderChange(event.target.value as ProviderId)}
            className={styles.select}
          >
            {providers.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.provider}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.fieldLabel}>
          Model
          <select
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            className={styles.select}
          >
            {selectedProvider.models.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        aria-label={isGenerating ? "Refining prompt" : "Refine prompt"}
        onClick={onGenerate}
        disabled={isGenerating}
        className={styles.generateButton}
      >
        {isGenerating ? <Loader2 className={styles.spinner} size={18} /> : <Wand2 size={18} />}
        {isGenerating ? "Refining" : "Generate"}
      </button>
    </div>
  );
}

export function ComposerPanel({
  inputIdea,
  onInputChange,
  provider,
  model,
  providers,
  selectedProvider,
  isGenerating,
  keyMissing,
  onProviderChange,
  onModelChange,
  onGenerate,
  onOpenSettings,
}: ComposerPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      <PanelHeader label="Module 02" title="Raw Signal" tone="fuchsia" />

      {keyMissing && (
        <div className={styles.keyWarning}>
          <span>
            No API key configured for <strong>{selectedProvider.provider}</strong>.
          </span>
          <button type="button" className={styles.keyWarningCta} onClick={onOpenSettings}>
            Open Settings
          </button>
        </div>
      )}

      <div className={styles.composerFieldWrap}>
        <textarea
          ref={textareaRef}
          id="raw-idea"
          aria-label="Raw idea"
          rows={10}
          value={inputIdea}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Ex: I want a prompt to generate a premium onboarding screen..."
          className={`${styles.ideaTextarea} ${inputIdea.length > 0 ? styles.ideaTextareaWithClear : ""}`}
        />
        {inputIdea.length > 0 && (
          <button
            type="button"
            className={styles.clearInputButton}
            aria-label="Clear raw signal"
            onClick={() => {
              onInputChange("");
              textareaRef.current?.focus();
            }}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        )}
        <ScanlineOverlay />
      </div>

      <ComposerControls
        provider={provider}
        model={model}
        selectedProvider={selectedProvider}
        providers={providers}
        isGenerating={isGenerating}
        onProviderChange={onProviderChange}
        onModelChange={onModelChange}
        onGenerate={onGenerate}
      />
    </>
  );
}
