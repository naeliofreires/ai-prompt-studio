import type { ReactNode } from "react";
import styles from "./PanelHeader.module.scss";

export type PanelHeaderTone = "cyan" | "fuchsia";

interface PanelHeaderProps {
  label: string;
  title: string;
  tone?: PanelHeaderTone;
  action?: ReactNode;
}

export function PanelHeader({ label, title, tone = "cyan", action }: PanelHeaderProps) {
  return (
    <div className={[styles.header, tone === "fuchsia" ? styles.headerFuchsia : ""].join(" ")}>
      <div>
        <p className={[styles.label, tone === "fuchsia" ? styles.labelFuchsia : ""].join(" ")}>
          {label}
        </p>
        <h2 className={styles.title}>{title}</h2>
      </div>
      {action}
    </div>
  );
}
