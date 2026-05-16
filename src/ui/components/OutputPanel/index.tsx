import { Check, Clipboard, Terminal } from "lucide-react";
import type { GenerationEvaluation } from "../../types/generation";
import { PanelHeader } from "../shared/PanelHeader";
import { StreamingMarkdown } from "../StreamingMarkdown";
import styles from "./OutputPanel.module.scss";

export interface OutputPanelProps {
  outputPrompt: string;
  outputIsError: boolean;
  generationError: string;
  isGenerating: boolean;
  isCopied: boolean;
  evaluation: GenerationEvaluation | null;
  onCopy: () => void;
}

function ErrorHeader() {
  return (
    <div className={styles.errorHeader}>
      <Terminal size={14} />
      <span>Terminal Error</span>
    </div>
  );
}

export function OutputPanel({
  outputPrompt,
  outputIsError,
  generationError,
  isGenerating,
  isCopied,
  evaluation,
  onCopy,
}: OutputPanelProps) {
  return (
    <>
      <PanelHeader
        label="Module 03"
        title="Refined Stream"
        action={
          <button
            type="button"
            onClick={onCopy}
            disabled={!outputPrompt}
            className={[styles.copyButton, isCopied ? styles.copyButtonCopied : ""].join(" ")}
          >
            {isCopied ? <Check size={14} /> : <Clipboard size={14} />}
            {isCopied ? "Copied" : "Copy"}
          </button>
        }
      />

      <div
        className={[
          styles.outputContent,
          outputIsError
            ? styles.outputContentError
            : outputPrompt
              ? styles.outputContentFilled
              : styles.outputContentEmpty,
        ].join(" ")}
      >
        {outputIsError ? (
          <div className={styles.errorBlock}>
            <ErrorHeader />
            <p className={styles.preWrap}>{generationError}</p>
          </div>
        ) : outputPrompt ? (
          <>
            <StreamingMarkdown content={outputPrompt} isStreaming={isGenerating} />
            {isGenerating ? <span className={styles.pulseCursor} /> : null}
          </>
        ) : (
          <div className={styles.emptyState}>
            <Terminal size={40} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Waiting For Refinement</h3>
            <p className={styles.emptyCopy}>
              The refined prompt will appear here with terminal-style preserved spacing.
            </p>
          </div>
        )}
      </div>

      {evaluation && (
        <footer className={styles.evalFooter}>
          <div>
            <span className={styles.evalLabel}>API response</span>
            <p className={styles.evalValue}>
              {evaluation.tokensUsed === undefined ? "OK" : evaluation.tokensUsed}
            </p>
          </div>
          <p className={styles.evalCaption}>
            {evaluation.tokensUsed === undefined
              ? "Prompt refined by the API."
              : "Tokens used during generation."}
          </p>
        </footer>
      )}
    </>
  );
}
