import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Save, Trash2, X } from "lucide-react";
import type { Provider, ProviderId } from "../../../shared";
import { useApiKeyStore } from "../../store/api-key-store";
import shared from "../RoleModal/roleModalShared.module.css";
import styles from "./SettingsModal.module.css";

interface SettingsModalProps {
  open: boolean;
  providers: Provider[];
  onClose: () => void;
  onSave: () => void;
}

const apiKeyLabels: Record<string, string> = {
  gemini: "Google Gemini API Key",
  glm: "GLM API Key",
  deepseek: "DeepSeek API Key",
};

const apiKeyPlaceholders: Record<string, string> = {
  gemini: "AIzaSy...",
  glm: "glm-...",
  deepseek: "sk-...",
};

export default function SettingsModal({ open, providers, onClose, onSave }: SettingsModalProps) {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [clearAllConfirm, setClearAllConfirm] = useState(false);

  const storeKeys = useApiKeyStore((s) => s.keys);
  const setKeys = useApiKeyStore((s) => s.setKeys);
  const clearProvider = useApiKeyStore((s) => s.clearProvider);
  const clearAll = useApiKeyStore((s) => s.clearAll);

  useEffect(() => {
    if (!open) return;
    setDraft({});
    setShowApiKeys(false);
    setClearAllConfirm(false);
  }, [open]);

  const activeKeyProviders = useMemo(
    () => providers.filter((provider) => apiKeyLabels[provider.id]),
    [providers],
  );

  function hasKeyConfigured(id: string): boolean {
    const val = storeKeys[id as ProviderId];
    return typeof val === "string" && val.trim().length > 0;
  }

  function handleDraftChange(id: string, value: string) {
    setDraft((prev) => ({ ...prev, [id]: value }));
  }

  function handleRemove(id: string) {
    clearProvider(id as ProviderId);
    setDraft((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleClearAll() {
    if (!clearAllConfirm) {
      setClearAllConfirm(true);
      return;
    }
    clearAll();
    setDraft({});
    setClearAllConfirm(false);
  }

  function handleSave() {
    const patch: Partial<Record<ProviderId, string>> = {};
    for (const [id, value] of Object.entries(draft)) {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        patch[id] = trimmed;
      }
    }
    if (Object.keys(patch).length > 0) {
      setKeys(patch);
    }
    onSave();
  }

  if (!open) {
    return null;
  }

  return (
    <div className={shared.overlay} onClick={onClose}>
      <section
        aria-labelledby="settings-modal-title"
        className={`${shared.modal} ${styles.modalWide}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={shared.header}>
          <div className={shared.titleGroup}>
            <p className={shared.eyebrow}>System Config</p>
            <h2 className={shared.title} id="settings-modal-title">
              Settings
            </h2>
          </div>
          <button
            aria-label="Close settings"
            className={shared.iconButton}
            type="button"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </header>

        <div className={shared.body}>
          <div className={styles.sectionHeader}>
            <p className={shared.fieldLabel}>API Keys (Providers)</p>
            <button
              className={shared.cancelButton}
              type="button"
              onClick={() => setShowApiKeys((current) => !current)}
            >
              {showApiKeys ? <EyeOff size={14} /> : <Eye size={14} />}
              {showApiKeys ? "Hide" : "Show"}
            </button>
          </div>

          <div className={styles.keysPanel}>
            {activeKeyProviders.map((provider) => {
              const configured = hasKeyConfigured(provider.id);
              return (
                <div className={styles.keyRow} key={provider.id}>
                  <label className={shared.field}>
                    <span className={shared.fieldLabel}>
                      {apiKeyLabels[provider.id]}
                      {configured && (
                        <span className={styles.configuredBadge}>Configured</span>
                      )}
                    </span>
                    <input
                      className={shared.fieldInput}
                      type={showApiKeys ? "text" : "password"}
                      value={draft[provider.id] ?? ""}
                      placeholder={configured ? "Key configured" : (apiKeyPlaceholders[provider.id] ?? "sk-...")}
                      autoComplete="off"
                      spellCheck={false}
                      onChange={(e) => handleDraftChange(provider.id, e.target.value)}
                    />
                  </label>
                  {configured && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      aria-label={`Remove ${apiKeyLabels[provider.id]}`}
                      onClick={() => handleRemove(provider.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <footer className={shared.footer}>
          <button
            className={`${shared.cancelButton} ${styles.clearAllButton}`}
            type="button"
            onClick={handleClearAll}
          >
            <Trash2 size={12} />
            {clearAllConfirm ? "Confirm clear all?" : "Clear All"}
          </button>
          <button className={shared.cancelButton} type="button" onClick={onClose}>
            Cancel
          </button>
          <button className={shared.primaryButton} type="button" onClick={handleSave}>
            <Save size={14} />
            Save Changes
          </button>
        </footer>
      </section>
    </div>
  );
}
