import { X } from "lucide-react";
import type { Role } from "../../hooks/useRoles";
import shared from "../RoleModal/roleModalShared.module.css";
import styles from "./RoleViewModal.module.css";

interface RoleViewModalProps {
  open: boolean;
  role: Role | null;
  onClose: () => void;
  onDelete: () => void;
}

export default function RoleViewModal({ open, role, onClose, onDelete }: RoleViewModalProps) {
  if (!open || !role) return null;

  return (
    <div className={shared.overlay} onClick={onClose}>
      <section
        aria-labelledby="role-view-modal-title"
        aria-modal="true"
        className={shared.modal}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={shared.header}>
          <div className={shared.titleGroup}>
            <p className={shared.eyebrow}>Persona Matrix</p>
            <h2 className={shared.title} id="role-view-modal-title">
              {role.title}
            </h2>
          </div>
          <button
            aria-label="Close persona details"
            className={shared.iconButton}
            type="button"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </header>

        <div className={shared.body}>
          <p className={styles.description}>{role.description}</p>
        </div>

        <footer className={shared.footer}>
          <button className={shared.deleteButton} type="button" onClick={onDelete}>
            Delete
          </button>
          <button className={shared.cancelButton} type="button" onClick={onClose}>
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
