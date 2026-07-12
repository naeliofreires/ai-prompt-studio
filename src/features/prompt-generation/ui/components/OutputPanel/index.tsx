import { useEffect, useId, useState } from "react";
import { Check, Clipboard, Terminal } from "lucide-react";
import type { PromtizerResponse } from "../../types/api";
import type { GenerationEvaluation, GenerationUsage } from "../../types/generation";
import { ResponseCard } from "../ResponseCard";
import { PanelHeader } from "../../../../../platform/renderer/components/shared/PanelHeader";
import { StreamingMarkdown } from "../StreamingMarkdown";
import styles from "./OutputPanel.module.scss";

export interface OutputPanelProps {
  outputPrompt: string;
  promtizerResponse: PromtizerResponse | null;
  outputIsError: boolean;
  generationError: string;
  isGenerating: boolean;
  isCopied: boolean;
  usage: GenerationUsage | null;
  evaluation: GenerationEvaluation | null;
  evaluationWarning: string;
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
  promtizerResponse,
  outputIsError,
  generationError,
  isGenerating,
  isCopied,
  usage,
  evaluation,
  evaluationWarning,
  onCopy,
}: OutputPanelProps) {
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const evaluationPanelId = useId();

  useEffect(() => {
    if (evaluation) {
      setIsEvaluationOpen(false);
    }
  }, [evaluation]);

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
            : promtizerResponse || outputPrompt
              ? styles.outputContentFilled
              : styles.outputContentEmpty,
        ].join(" ")}
      >
        {outputIsError ? (
          <div className={styles.errorBlock}>
            <ErrorHeader />
            <p className={styles.preWrap}>{generationError}</p>
          </div>
        ) : promtizerResponse ? (
          <ResponseCard response={promtizerResponse} />
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

      {usage && (
        <footer className={styles.usageFooter}>
          <div>
            <span className={styles.usageLabel}>API response</span>
            <p className={styles.usageValue}>
              {usage.tokensUsed === undefined ? "OK" : usage.tokensUsed}
            </p>
          </div>
          <p className={styles.usageCaption}>
            {usage.tokensUsed === undefined
              ? "Prompt refined by the API."
              : "Tokens used during generation."}
          </p>
        </footer>
      )}

      {evaluation && (
        <div className={styles.evaluationDisclosure}>
          <button
            type="button"
            className={styles.evaluationToggle}
            aria-expanded={isEvaluationOpen}
            aria-controls={evaluationPanelId}
            onClick={() => setIsEvaluationOpen((current) => !current)}
          >
            {isEvaluationOpen ? "Hide prompt score" : "Show prompt score"}
          </button>

          <section
            id={evaluationPanelId}
            className={styles.evaluationPanel}
            aria-label="Prompt evaluation"
            hidden={!isEvaluationOpen}
          >
            <div className={styles.evaluationHeader}>
              <span className={styles.evaluationLabel}>Prompt score</span>
              <strong className={styles.evaluationScore}>{evaluation.score}/5</strong>
            </div>
            <p className={styles.evaluationSummary}>{evaluation.summary}</p>
            {evaluation.suggestions.length > 0 && (
              <ul className={styles.evaluationSuggestions}>
                {evaluation.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
      {evaluationWarning && <p className={styles.evaluationWarning}>{evaluationWarning}</p>}
    </>
  );
}
