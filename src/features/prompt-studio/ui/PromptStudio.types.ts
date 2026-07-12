import type { GeneratePromptPayload } from "../../../features/prompt-generation/contract/ipc";
import type { Provider, ProviderId } from "../../../features/providers/contract/provider";
import type { PromtizerResponse } from "../../../features/prompt-generation/ui/types/api";
import type {
  GenerationEvaluation,
  GenerationUsage,
} from "../../../features/prompt-generation/ui/types/generation";
import type { Role } from "../../../features/personas/ui/role";

export type PromptAttachment = NonNullable<GeneratePromptPayload["attachments"]>[number];

export type PromptizerView = "studio" | "personas";

export interface PromptStudioPersonaState {
  roles: Role[];
  activeRole: string;
  isLoading: boolean;
  loadError: string;
  actionError: string;
  onSelect: (id: string) => void;
  onManagePersonas: () => void;
}

export interface PromptStudioComposerState {
  inputIdea: string;
  onInputChange: (value: string) => void;
  provider: ProviderId;
  model: string;
  providers: Provider[];
  selectedProvider: Provider;
  isGenerating: boolean;
  keyMissing: boolean;
  disabledReason: string;
  onProviderChange: (providerId: ProviderId) => void;
  onModelChange: (model: string) => void;
  onGenerate: () => void;
  onOpenSettings: () => void;
  promptAttachments: PromptAttachment[];
  onPromptAttachmentsChange: (attachments: PromptAttachment[]) => void;
  onRemovePromptAttachment: (index: number) => void;
}

export interface PromptStudioOutputState {
  outputPrompt: string;
  promtizerResponse: PromtizerResponse | null;
  outputIsError: boolean;
  generationError: string;
  isGenerating: boolean;
  isCopied: boolean;
  usage: GenerationUsage | null;
  evaluation: GenerationEvaluation | null;
  onCopy: () => void;
}

export interface PromptStudioPersonasState {
  roles: Role[];
  activeRole: string;
  isLoading: boolean;
  loadError: string;
  actionError: string;
  onSelect: (id: string) => void;
  onCreate: (title: string, description: string) => Promise<unknown>;
  onUpdate: (id: string, patch: { title: string; description: string }) => Promise<unknown>;
  onDelete: (id: string) => Promise<boolean>;
}

export interface PromptStudioSettingsState {
  open: boolean;
  providers: Provider[];
  keys: Partial<Record<ProviderId, string>>;
  onClose: () => void;
  onSave: () => void;
  onSaveKeys: (patch: Partial<Record<ProviderId, string>>) => void;
  onClearProvider: (id: ProviderId) => void;
  onClearAll: () => void;
}

export interface PromptStudioScreenProps {
  view: PromptizerView;
  onShowStudio: () => void;
  onShowPersonas: () => void;
  persona: PromptStudioPersonaState;
  composer: PromptStudioComposerState;
  output: PromptStudioOutputState;
  personasPage: PromptStudioPersonasState;
  settingsModal: PromptStudioSettingsState;
}
