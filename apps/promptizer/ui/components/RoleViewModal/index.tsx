import type { Role } from "../../types/role";
import ModalShell from "../shared/ModalShell";
import modalStyles from "../shared/ModalShell.module.css";
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
    <ModalShell
      open={open}
      onClose={onClose}
      eyebrow="Persona Matrix"
      title={role.title}
      ariaLabelledBy="role-view-modal-title"
      closeAriaLabel="Close persona details"
      footer={
        <>
          <button className={modalStyles.deleteButton} type="button" onClick={onDelete}>
            Delete
          </button>
          <button className={modalStyles.cancelButton} type="button" onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <p className={styles.description}>{role.description}</p>
    </ModalShell>
  );
}
