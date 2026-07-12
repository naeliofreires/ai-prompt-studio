import { useRef, type ChangeEvent } from "react";
import { Loader2, Paperclip, Settings, Trash2, Wand2 } from "lucide-react";
import type { GeneratePromptPayload } from "../../../contract/ipc";
import type { Provider, ProviderId } from "../../../../providers/contract/provider";
import { PanelHeader } from "../../../../../platform/renderer/components/shared/PanelHeader";
import styles from "./ComposerPanel.module.scss";

type PromptAttachment = NonNullable<GeneratePromptPayload["attachments"]>[number];

export interface ComposerPanelProps {
  inputIdea: string;
  onInputChange: (value: string) => void;
  provider: ProviderId;
  model: string;
  providers: Provider[];
  selectedProvider: Provider;
  isGenerating: boolean;
  keyMissing: boolean;
  disabledReason?: string;
  onProviderChange: (providerId: ProviderId) => void;
  onModelChange: (model: string) => void;
  onGenerate: () => void;
  onOpenSettings: () => void;
  promptAttachments?: PromptAttachment[];
  onPromptAttachmentsChange?: (attachments: PromptAttachment[]) => void;
  onRemovePromptAttachment?: (index: number) => void;
}

const ScanlineOverlay = () => <div aria-hidden="true" className={styles.scanlineOverlay} />;

const formatAttachmentSize = (sizeBytes: number) => `${sizeBytes} B`;

const toPromptAttachmentMimeType = (mimeType: string): PromptAttachment["mimeType"] => {
  if (mimeType === "text/plain" || mimeType === "text/markdown") {
    return mimeType;
  }

  return "";
};

const readFileText = (file: File) => {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsText(file);
  });
};

function ComposerControls({
  provider,
  model,
  selectedProvider,
  providers,
  isGenerating,
  disabledReason,
  onProviderChange,
  onModelChange,
  onGenerate,
}: {
  provider: ProviderId;
  model: string;
  selectedProvider: Provider;
  providers: Provider[];
  isGenerating: boolean;
  disabledReason?: string;
  onProviderChange: (providerId: ProviderId) => void;
  onModelChange: (model: string) => void;
  onGenerate: () => void;
}) {
  const availableModels = providers.some((entry) => entry.id === provider)
    ? selectedProvider.models
    : [];

  return (
    <div className={styles.composerControls}>
      <div className={styles.controlsGrid}>
        <label className={styles.fieldLabel}>
          Provider
          <select
            value={provider}
            onChange={(event) => onProviderChange(event.target.value as ProviderId)}
            className={styles.select}
            disabled={providers.length === 0}
          >
            {providers.length > 0 ? (
              providers.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.provider}
                </option>
              ))
            ) : (
              <option value={provider}>No API keys saved</option>
            )}
          </select>
        </label>

        <label className={styles.fieldLabel}>
          Model
          <select
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            className={styles.select}
            disabled={availableModels.length === 0}
          >
            {availableModels.length > 0 ? (
              availableModels.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))
            ) : (
              <option value="">Save an API key first</option>
            )}
          </select>
        </label>
      </div>

      <button
        type="button"
        aria-label={isGenerating ? "Refining prompt" : "Refine prompt"}
        onClick={onGenerate}
        disabled={isGenerating || Boolean(disabledReason)}
        className={styles.generateButton}
      >
        {isGenerating ? <Loader2 className={styles.spinner} size={18} /> : <Wand2 size={18} />}
        {isGenerating ? "Refining" : "Generate"}
      </button>
    </div>
  );
}

export function ComposerPanel({
  inputIdea,
  onInputChange,
  provider,
  model,
  providers,
  selectedProvider,
  isGenerating,
  keyMissing,
  disabledReason,
  onProviderChange,
  onModelChange,
  onGenerate,
  onOpenSettings,
  promptAttachments = [],
  onPromptAttachmentsChange,
  onRemovePromptAttachment,
}: ComposerPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachmentLimitReached = promptAttachments.length >= 5;
  const handleAttachmentChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.currentTarget.files ?? []);
    const filesToAttach = selectedFiles.slice(0, 5 - promptAttachments.length);

    if (!onPromptAttachmentsChange || filesToAttach.length === 0) {
      return;
    }

    const attachments = await Promise.all(
      filesToAttach.map(async (file) => ({
        name: file.name,
        mimeType: toPromptAttachmentMimeType(file.type),
        sizeBytes: file.size,
        content: await readFileText(file),
      })),
    );

    onPromptAttachmentsChange([...promptAttachments, ...attachments]);
  };

  return (
    <>
      <PanelHeader
        label="Module 02"
        title="Raw Signal"
        tone="fuchsia"
        action={
          <button
            type="button"
            className={styles.settingsButton}
            aria-label="Settings"
            title="Settings"
            onClick={onOpenSettings}
          >
            <Settings size={16} aria-hidden="true" />
          </button>
        }
      />

      {keyMissing && (
        <div className={styles.keyWarning}>
          <span>
            No API key configured for <strong>{selectedProvider.provider}</strong>.
          </span>
          <button type="button" className={styles.keyWarningCta} onClick={onOpenSettings}>
            Open Settings
          </button>
        </div>
      )}

      {disabledReason && (
        <div className={styles.disabledWarning} role="status">
          {disabledReason}
        </div>
      )}

      <div className={styles.composerFieldWrap}>
        <textarea
          ref={textareaRef}
          id="raw-idea"
          aria-label="Raw idea"
          rows={10}
          value={inputIdea}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Ex: I want a prompt to generate a premium onboarding screen..."
          className={`${styles.ideaTextarea} ${inputIdea.length > 0 ? styles.ideaTextareaWithClear : ""}`}
        />
        {inputIdea.length > 0 && (
          <button
            type="button"
            className={styles.clearInputButton}
            aria-label="Clear raw signal"
            onClick={() => {
              onInputChange("");
              textareaRef.current?.focus();
            }}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        )}
        <ScanlineOverlay />
      </div>

      <label className={styles.attachmentPicker}>
        <Paperclip size={16} aria-hidden="true" />
        <span>Attach files</span>
        <input
          aria-label="Attach files"
          type="file"
          accept=".md"
          multiple
          className={styles.attachmentInput}
          disabled={attachmentLimitReached}
          onChange={handleAttachmentChange}
        />
      </label>

      {promptAttachments.length > 0 && (
        <ul className={styles.attachmentList}>
          {promptAttachments.map((attachment, index) => (
            <li key={attachment.name} className={styles.attachmentItem}>
              <span>{attachment.name}</span>
              <span>{formatAttachmentSize(attachment.sizeBytes)}</span>
              {onRemovePromptAttachment && (
                <button
                  type="button"
                  className={styles.attachmentRemoveButton}
                  aria-label={`Remove ${attachment.name}`}
                  onClick={() => onRemovePromptAttachment(index)}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <ComposerControls
        provider={provider}
        model={model}
        selectedProvider={selectedProvider}
        providers={providers}
        isGenerating={isGenerating}
        disabledReason={disabledReason}
        onProviderChange={onProviderChange}
        onModelChange={onModelChange}
        onGenerate={onGenerate}
      />
    </>
  );
}
