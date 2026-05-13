import { Loader2, Wand2 } from "lucide-react";
import type { Provider, ProviderId } from "../../../shared";
import styles from "./IdeaComposer.module.css";

interface IdeaComposerProps {
  inputIdea: string;
  onInputChange: (value: string) => void;
  provider: ProviderId;
  onProviderChange: (id: ProviderId) => void;
  model: string;
  onModelChange: (value: string) => void;
  providers: Provider[];
  selectedProvider: Provider;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function IdeaComposer({
  inputIdea,
  onInputChange,
  provider,
  onProviderChange,
  model,
  onModelChange,
  providers,
  selectedProvider,
  isGenerating,
  onGenerate,
}: IdeaComposerProps) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.step}>02</span>
        <div>
          <h2>Raw idea</h2>
        </div>
      </div>

      <div className={styles.editor}>
        <div className={styles.composer}>
          <textarea
            id="raw-idea"
            aria-label="Raw idea"
            rows={8}
            value={inputIdea}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Ex: I want a prompt to generate a premium onboarding screen..."
          />

          <div className={styles.composerFooter}>
            <div className={styles.composerControls}>
              <label className={styles.field}>
                <span>Provider</span>
                <select
                  value={provider}
                  onChange={(event) => onProviderChange(event.target.value as ProviderId)}
                >
                  {providers.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.provider}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>Model</span>
                <select value={model} onChange={(event) => onModelChange(event.target.value)}>
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
              className={styles.primaryButton}
              onClick={onGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className={styles.spinner} size={18} />
              ) : (
                <Wand2 size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
