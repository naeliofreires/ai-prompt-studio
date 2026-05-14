import { startTransition, useCallback, useEffect, useRef, useState } from "react";

export function useStreamedMarkdown() {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setText("");
    setError(null);
    setIsStreaming(false);
  }, []);

  const append = useCallback((chunk: string) => {
    startTransition(() => {
      setText((prev) => prev + chunk);
    });
  }, []);

  const consume = useCallback(
    async (source: AsyncIterable<string> | ReadableStream<string>, signal?: AbortSignal) => {
      reset();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      try {
        if (typeof (source as ReadableStream<string>).getReader === "function") {
          const reader = (source as ReadableStream<string>).getReader();
          const cancelReader = () => {
            void reader.cancel().catch(() => undefined);
          };

          try {
            controller.signal.addEventListener("abort", cancelReader, { once: true });
            signal?.addEventListener("abort", cancelReader, { once: true });

            if (controller.signal.aborted || signal?.aborted) {
              cancelReader();
            }

            while (true) {
              const { done, value } = await reader.read();
              if (done || controller.signal.aborted || signal?.aborted) break;
              if (value) append(value);
            }
          } finally {
            controller.signal.removeEventListener("abort", cancelReader);
            signal?.removeEventListener("abort", cancelReader);
            reader.releaseLock();
          }
        } else {
          for await (const chunk of source as AsyncIterable<string>) {
            if (controller.signal.aborted || signal?.aborted) break;
            append(chunk);
          }
        }
      } catch (err) {
        if (!controller.signal.aborted && !signal?.aborted) {
          setError(err instanceof Error ? err.message : "Stream failed.");
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsStreaming(false);
        }
      }
    },
    [append, reset],
  );

  useEffect(() => () => abortRef.current?.abort(), []);

  return { text, isStreaming, error, append, reset, consume };
}
