import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCopyWithFeedback } from "../src/features/prompt-generation/ui/hooks/useCopyWithFeedback";

describe("useCopyWithFeedback", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    writeText.mockReset();
  });

  it("writes text to the clipboard and resets copied feedback after the timer", async () => {
    const { result } = renderHook(() => useCopyWithFeedback(250));

    await act(async () => {
      await result.current.copyText("Refined prompt");
    });

    expect(writeText).toHaveBeenCalledWith("Refined prompt");
    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(249);
    });
    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isCopied).toBe(false);
  });

  it("ignores empty copy requests", async () => {
    const { result } = renderHook(() => useCopyWithFeedback(250));

    await act(async () => {
      await result.current.copyText("");
    });

    expect(writeText).not.toHaveBeenCalled();
    expect(result.current.isCopied).toBe(false);
  });

  it("supports manually resetting copied feedback", async () => {
    const { result } = renderHook(() => useCopyWithFeedback(250));

    await act(async () => {
      await result.current.copyText("Refined prompt");
    });

    act(() => {
      result.current.resetCopied();
    });

    expect(result.current.isCopied).toBe(false);

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current.isCopied).toBe(false);
  });
});
