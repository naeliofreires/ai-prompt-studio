import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import ModalShell from "../shared/ModalShell";
import modalStyles from "../shared/ModalShell.module.css";

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string) => void;
}

export default function RoleModal({ open, onClose, onCreate }: RoleModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
    }
  }, [open]);

  const handleCreate = () => {
    const nextTitle = title.trim();
    const nextDescription = description.trim();
    if (!nextTitle || !nextDescription) {
      return;
    }

    onCreate(nextTitle, nextDescription);
    onClose();
  };

  const canCreate = title.trim().length > 0 && description.trim().length > 0;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      eyebrow="Persona Matrix"
      title="New Persona"
      ariaLabelledBy="role-modal-title"
      closeAriaLabel="Close new persona dialog"
      footer={
        <>
          <button className={modalStyles.cancelButton} type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className={modalStyles.primaryButton}
            type="button"
            disabled={!canCreate}
            onClick={handleCreate}
          >
            <Plus size={14} />
            Create
          </button>
        </>
      }
    >
      <label className={modalStyles.field}>
        <span className={modalStyles.fieldLabel}>Title</span>
        <input
          className={modalStyles.fieldInput}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Persona title"
        />
      </label>

      <label className={modalStyles.field}>
        <span className={modalStyles.fieldLabel}>Description</span>
        <textarea
          className={modalStyles.fieldTextarea}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the persona"
          rows={4}
        />
      </label>
    </ModalShell>
  );
}
