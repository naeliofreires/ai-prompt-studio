import { useState } from "react";
import styles from "./RoleModal.module.css";

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string) => void;
}

export default function RoleModal({ open, onClose, onCreate }: RoleModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  const reset = () => {
    setTitle("");
    setDescription("");
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleCreate = () => {
    onCreate(title, description);
    reset();
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h2 className={styles.heading}>New Role</h2>

        <div className={styles.field}>
          <span>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Role title"
          />
        </div>

        <div className={styles.field}>
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the role"
            rows={4}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
          <button className={styles.createButton} onClick={handleCreate}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
