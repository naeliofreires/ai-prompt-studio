import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/ui/app/App";

describe("App hub", () => {
  it("renders a side app menu and switches from Promptizer to GH Review", () => {
    render(<App />);

    expect(screen.getByRole("navigation", { name: "Aplicativos" })).toBeInTheDocument();

    const promptizerButton = screen.getByRole("button", { name: /Promptizer/i });
    const ghReviewButton = screen.getByRole("button", { name: /GH Review/i });
    const promptizerMenuIcon = promptizerButton.querySelector('img[src="/icon.svg"]');

    expect(promptizerButton).toHaveAttribute("aria-current", "page");
    expect(promptizerMenuIcon).toBeInTheDocument();
    expect(promptizerMenuIcon).toHaveAttribute("alt", "");
    expect(promptizerMenuIcon).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("heading", { name: /AI Prompt Studio/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Persona Matrix" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Raw Signal" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Settings$/i }));

    expect(screen.getByRole("dialog", { name: "Settings" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close settings" }));

    fireEvent.click(ghReviewButton);

    expect(ghReviewButton).toHaveAttribute("aria-current", "page");
    expect(promptizerButton).not.toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { name: "GH Review" })).toBeInTheDocument();

    const usernameField = screen.getByLabelText("GitHub username");
    const tokenField = screen.getByLabelText("Access token");

    expect(usernameField).toHaveAttribute("type", "text");
    expect(tokenField).toHaveAttribute("type", "password");

    fireEvent.change(usernameField, { target: { value: "octocat" } });
    fireEvent.change(tokenField, { target: { value: "ghp_mocked_token" } });

    expect(usernameField).toHaveValue("octocat");
    expect(tokenField).toHaveValue("ghp_mocked_token");
  });
});
