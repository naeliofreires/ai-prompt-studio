import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OutputPanel } from "../apps/promptizer/ui/components/OutputPanel";

describe("OutputPanel", () => {
  it("shows token usage when generation returns tokens", () => {
    render(
      <OutputPanel
        outputPrompt="Refined prompt"
        outputIsError={false}
        generationError=""
        isGenerating={false}
        isCopied={false}
        usage={{ tokensUsed: 42 }}
        evaluation={null}
        onCopy={vi.fn()}
      />,
    );

    expect(screen.getByText("API response")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Tokens used during generation.")).toBeInTheDocument();
  });

  it("does not show evaluation copy when only token usage exists", () => {
    render(
      <OutputPanel
        outputPrompt="Refined prompt"
        outputIsError={false}
        generationError=""
        isGenerating={false}
        isCopied={false}
        usage={{ tokensUsed: 42 }}
        evaluation={null}
        onCopy={vi.fn()}
      />,
    );

    expect(screen.queryByText(/score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/feedback/i)).not.toBeInTheDocument();
  });

  it("AC11 shows prompt evaluation when generation returns feedback", () => {
    render(
      <OutputPanel
        outputPrompt="Refined prompt"
        outputIsError={false}
        generationError=""
        isGenerating={false}
        isCopied={false}
        usage={{ tokensUsed: 42 }}
        evaluation={{
          score: 4,
          summary: "Clear prompt with a focused goal.",
          suggestions: ["Add input constraints.", "Specify the output format."],
        }}
        onCopy={vi.fn()}
      />,
    );

    expect(screen.getByText("Prompt score")).toBeInTheDocument();
    expect(screen.getByText("4/5")).toBeInTheDocument();
    expect(screen.getByText("Clear prompt with a focused goal.")).toBeInTheDocument();
    expect(screen.getByText("Add input constraints.")).toBeInTheDocument();
    expect(screen.getByText("Specify the output format.")).toBeInTheDocument();
  });
});
