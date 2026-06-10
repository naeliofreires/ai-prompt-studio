import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_FEEDBACK_MS = 2000;

/**
 * Copies text to the clipboard and shows transient "copied" feedback.
 */
export function useCopyWithFeedback(durationMs = DEFAULT_FEEDBACK_MS) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const resetCopied = useCallback(() => {
    clearTimer();
    setIsCopied(false);
  }, [clearTimer]);

  const copyText = useCallback(
    async (text: string) => {
      if (!text) return;
      await navigator.clipboard.writeText(text);
      clearTimer();
      setIsCopied(true);
      timeoutRef.current = window.setTimeout(() => {
        setIsCopied(false);
        timeoutRef.current = null;
      }, durationMs);
    },
    [clearTimer, durationMs],
  );

  return { isCopied, copyText, resetCopied };
}
