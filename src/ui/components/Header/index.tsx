import { Settings, Sparkles } from "lucide-react";
import styles from "./Header.module.css";

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <Sparkles size={20} />
        </div>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>AI Prompt Studio</h1>
        </div>
      </div>
      <button type="button" className={styles.settingsButton} onClick={onOpenSettings}>
        <Settings size={14} />
        Settings
      </button>
    </header>
  );
}
