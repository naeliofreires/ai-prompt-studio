import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PROVIDERS, type Provider, type ProviderId } from "../src/shared";
import SettingsModal from "../src/ui/components/SettingsModal";

const providers = PROVIDERS.slice(0, 2) as Provider[];

function renderSettingsModal(
  overrides: Partial<React.ComponentProps<typeof SettingsModal>> = {},
) {
  const props: React.ComponentProps<typeof SettingsModal> = {
    open: true,
    providers,
    keys: {},
    onClose: vi.fn(),
    onSave: vi.fn(),
    onSaveKeys: vi.fn(),
    onClearProvider: vi.fn(),
    onClearAll: vi.fn(),
    ...overrides,
  };

  return {
    ...render(<SettingsModal {...props} />),
    props,
  };
}

describe("SettingsModal", () => {
  it("trims saved draft keys and skips empty drafts", () => {
    const { props } = renderSettingsModal();

    fireEvent.change(screen.getByLabelText("Google Gemini API Key"), {
      target: { value: "  AIzaSy-test  " },
    });
    fireEvent.change(screen.getByLabelText("GLM API Key"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(props.onSaveKeys).toHaveBeenCalledWith({ gemini: "AIzaSy-test" });
    expect(props.onSave).toHaveBeenCalledTimes(1);
  });

  it("saves and closes without writing keys when drafts are empty", () => {
    const { props } = renderSettingsModal();

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(props.onSaveKeys).not.toHaveBeenCalled();
    expect(props.onSave).toHaveBeenCalledTimes(1);
  });

  it("clears a configured provider key", () => {
    const { props } = renderSettingsModal({
      keys: { gemini: "AIzaSy-existing" },
    });

    fireEvent.click(screen.getByRole("button", { name: /remove google gemini api key/i }));

    expect(props.onClearProvider).toHaveBeenCalledWith("gemini" satisfies ProviderId);
  });

  it("requires confirmation before clearing all provider keys", () => {
    const { props } = renderSettingsModal();

    fireEvent.click(screen.getByRole("button", { name: /clear all/i }));

    expect(props.onClearAll).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /confirm clear all/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /confirm clear all/i }));

    expect(props.onClearAll).toHaveBeenCalledTimes(1);
  });

  it("toggles API key visibility", () => {
    renderSettingsModal();
    const geminiInput = screen.getByLabelText("Google Gemini API Key");

    expect(geminiInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: /show/i }));
    expect(geminiInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: /hide/i }));
    expect(geminiInput).toHaveAttribute("type", "password");
  });

  it("resets draft state and visibility when reopened", () => {
    const { rerender, props } = renderSettingsModal();

    fireEvent.change(screen.getByLabelText("Google Gemini API Key"), {
      target: { value: "AIzaSy-draft" },
    });
    fireEvent.click(screen.getByRole("button", { name: /show/i }));

    rerender(<SettingsModal {...props} open={false} />);
    rerender(<SettingsModal {...props} open />);

    expect(screen.getByLabelText("Google Gemini API Key")).toHaveValue("");
    expect(screen.getByLabelText("Google Gemini API Key")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: /clear all/i })).toBeInTheDocument();
  });
});
