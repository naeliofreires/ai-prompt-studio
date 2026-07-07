import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/ui/app/App";

describe("App hub", () => {
  it("renders the Promptizer app from the side app menu", () => {
    render(<App />);

    expect(screen.getByRole("navigation", { name: "Aplicativos" })).toBeInTheDocument();

    const promptizerButton = screen.getByRole("button", { name: /Promptizer/i });
    const promptizerMenuIcon = promptizerButton.querySelector('img[src="./icon.svg"]');

    expect(promptizerButton).toHaveAttribute("aria-current", "page");
    expect(promptizerMenuIcon).toBeInTheDocument();
    expect(promptizerMenuIcon).toHaveAttribute("alt", "");
    expect(promptizerMenuIcon).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("heading", { name: /AI Prompt Studio/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Persona Matrix" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Raw Signal" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Settings$/i }));

    expect(screen.getByRole("dialog", { name: "Settings" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close settings" }));
  });
});
