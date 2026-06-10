import { X } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./ModalShell.module.css";

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: ReactNode;
  ariaLabelledBy: string;
  closeAriaLabel: string;
  className?: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function ModalShell({
  open,
  onClose,
  eyebrow,
  title,
  ariaLabelledBy,
  closeAriaLabel,
  className,
  children,
  footer,
}: ModalShellProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <section
        aria-labelledby={ariaLabelledBy}
        aria-modal="true"
        className={`${styles.modal}${className ? ` ${className}` : ""}`}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 className={styles.title} id={ariaLabelledBy}>
              {title}
            </h2>
          </div>
          <button
            aria-label={closeAriaLabel}
            className={styles.iconButton}
            type="button"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        <footer className={styles.footer}>{footer}</footer>
      </section>
    </div>
  );
}
