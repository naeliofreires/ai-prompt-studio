import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ComposerPanel } from "../apps/promptizer/ui/components/ComposerPanel";
import type { Provider } from "../apps/promptizer/shared";

const geminiProvider = {
  id: "gemini",
  provider: "Google Gemini",
  models: ["gemini-2.5-pro"],
} satisfies Provider;

describe("ComposerPanel", () => {
  it("opens settings from the composer panel action", () => {
    const onOpenSettings = vi.fn();

    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={onOpenSettings}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /settings/i }));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it("disables generate and shows persona guidance when persona state blocks generation", () => {
    const onGenerate = vi.fn();

    render(
      <ComposerPanel
        inputIdea="Build a todo app"
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        disabledReason="Create or select a persona before generating."
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={onGenerate}
        onOpenSettings={vi.fn()}
      />,
    );

    expect(screen.getByText("Create or select a persona before generating.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refine prompt/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /refine prompt/i }));
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it('1. appends a newly selected markdown file to current prompt attachments ', () => {
    const onPromptAttachmentsChange = vi.fn();
    const existingAttachment = {
      name: "existing.md",
      mimeType: "",
      sizeBytes: 18,
      content: "# Existing notes",
    };
    const content = "# New notes\n\nUse this as extra context.";
    const file = new File([content], "new-notes.md", { type: "" });

    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={vi.fn()}
        promptAttachments={[existingAttachment]}
        onPromptAttachmentsChange={onPromptAttachmentsChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/attach files/i), { target: { files: [file] } });

    return waitFor(() => {
      expect(onPromptAttachmentsChange).toHaveBeenCalledWith([
        existingAttachment,
        {
          name: "new-notes.md",
          mimeType: "",
          sizeBytes: file.size,
          content,
        },
      ]);
    });
  });

  it('2. appends multiple selected markdown files without replacing existing attachments ', () => {
    const onPromptAttachmentsChange = vi.fn();
    const existingAttachment = {
      name: "existing.md",
      mimeType: "",
      sizeBytes: 18,
      content: "# Existing notes",
    };
    const firstContent = "# First new notes\n\nUse this first.";
    const secondContent = "# Second new notes\n\nUse this second.";
    const firstFile = new File([firstContent], "first-new-notes.md", { type: "" });
    const secondFile = new File([secondContent], "second-new-notes.md", { type: "" });

    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={vi.fn()}
        promptAttachments={[existingAttachment]}
        onPromptAttachmentsChange={onPromptAttachmentsChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/attach files/i), {
      target: { files: [firstFile, secondFile] },
    });

    return waitFor(() => {
      expect(onPromptAttachmentsChange).toHaveBeenCalledWith([
        existingAttachment,
        {
          name: "first-new-notes.md",
          mimeType: "",
          sizeBytes: firstFile.size,
          content: firstContent,
        },
        {
          name: "second-new-notes.md",
          mimeType: "",
          sizeBytes: secondFile.size,
          content: secondContent,
        },
      ]);
    });
  });

  it('3. shows every selected markdown attachment in the composer list ', () => {
    const attachments = [
      {
        name: "research-notes.md",
        mimeType: "text/markdown",
        sizeBytes: 18,
        content: "# Research notes",
      },
      {
        name: "brand-voice.md",
        mimeType: "text/markdown",
        sizeBytes: 42,
        content: "# Brand voice",
      },
      {
        name: "constraints.md",
        mimeType: "text/markdown",
        sizeBytes: 64,
        content: "# Constraints",
      },
    ];

    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={vi.fn()}
        promptAttachments={attachments}
      />,
    );

    attachments.forEach((attachment) => {
      expect(screen.getByText(attachment.name)).toBeInTheDocument();
      expect(screen.getByText(`${attachment.sizeBytes} B`)).toBeInTheDocument();
    });
  });

  it('4. limits appended markdown attachments to five total files ', () => {
    const onPromptAttachmentsChange = vi.fn();
    const existingAttachments = [
      {
        name: "existing-one.md",
        mimeType: "text/markdown",
        sizeBytes: 18,
        content: "# Existing one",
      },
      {
        name: "existing-two.md",
        mimeType: "text/markdown",
        sizeBytes: 24,
        content: "# Existing two",
      },
      {
        name: "existing-three.md",
        mimeType: "text/markdown",
        sizeBytes: 32,
        content: "# Existing three",
      },
      {
        name: "existing-four.md",
        mimeType: "text/markdown",
        sizeBytes: 42,
        content: "# Existing four",
      },
    ];
    const firstContent = "# First new notes";
    const secondContent = "# Second new notes";
    const firstFile = new File([firstContent], "first-new-notes.md", { type: "" });
    const secondFile = new File([secondContent], "second-new-notes.md", { type: "" });

    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={vi.fn()}
        promptAttachments={existingAttachments}
        onPromptAttachmentsChange={onPromptAttachmentsChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/attach files/i), {
      target: { files: [firstFile, secondFile] },
    });

    return waitFor(() => {
      expect(onPromptAttachmentsChange).toHaveBeenCalledWith([
        ...existingAttachments,
        {
          name: "first-new-notes.md",
          mimeType: "",
          sizeBytes: firstFile.size,
          content: firstContent,
        },
      ]);
    });
  });

  it('5. disables the attach file control when five attachments are selected ', () => {
    const attachments = [
      {
        name: "one.md",
        mimeType: "text/markdown",
        sizeBytes: 18,
        content: "# One",
      },
      {
        name: "two.md",
        mimeType: "text/markdown",
        sizeBytes: 24,
        content: "# Two",
      },
      {
        name: "three.md",
        mimeType: "text/markdown",
        sizeBytes: 32,
        content: "# Three",
      },
      {
        name: "four.md",
        mimeType: "text/markdown",
        sizeBytes: 42,
        content: "# Four",
      },
      {
        name: "five.md",
        mimeType: "text/markdown",
        sizeBytes: 52,
        content: "# Five",
      },
    ];

    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={vi.fn()}
        promptAttachments={attachments}
      />,
    );

    expect(screen.getByLabelText(/attach files/i)).toBeDisabled();
  });

  it('6. re-enables the attach file control after removing an attachment below the limit ', () => {
    const attachments = [
      {
        name: "one.md",
        mimeType: "text/markdown",
        sizeBytes: 18,
        content: "# One",
      },
      {
        name: "two.md",
        mimeType: "text/markdown",
        sizeBytes: 24,
        content: "# Two",
      },
      {
        name: "three.md",
        mimeType: "text/markdown",
        sizeBytes: 32,
        content: "# Three",
      },
      {
        name: "four.md",
        mimeType: "text/markdown",
        sizeBytes: 42,
        content: "# Four",
      },
    ];

    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={vi.fn()}
        promptAttachments={attachments}
      />,
    );

    expect(screen.getByLabelText(/attach files/i)).not.toBeDisabled();
  });

  it('7. renders a markdown-only attachment picker in the composer ', () => {
    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    );

    const attachmentPicker = screen.getByLabelText(/attach files/i);

    expect(attachmentPicker).toBeInstanceOf(HTMLInputElement);
    expect(attachmentPicker).toHaveAttribute("type", "file");
    expect(attachmentPicker).toHaveProperty("multiple", true);
    expect(attachmentPicker).toHaveAttribute("accept", ".md");
  });

  it('8. reads selected markdown files into prompt attachments ', () => {
    const onPromptAttachmentsChange = vi.fn();
    const content = "# Notes\n\nUse this as context.";
    const file = new File([content], "notes.md", { type: "" });

    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={vi.fn()}
        onPromptAttachmentsChange={onPromptAttachmentsChange}
      />,
    );

    const input = screen.getByLabelText(/attach files/i);

    fireEvent.change(input, { target: { files: [file] } });

    return waitFor(() => {
      expect(onPromptAttachmentsChange).toHaveBeenCalledWith([
        {
          name: "notes.md",
          mimeType: "",
          sizeBytes: file.size,
          content,
        },
      ]);
    });
  });

  it('8. renders an accessible attachment picker in the composer ', () => {
    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    );

    const attachmentPicker = screen.getByLabelText(/attach files/i);

    expect(attachmentPicker).toBeInstanceOf(HTMLInputElement);
    expect(attachmentPicker).toHaveAttribute("type", "file");
    expect(attachmentPicker).toHaveProperty("multiple", true);
  });

  it('9. shows selected attachment metadata in the composer ', () => {
    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={vi.fn()}
        promptAttachments={[
          {
            name: "notes.txt",
            mimeType: "text/plain",
            sizeBytes: 42,
            content: "Use this as context.",
          },
        ]}
      />,
    );

    expect(screen.getByText(/notes\.txt/i)).toBeInTheDocument();
    expect(screen.getByText(/42 B/i)).toBeInTheDocument();
  });

  it('10. removes an attachment before generation ', () => {
    const onRemovePromptAttachment = vi.fn();

    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={vi.fn()}
        promptAttachments={[
          {
            name: "notes.txt",
            mimeType: "text/plain",
            sizeBytes: 42,
            content: "Use this as context.",
          },
        ]}
        onRemovePromptAttachment={onRemovePromptAttachment}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /remove notes\.txt/i }));

    expect(onRemovePromptAttachment).toHaveBeenCalledWith(0);
  });

  it('14. reads selected text files into prompt attachments ', () => {
    const onPromptAttachmentsChange = vi.fn();
    const file = new File(["Use this as context."], "notes.txt", { type: "text/plain" });

    render(
      <ComposerPanel
        inputIdea=""
        onInputChange={vi.fn()}
        provider="gemini"
        model="gemini-2.5-pro"
        providers={[geminiProvider]}
        selectedProvider={geminiProvider}
        isGenerating={false}
        keyMissing={false}
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        onGenerate={vi.fn()}
        onOpenSettings={vi.fn()}
        onPromptAttachmentsChange={onPromptAttachmentsChange}
      />,
    );

    const input = screen.getByLabelText(/attach files/i);

    fireEvent.change(input, { target: { files: [file] } });

    return waitFor(() => {
      expect(onPromptAttachmentsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            name: "notes.txt",
            mimeType: "text/plain",
            sizeBytes: file.size,
            content: "Use this as context.",
          },
        ]),
      );
    });
  });
});
