import { Check, Clipboard, Terminal } from "lucide-react";
import styles from "./OutputPanel.module.css";

interface Evaluation {
  tokensUsed?: number;
}

interface OutputPanelProps {
  outputPrompt: string;
  isCopied: boolean;
  onCopy: () => void;
  evaluation: Evaluation | null;
  generationError: string;
}

export function OutputPanel({
  outputPrompt,
  isCopied,
  onCopy,
  evaluation,
  generationError,
}: OutputPanelProps) {
  return (
    <section className={styles.outputPanel}>
      <div className={styles.outputHeader}>
        <div>
          <p className={styles.eyebrow}>Output Studio</p>
          <h2>Refined prompt</h2>
        </div>
        <button
          type="button"
          className={isCopied ? styles.copyButtonSuccess : styles.copyButton}
          onClick={onCopy}
          disabled={!outputPrompt}
        >
          {isCopied ? <Check size={16} /> : <Clipboard size={16} />}
          {isCopied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className={outputPrompt ? styles.terminal : styles.placeholder}>
        {outputPrompt ? (
          <pre>{outputPrompt}</pre>
        ) : (
          <div className={styles.emptyState}>
            <Terminal size={42} />
            <h3>Waiting for refinement</h3>
            <p>The refined prompt will appear here with terminal-style preserved spacing.</p>
          </div>
        )}
      </div>

      {evaluation && (
        <footer className={styles.evaluation}>
          <div>
            <span>API response</span>
            <strong>
              {evaluation.tokensUsed === undefined ? "OK" : evaluation.tokensUsed}
            </strong>
          </div>
          <p>
            {evaluation.tokensUsed === undefined
              ? "Prompt refined by the API."
              : "Tokens used during generation."}
          </p>
        </footer>
      )}

      {generationError && (
        <footer className={styles.errorMessage}>
          <div>
            <span>Error</span>
            <strong>API</strong>
          </div>
          <p>{generationError}</p>
        </footer>
      )}
    </section>
  );
}
