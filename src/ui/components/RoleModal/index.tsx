import { Plus, X } from "lucide-react";
import { useState } from "react";
import shared from "./roleModalShared.module.css";

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
    const nextTitle = title.trim();
    const nextDescription = description.trim();
    if (!nextTitle || !nextDescription) {
      return;
    }

    onCreate(nextTitle, nextDescription);
    reset();
    onClose();
  };

  const canCreate = title.trim().length > 0 && description.trim().length > 0;

  return (
    <div className={shared.overlay} onClick={handleCancel}>
      <section
        aria-labelledby="role-modal-title"
        aria-modal="true"
        className={shared.modal}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={shared.header}>
          <div className={shared.titleGroup}>
            <p className={shared.eyebrow}>Persona Matrix</p>
            <h2 className={shared.title} id="role-modal-title">
              New Persona
            </h2>
          </div>
          <button
            aria-label="Close new persona dialog"
            className={shared.iconButton}
            type="button"
            onClick={handleCancel}
          >
            <X size={16} />
          </button>
        </header>

        <div className={shared.body}>
          <label className={shared.field}>
            <span className={shared.fieldLabel}>Title</span>
            <input
              className={shared.fieldInput}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Persona title"
            />
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Description</span>
            <textarea
              className={shared.fieldTextarea}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the persona"
              rows={4}
            />
          </label>
        </div>

        <footer className={shared.footer}>
          <button className={shared.cancelButton} type="button" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className={shared.primaryButton}
            type="button"
            disabled={!canCreate}
            onClick={handleCreate}
          >
            <Plus size={14} />
            Create
          </button>
        </footer>
      </section>
    </div>
  );
}
