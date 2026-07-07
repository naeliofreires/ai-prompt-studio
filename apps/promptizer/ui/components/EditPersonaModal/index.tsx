import { LoaderCircle, Save } from "lucide-react";
import { useEffect, useState } from "react";
import ModalShell from "../shared/ModalShell";
import modalStyles from "../shared/ModalShell.module.css";

interface Persona {
  id: string;
  title: string;
  description: string;
  source?: "builtin" | "custom";
}

interface PersonaPatch {
  title: string;
  description: string;
}

interface EditPersonaModalProps {
  persona: Persona | null;
  onSave: (id: string, patch: PersonaPatch) => void | Promise<void>;
  onClose: () => void;
}

const TITLE_MAX_LENGTH = 60;
const DESCRIPTION_MAX_LENGTH = 600;

export default function EditPersonaModal({ persona, onSave, onClose }: EditPersonaModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setTitle(persona?.title ?? "");
    setDescription(persona?.description ?? "");
    setWasSubmitted(false);
    setIsSaving(false);
    setSaveError("");
  }, [persona]);

  if (!persona) return null;

  const currentPersona = persona;
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const titleError = getTitleError(title);
  const descriptionError = getDescriptionError(description);
  const hasChanges =
    trimmedTitle !== currentPersona.title || trimmedDescription !== currentPersona.description;
  const canSave = hasChanges && !titleError && !descriptionError && !isSaving;
  const showTitleError = wasSubmitted || Boolean(titleError && title.length > TITLE_MAX_LENGTH);
  const showDescriptionError =
    wasSubmitted || Boolean(descriptionError && description.length > DESCRIPTION_MAX_LENGTH);

  async function handleSave() {
    setWasSubmitted(true);
    setSaveError("");

    if (titleError || descriptionError || !hasChanges) return;

    setIsSaving(true);

    try {
      await onSave(currentPersona.id, {
        title: trimmedTitle,
        description: trimmedDescription,
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save persona changes.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ModalShell
      open={persona !== null}
      onClose={onClose}
      eyebrow="Persona Matrix"
      title={currentPersona.title}
      ariaLabelledBy="edit-persona-modal-title"
      closeAriaLabel="Cancel editing persona"
      footer={
        <>
          <button className={modalStyles.cancelButton} type="button" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button
            className={modalStyles.primaryButton}
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave}
          >
            {isSaving ? <LoaderCircle size={14} /> : <Save size={14} />}
            {isSaving ? "Saving" : "Save"}
          </button>
        </>
      }
    >
      <label className={modalStyles.field}>
        <span className={modalStyles.fieldLabel}>Name</span>
        <input
          className={modalStyles.fieldInput}
          value={title}
          maxLength={TITLE_MAX_LENGTH + 1}
          aria-invalid={showTitleError}
          aria-describedby="edit-persona-title-help"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Persona name"
          disabled={isSaving}
        />
        <span id="edit-persona-title-help" className={modalStyles.fieldHelp}>
          {showTitleError ? titleError : `${title.length}/${TITLE_MAX_LENGTH} characters`}
        </span>
      </label>

      <label className={modalStyles.field}>
        <span className={modalStyles.fieldLabel}>Persona type</span>
        <input
          className={modalStyles.fieldInput}
          value={currentPersona.source === "custom" ? "Custom persona" : "Built-in persona"}
          readOnly
        />
      </label>

      <label className={modalStyles.field}>
        <span className={modalStyles.fieldLabel}>Description</span>
        <textarea
          className={modalStyles.fieldTextarea}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={DESCRIPTION_MAX_LENGTH + 1}
          aria-invalid={showDescriptionError}
          aria-describedby="edit-persona-description-help"
          rows={6}
          disabled={isSaving}
        />
        <span id="edit-persona-description-help" className={modalStyles.fieldHelp}>
          {showDescriptionError
            ? descriptionError
            : `${description.length}/${DESCRIPTION_MAX_LENGTH} characters`}
        </span>
      </label>

      {saveError && <p className={modalStyles.formError}>{saveError}</p>}
    </ModalShell>
  );
}

function getTitleError(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) return "Name is required.";
  if (trimmedValue.length > TITLE_MAX_LENGTH) {
    return `Name must be ${TITLE_MAX_LENGTH} characters or fewer.`;
  }

  return "";
}

function getDescriptionError(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) return "Description is required.";
  if (trimmedValue.length > DESCRIPTION_MAX_LENGTH) {
    return `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;
  }

  return "";
}
