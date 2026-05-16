import { useEffect, useState } from "react";
import { Eye, EyeOff, Save, Trash2 } from "lucide-react";
import { PROVIDER_META, type Provider, type ProviderId } from "../../../shared";
import ModalShell from "../shared/ModalShell";
import modalStyles from "../shared/ModalShell.module.css";
import styles from "./SettingsModal.module.css";

interface SettingsModalProps {
  open: boolean;
  providers: Provider[];
  keys: Partial<Record<ProviderId, string>>;
  onClose: () => void;
  onSave: () => void;
  onSaveKeys: (patch: Partial<Record<ProviderId, string>>) => void;
  onClearProvider: (id: ProviderId) => void;
  onClearAll: () => void;
}

export default function SettingsModal({
  open,
  providers,
  keys,
  onClose,
  onSave,
  onSaveKeys,
  onClearProvider,
  onClearAll,
}: SettingsModalProps) {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [clearAllConfirm, setClearAllConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft({});
    setShowApiKeys(false);
    setClearAllConfirm(false);
  }, [open]);

  function hasKeyConfigured(id: ProviderId): boolean {
    const val = keys[id];
    return typeof val === "string" && val.trim().length > 0;
  }

  function handleDraftChange(id: string, value: string) {
    setDraft((prev) => ({ ...prev, [id]: value }));
  }

  function handleRemove(id: string) {
    onClearProvider(id as ProviderId);
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
    onClearAll();
    setDraft({});
    setClearAllConfirm(false);
  }

  function handleSave() {
    const patch: Partial<Record<ProviderId, string>> = {};
    for (const [id, value] of Object.entries(draft)) {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        patch[id as ProviderId] = trimmed;
      }
    }
    if (Object.keys(patch).length > 0) {
      onSaveKeys(patch);
    }
    onSave();
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      eyebrow="System Config"
      title="Settings"
      ariaLabelledBy="settings-modal-title"
      closeAriaLabel="Close settings"
      className={styles.modalWide}
      footer={
        <>
          <button
            className={`${modalStyles.cancelButton} ${styles.clearAllButton}`}
            type="button"
            onClick={handleClearAll}
          >
            <Trash2 size={12} />
            {clearAllConfirm ? "Confirm clear all?" : "Clear All"}
          </button>
          <button className={modalStyles.cancelButton} type="button" onClick={onClose}>
            Cancel
          </button>
          <button className={modalStyles.primaryButton} type="button" onClick={handleSave}>
            <Save size={14} />
            Save Changes
          </button>
        </>
      }
    >
      <div className={styles.sectionHeader}>
        <p className={modalStyles.fieldLabel}>API Keys (Providers)</p>
        <button
          className={modalStyles.cancelButton}
          type="button"
          onClick={() => setShowApiKeys((current) => !current)}
        >
          {showApiKeys ? <EyeOff size={14} /> : <Eye size={14} />}
          {showApiKeys ? "Hide" : "Show"}
        </button>
      </div>

      <div className={styles.keysPanel}>
        {providers.map((provider) => {
          const meta = PROVIDER_META[provider.id];
          const configured = hasKeyConfigured(provider.id);
          return (
            <div className={styles.keyRow} key={provider.id}>
              <label className={modalStyles.field}>
                <span className={modalStyles.fieldLabel}>
                  {meta.label}
                  {configured && (
                    <span className={styles.configuredBadge}>Configured</span>
                  )}
                </span>
                <input
                  className={modalStyles.fieldInput}
                  type={showApiKeys ? "text" : "password"}
                  value={draft[provider.id] ?? ""}
                  placeholder={configured ? "Key configured" : meta.placeholder}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => handleDraftChange(provider.id, e.target.value)}
                />
              </label>
              {configured && (
                <button
                  type="button"
                  className={styles.removeButton}
                  aria-label={`Remove ${meta.label}`}
                  onClick={() => handleRemove(provider.id)}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}
