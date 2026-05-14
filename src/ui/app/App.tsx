import {
  Check,
  Clipboard,
  Layout,
  Loader2,
  Palette,
  Plus,
  Server,
  Sparkles,
  Terminal,
  Trash2,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "../components/Header";
import RoleModal from "../components/RoleModal";
import RoleViewModal from "../components/RoleViewModal";
import SettingsModal from "../components/SettingsModal";
import { StreamingMarkdown } from "../components/StreamingMarkdown";
import { useRoles } from "../hooks/useRoles";
import type { Role } from "../types/role";
import { promptStudioClient } from "../api/prompt-studio-client";
import { PERSONA_IDS, PROVIDERS, type PersonaId, type ProviderId } from "../../shared";
import { useApiKeyStore, isProviderConfigured } from "../store/api-key-store";
import styles from "./App.module.scss";

type Evaluation = {
  tokensUsed?: number;
};

const ROLE_ICON_MAP: Record<PersonaId, LucideIcon> = {
  frontend: Layout,
  backend: Server,
  uiux: Palette,
  general: Sparkles,
};

function iconForRole(role: Role): LucideIcon {
  if (role.source === "builtin" && role.id in ROLE_ICON_MAP) {
    return ROLE_ICON_MAP[role.id as PersonaId];
  }

  return Sparkles;
}

const providersConfig = PROVIDERS;

function modelForProvider(providerId: ProviderId): string | undefined {
  const entry = providersConfig.find((provider) => provider.id === providerId);
  if (!entry || entry.models.length === 0) {
    return undefined;
  }

  return entry.models[0];
}

export function App() {
  const { roles, addRole, deleteRole, isLoading, error: rolesError } = useRoles();
  const hydrateFromSession = useApiKeyStore((s) => s.hydrateFromSession);
  const hydrated = useApiKeyStore((s) => s.hydrated);
  const storeKeys = useApiKeyStore((s) => s.keys);
  const [activeRole, setActiveRole] = useState<string>(PERSONA_IDS[0]);

  useEffect(() => {
    hydrateFromSession();
  }, [hydrateFromSession]);

  useEffect(() => {
    if (!hydrated) return;
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        hydrateFromSession();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [hydrated, hydrateFromSession]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [managedRole, setManagedRole] = useState<Role | null>(null);
  const [personaActionError, setPersonaActionError] = useState("");
  const [provider, setProvider] = useState<ProviderId>("gemini");
  const [model, setModel] = useState("gemini-2.5-pro");
  const [inputIdea, setInputIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputPrompt, setOutputPrompt] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [generationError, setGenerationError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const copyFeedbackTimeoutRef = useRef<number | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(copyFeedbackTimeoutRef.current);
      }
    };
  }, []);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === activeRole) ?? roles[0],
    [activeRole, roles],
  );

  const selectedProvider = useMemo(
    () => providersConfig.find((entry) => entry.id === provider) ?? providersConfig[0],
    [provider],
  );

  function handleProviderChange(nextProvider: ProviderId) {
    setProvider(nextProvider);
    setModel(modelForProvider(nextProvider) ?? "");
  }

  async function handleGenerate() {
    const rawInput = inputIdea.trim();

    if (!rawInput) {
      setOutputPrompt("");
      setEvaluation(null);
      setGenerationError("Enter an idea before refining the prompt.");
      return;
    }

    if (!model.trim()) {
      setGenerationError("Select a model before refining the prompt.");
      return;
    }

    if (keyMissing) {
      setGenerationError(`Add your ${selectedProvider.provider} API key in Settings to generate prompts.`);
      return;
    }

    setIsGenerating(true);
    setIsCopied(false);
    setOutputPrompt("");
    setEvaluation(null);
    setGenerationError("");

    if (!selectedRole) {
      setGenerationError("Select a persona before refining the prompt.");
      return;
    }

    try {
      const result = await promptStudioClient.generatePrompt({
        rawInput,
        personaId: selectedRole.id,
        providerId: provider,
        model,
      });

      if (!result.ok) {
        setGenerationError(result.message);
        return;
      }

      setOutputPrompt(result.prompt);
      setEvaluation({
        tokensUsed: result.tokensUsed,
      });
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Could not generate the prompt.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!outputPrompt) return;
    await navigator.clipboard.writeText(outputPrompt);
    if (copyFeedbackTimeoutRef.current !== null) {
      window.clearTimeout(copyFeedbackTimeoutRef.current);
    }
    setIsCopied(true);
    copyFeedbackTimeoutRef.current = window.setTimeout(() => {
      setIsCopied(false);
      copyFeedbackTimeoutRef.current = null;
    }, 2000);
  }

  async function handleCreateRole(title: string, description: string) {
    setPersonaActionError("");

    try {
      const role = await addRole(title, description);
      setActiveRole(role.id);
    } catch (err) {
      setPersonaActionError(
        err instanceof Error ? err.message : "Could not create the custom persona.",
      );
    }
  }

  async function handleDeleteManagedRole() {
    if (!managedRole) return;

    setPersonaActionError("");

    try {
      const deleted = await deleteRole(managedRole.id);
      if (!deleted) {
        setPersonaActionError("Could not delete the custom persona.");
        return;
      }

      if (activeRole === managedRole.id) {
        setActiveRole(PERSONA_IDS[0]);
      }

      setManagedRole(null);
    } catch (err) {
      setPersonaActionError(
        err instanceof Error ? err.message : "Could not delete the custom persona.",
      );
    }
  }

  const keyMissing = !isProviderConfigured(storeKeys, provider);

  const outputIsError = Boolean(generationError && !outputPrompt);

  return (
    <main className={styles.main}>
      <div className={styles.gridOverlay} />
      <div className={styles.radialOverlay} aria-hidden="true" />

      <StudioShell>
        <Header onOpenSettings={() => setIsSettingsModalOpen(true)} />

        <section className={styles.workspaceGrid}>
          <section className={styles.panelCyan}>
            <PersonaPanel
              roles={roles}
              activeRole={activeRole}
              isLoading={isLoading}
              loadError={rolesError}
              actionError={personaActionError}
              onSelect={setActiveRole}
              onCreate={() => setIsRoleModalOpen(true)}
              onManage={setManagedRole}
            />
          </section>

          <section className={styles.panelFuchsia}>
            <ComposerPanel
              inputIdea={inputIdea}
              onInputChange={setInputIdea}
              provider={provider}
              model={model}
              selectedProvider={selectedProvider}
              isGenerating={isGenerating}
              keyMissing={keyMissing}
              onProviderChange={handleProviderChange}
              onModelChange={setModel}
              onGenerate={handleGenerate}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
          </section>

          <section className={styles.panelCyan}>
            <OutputPanel
              outputPrompt={outputPrompt}
              outputIsError={outputIsError}
              generationError={generationError}
              isGenerating={isGenerating}
              isCopied={isCopied}
              evaluation={evaluation}
              onCopy={handleCopy}
            />
          </section>
        </section>
      </StudioShell>

      <RoleModal
        open={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onCreate={handleCreateRole}
      />
      <RoleViewModal
        open={managedRole !== null}
        role={managedRole}
        onClose={() => setManagedRole(null)}
        onDelete={handleDeleteManagedRole}
      />
      <SettingsModal
        open={isSettingsModalOpen}
        providers={providersConfig}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={() => setIsSettingsModalOpen(false)}
      />
    </main>
  );
}

function StudioShell({ children }: { children: React.ReactNode }) {
  return <div className={styles.studioShell}>{children}</div>;
}

function PersonaPanel({
  roles,
  activeRole,
  isLoading,
  loadError,
  actionError,
  onSelect,
  onCreate,
  onManage,
}: {
  roles: Role[];
  activeRole: string;
  isLoading: boolean;
  loadError: string;
  actionError: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onManage: (role: Role) => void;
}) {
  return (
    <>
      <div className={styles.moduleHeader}>
        <div>
          <p className={styles.moduleLabel}>Module 01</p>
          <h2 className={styles.moduleTitle}>Persona Matrix</h2>
        </div>
        <button type="button" className={styles.personaCreateButton} onClick={onCreate}>
          <Plus size={14} />
          <span>New persona</span>
        </button>
      </div>

      {(loadError || actionError) && (
        <p className={styles.personaFeedback}>{loadError || actionError}</p>
      )}

      <div className={styles.personaGrid}>
        {isLoading ? (
          <p className={styles.personaFeedback}>Loading custom personas...</p>
        ) : (
          roles.map((role) => {
            const Icon = iconForRole(role);
            const isActive = role.id === activeRole;

            return (
              <div key={role.id} className={styles.personaCard}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSelect(role.id)}
                  className={[
                    styles.personaButton,
                    isActive ? styles.personaButtonActive : styles.personaButtonIdle,
                  ].join(" ")}
                >
                  <div className={styles.personaButtonLabel}>
                    <Icon size={14} />
                    <span>{role.title}</span>
                  </div>
                  <p className={styles.personaDescription}>{role.description}</p>
                </button>
                {role.source === "custom" && (
                  <button
                    type="button"
                    className={styles.personaManageButton}
                    onClick={() => onManage(role)}
                  >
                    Manage
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function ComposerPanel({
  inputIdea,
  onInputChange,
  provider,
  model,
  selectedProvider,
  isGenerating,
  keyMissing,
  onProviderChange,
  onModelChange,
  onGenerate,
  onOpenSettings,
}: {
  inputIdea: string;
  onInputChange: (value: string) => void;
  provider: ProviderId;
  model: string;
  selectedProvider: (typeof providersConfig)[number];
  isGenerating: boolean;
  keyMissing: boolean;
  onProviderChange: (providerId: ProviderId) => void;
  onModelChange: (model: string) => void;
  onGenerate: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <>
      <div className={`${styles.moduleHeader} ${styles.moduleHeaderFuchsia}`}>
        <div>
          <p className={`${styles.moduleLabel} ${styles.moduleLabelFuchsia}`}>Module 02</p>
          <h2 className={styles.moduleTitle}>Raw Signal</h2>
        </div>
      </div>

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

      <div className={styles.composerFieldWrap}>
        <textarea
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
              document.getElementById("raw-idea")?.focus();
            }}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        )}
        <ScanlineOverlay />
      </div>

      <ComposerControls
        provider={provider}
        model={model}
        selectedProvider={selectedProvider}
        isGenerating={isGenerating}
        onProviderChange={onProviderChange}
        onModelChange={onModelChange}
        onGenerate={onGenerate}
      />
    </>
  );
}

function ScanlineOverlay() {
  return <ScanlineOverlayInner />;
}

function ScanlineOverlayInner() {
  return <div aria-hidden="true" className={styles.scanlineOverlay} />;
}

function ComposerControls({
  provider,
  model,
  selectedProvider,
  isGenerating,
  onProviderChange,
  onModelChange,
  onGenerate,
}: {
  provider: ProviderId;
  model: string;
  selectedProvider: (typeof providersConfig)[number];
  isGenerating: boolean;
  onProviderChange: (providerId: ProviderId) => void;
  onModelChange: (model: string) => void;
  onGenerate: () => void;
}) {
  return (
    <div className={styles.composerControls}>
      <div className={styles.controlsGrid}>
        <label className={styles.fieldLabel}>
          Provider
          <select
            value={provider}
            onChange={(event) => onProviderChange(event.target.value as ProviderId)}
            className={styles.select}
          >
            {providersConfig.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.provider}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.fieldLabel}>
          Model
          <select
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            className={styles.select}
          >
            {selectedProvider.models.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        aria-label={isGenerating ? "Refining prompt" : "Refine prompt"}
        onClick={onGenerate}
        disabled={isGenerating}
        className={styles.generateButton}
      >
        {isGenerating ? <Loader2 className={styles.spinner} size={18} /> : <Wand2 size={18} />}
        {isGenerating ? "Refining" : "Generate"}
      </button>
    </div>
  );
}

function OutputPanel({
  outputPrompt,
  outputIsError,
  generationError,
  isGenerating,
  isCopied,
  evaluation,
  onCopy,
}: {
  outputPrompt: string;
  outputIsError: boolean;
  generationError: string;
  isGenerating: boolean;
  isCopied: boolean;
  evaluation: Evaluation | null;
  onCopy: () => void;
}) {
  return (
    <>
      <div className={styles.outputHeader}>
        <div>
          <p className={styles.moduleLabel}>Module 03</p>
          <h2 className={styles.moduleTitle}>Refined Stream</h2>
        </div>
        <button
          type="button"
          onClick={onCopy}
          disabled={!outputPrompt}
          className={[styles.copyButton, isCopied ? styles.copyButtonCopied : ""].join(" ")}
        >
          {isCopied ? <Check size={14} /> : <Clipboard size={14} />}
          {isCopied ? "Copied" : "Copy"}
        </button>
      </div>

      <div
        className={[
          styles.outputContent,
          outputIsError
            ? styles.outputContentError
            : outputPrompt
              ? styles.outputContentFilled
              : styles.outputContentEmpty,
        ].join(" ")}
      >
        {outputIsError ? (
          <div className={styles.errorBlock}>
            <ErrorHeader />
            <p className={styles.preWrap}>{generationError}</p>
          </div>
        ) : outputPrompt ? (
          <>
            <StreamingMarkdown content={outputPrompt} isStreaming={isGenerating} />
            {isGenerating ? <span className={styles.pulseCursor} /> : null}
          </>
        ) : (
          <div className={styles.emptyState}>
            <Terminal size={40} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Waiting For Refinement</h3>
            <p className={styles.emptyCopy}>
              The refined prompt will appear here with terminal-style preserved spacing.
            </p>
          </div>
        )}
      </div>

      {evaluation && (
        <footer className={styles.evalFooter}>
          <div>
            <span className={styles.evalLabel}>API response</span>
            <p className={styles.evalValue}>
              {evaluation.tokensUsed === undefined ? "OK" : evaluation.tokensUsed}
            </p>
          </div>
          <p className={styles.evalCaption}>
            {evaluation.tokensUsed === undefined
              ? "Prompt refined by the API."
              : "Tokens used during generation."}
          </p>
        </footer>
      )}
    </>
  );
}

function ErrorHeader() {
  return (
    <div className={styles.errorHeader}>
      <Terminal size={14} />
      <span>Terminal Error</span>
    </div>
  );
}
