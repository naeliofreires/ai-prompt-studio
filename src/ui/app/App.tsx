import { useMemo, useState } from "react";
import { PERSONAS, PERSONA_IDS, PROVIDERS, type PersonaId, type ProviderId } from "../../shared";
import { Header } from "../components/Header";
import { PersonaSelector } from "../components/PersonaSelector";
import { IdeaComposer } from "../components/IdeaComposer";
import { OutputPanel } from "../components/OutputPanel";
import SettingsModal from "../components/SettingsModal";
import styles from "./App.module.css";

type Evaluation = {
  tokensUsed?: number;
};

const roles = PERSONAS.map((persona) => ({
  id: persona.id,
  title: persona.label,
  description: persona.role,
}));

const providers = PROVIDERS;

function modelForProvider(providerId: ProviderId) {
  return providers.find((entry) => entry.id === providerId)?.models[0] ?? "";
}

export function App() {
  const [activeRole, setActiveRole] = useState<PersonaId>(PERSONA_IDS[0]);
  const [provider, setProvider] = useState<ProviderId>("gemini");
  const [model, setModel] = useState("gemini-2.5-pro");
  const [inputIdea, setInputIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputPrompt, setOutputPrompt] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [generationError, setGenerationError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === activeRole) ?? roles[0],
    [activeRole],
  );

  const selectedProvider = useMemo(
    () => providers.find((entry) => entry.id === provider) ?? providers[0],
    [provider],
  );

  function handleProviderChange(nextProvider: ProviderId) {
    setProvider(nextProvider);
    setModel(modelForProvider(nextProvider));
  }

  function handleSettingsSave() {
    setIsSettingsOpen(false);
  }

  async function handleGenerate() {
    const rawInput = inputIdea.trim();

    if (!rawInput) {
      setOutputPrompt("");
      setEvaluation(null);
      setGenerationError("Enter an idea before refining the prompt.");
      return;
    }

    setIsGenerating(true);
    setIsCopied(false);
    setOutputPrompt("");
    setEvaluation(null);
    setGenerationError("");

    try {
      const result = await window.aiPromptStudio.generatePrompt({
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
      setEvaluation({ tokensUsed: result.tokensUsed });
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Could not generate the prompt.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!outputPrompt) return;
    await navigator.clipboard.writeText(outputPrompt);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <main className={styles.shell}>
      <div className={styles.orbOne} />
      <div className={styles.orbTwo} />
      <div className={styles.orbThree} />

      <div className={styles.content}>
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />

        <section className={styles.workspace}>
          <div className={styles.leftPanel}>
            <PersonaSelector
              roles={roles}
              activeRole={activeRole}
              onSelect={setActiveRole}
            />
            <IdeaComposer
              inputIdea={inputIdea}
              onInputChange={setInputIdea}
              provider={provider}
              onProviderChange={handleProviderChange}
              model={model}
              onModelChange={setModel}
              providers={providers}
              selectedProvider={selectedProvider}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />
          </div>

          <OutputPanel
            outputPrompt={outputPrompt}
            isCopied={isCopied}
            onCopy={handleCopy}
            evaluation={evaluation}
            generationError={generationError}
          />
        </section>
      </div>

      <SettingsModal
        open={isSettingsOpen}
        providers={providers}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSave}
      />
    </main>
  );
}
