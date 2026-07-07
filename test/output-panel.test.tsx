import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OutputPanel } from "../apps/promptizer/ui/components/OutputPanel";
import type { PromtizerResponse } from "../apps/promptizer/ui/types/api";

const structuredResponse: PromtizerResponse = {
  title: "Refined Prompt",
  description: "A concise prompt for a todo app.",
  requirements: ["Must include CRUD operations."],
  expectations: "The assistant should provide a complete implementation plan.",
  goodToGo: true,
};

describe("OutputPanel", () => {
  it("shows token usage when generation returns tokens", () => {
    render(
      <OutputPanel
        outputPrompt={JSON.stringify(structuredResponse, null, 2)}
        promtizerResponse={structuredResponse}
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
        outputPrompt={JSON.stringify(structuredResponse, null, 2)}
        promtizerResponse={structuredResponse}
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

  it("keeps prompt evaluation collapsed until the toggle is opened", () => {
    render(
      <OutputPanel
        outputPrompt={JSON.stringify(structuredResponse, null, 2)}
        promtizerResponse={structuredResponse}
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

    const toggle = screen.getByRole("button", { name: /show prompt score/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Prompt score")).not.toBeVisible();

    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: /hide prompt score/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("Prompt score")).toBeInTheDocument();
    expect(screen.getByText("4/5")).toBeInTheDocument();
    expect(screen.getByText("Clear prompt with a focused goal.")).toBeInTheDocument();
    expect(screen.getByText("Add input constraints.")).toBeInTheDocument();
    expect(screen.getByText("Specify the output format.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /hide prompt score/i }));

    expect(screen.getByRole("button", { name: /show prompt score/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByText("Prompt score")).not.toBeVisible();
  });
});
