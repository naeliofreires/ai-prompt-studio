import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useStreamedMarkdown } from "../apps/promptizer/ui/hooks/useStreamedMarkdown";

describe("useStreamedMarkdown", () => {
  it("cancels a readable stream and releases the reader lock when aborted", async () => {
    let cancelCalls = 0;
    const abortController = new AbortController();
    const stream = new ReadableStream<string>({
      cancel() {
        cancelCalls += 1;
      },
    });
    const { result } = renderHook(() => useStreamedMarkdown());

    let consumePromise: Promise<void>;
    act(() => {
      consumePromise = result.current.consume(stream, abortController.signal);
    });

    await waitFor(() => expect(result.current.isStreaming).toBe(true));
    expect(stream.locked).toBe(true);

    await act(async () => {
      abortController.abort();
      await consumePromise;
    });

    expect(cancelCalls).toBe(1);
    expect(stream.locked).toBe(false);
    expect(result.current.isStreaming).toBe(false);
  });

  it("does not let an older consume cleanup stop a newer consume operation", async () => {
    let releaseFirstCancel: (() => void) | undefined;
    const firstCancelPromise = new Promise<void>((resolve) => {
      releaseFirstCancel = resolve;
    });
    const firstStream = new ReadableStream<string>({
      cancel() {
        return firstCancelPromise;
      },
    });
    const secondAbortController = new AbortController();
    const secondStream = new ReadableStream<string>();
    const { result } = renderHook(() => useStreamedMarkdown());

    let firstConsumePromise: Promise<void>;
    act(() => {
      firstConsumePromise = result.current.consume(firstStream);
    });
    await waitFor(() => expect(result.current.isStreaming).toBe(true));

    let secondConsumePromise: Promise<void>;
    act(() => {
      secondConsumePromise = result.current.consume(secondStream, secondAbortController.signal);
    });

    await waitFor(() => expect(secondStream.locked).toBe(true));

    await act(async () => {
      releaseFirstCancel?.();
      await firstConsumePromise;
    });

    expect(result.current.isStreaming).toBe(true);

    await act(async () => {
      secondAbortController.abort();
      await secondConsumePromise;
    });
  });
});
