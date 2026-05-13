import type { Role } from "../../hooks/useRoles";
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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.heading}>{role.title}</h2>
        <p className={styles.description}>{role.description}</p>
        <div className={styles.actions}>
          <button className={styles.deleteButton} onClick={onDelete}>
            Delete
          </button>
          <button className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
