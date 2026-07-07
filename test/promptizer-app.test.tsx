import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromptizerApp } from "../src/renderer/app/PromptizerApp";

describe("Promptizer app", () => {
  it("renders the Promptizer prompt studio directly", () => {
    render(<PromptizerApp />);

    expect(screen.getByRole("heading", { name: /AI Prompt Studio/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Persona Matrix" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Raw Signal" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Settings$/i }));

    expect(screen.getByRole("dialog", { name: "Settings" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close settings" }));
  });
});
