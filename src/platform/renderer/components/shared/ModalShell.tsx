import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import styles from "./ModalShell.module.css";

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

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
  const modalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    window.requestAnimationFrame(() => {
      const firstFocusableElement = modalRef.current?.querySelector<HTMLElement>(focusableSelector);
      (firstFocusableElement ?? modalRef.current)?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => element.offsetParent !== null);

      if (focusableElements.length === 0) {
        event.preventDefault();
        modalRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <section
        aria-labelledby={ariaLabelledBy}
        aria-modal="true"
        className={`${styles.modal}${className ? ` ${className}` : ""}`}
        ref={modalRef}
        role="dialog"
        tabIndex={-1}
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
