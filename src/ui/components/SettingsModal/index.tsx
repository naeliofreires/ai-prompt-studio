import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Save, X } from "lucide-react";
import type { Provider } from "../../../shared";
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
            {activeKeyProviders.map((provider) => (
              <label className={shared.field} key={provider.id}>
                <span className={shared.fieldLabel}>{apiKeyLabels[provider.id]}</span>
                <input
                  className={shared.fieldInput}
                  type={showApiKeys ? "text" : "password"}
                  defaultValue=""
                  placeholder={apiKeyPlaceholders[provider.id] ?? "sk-..."}
                  autoComplete="off"
                />
              </label>
            ))}
          </div>
        </div>

        <footer className={shared.footer}>
          <button className={shared.cancelButton} type="button" onClick={onClose}>
            Cancel
          </button>
          <button className={shared.primaryButton} type="button" onClick={onSave}>
            <Save size={14} />
            Save Changes
          </button>
        </footer>
      </section>
    </div>
  );
}
