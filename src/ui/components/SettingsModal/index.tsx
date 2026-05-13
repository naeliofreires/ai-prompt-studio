import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound, Save, Settings, X } from "lucide-react";
import type { Provider } from "../../../shared";
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

  useEffect(() => {
    if (!open) return;

    setShowApiKeys(false);
  }, [open]);

  const activeKeyProviders = useMemo(
    () => providers.filter((provider) => apiKeyLabels[provider.id]),
    [providers],
  );

  if (!open) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <section
        aria-labelledby="settings-modal-title"
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <Settings size={28} />
            <h2 id="settings-modal-title">System Settings</h2>
          </div>
          <button
            aria-label="Close settings"
            className={styles.iconButton}
            type="button"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <KeyRound size={22} />
              <h3>API Keys (Providers)</h3>
            </div>
            <button
              className={styles.showButton}
              type="button"
              onClick={() => setShowApiKeys((current) => !current)}
            >
              {showApiKeys ? <EyeOff size={18} /> : <Eye size={18} />}
              {showApiKeys ? "Hide" : "Show"}
            </button>
          </div>

          <div className={styles.keysPanel}>
            {activeKeyProviders.map((provider) => (
              <label className={styles.field} key={provider.id}>
                <span>{apiKeyLabels[provider.id]}</span>
                <input
                  type={showApiKeys ? "text" : "password"}
                  defaultValue=""
                  placeholder={apiKeyPlaceholders[provider.id] ?? "sk-..."}
                  autoComplete="off"
                />
              </label>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <button className={styles.cancelButton} type="button" onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveButton} type="button" onClick={onSave}>
            <Save size={20} />
            Save Changes
          </button>
        </footer>
      </section>
    </div>
  );
}
