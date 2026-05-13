import { Activity, Settings, Sparkles } from "lucide-react";
import styles from "./Header.module.css";

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className={styles.title}>AI Prompt Studio</h1>
        </div>
      </div>
      <div className={styles.headerActions}>
        <button
          type="button"
          className={styles.settingsButton}
          onClick={onOpenSettings}
        >
          <Settings size={16} />
          Settings
        </button>
        <div className={styles.badge}>
          <Activity size={16} />
          <span>Foundation Ready (Phase 1)</span>
        </div>
      </div>
    </header>
  );
}
