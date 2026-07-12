import { ArrowRight, Check, PencilLine, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Role } from "../role";
import styles from "./PersonasPage.module.scss";

interface PersonasPageProps {
  roles: Role[];
  activeRole: string;
  isLoading: boolean;
  loadError: string;
  actionError: string;
  onSelect: (id: string) => void;
  onCreate: (title: string, description: string) => Promise<unknown>;
  onUpdate: (id: string, patch: { title: string; description: string }) => Promise<unknown>;
  onDelete: (id: string) => Promise<boolean>;
}

const TITLE_ERROR = "Title is required.";
const DESCRIPTION_ERROR = "Description is required.";

export function PersonasPage({
  roles,
  activeRole,
  isLoading,
  loadError,
  actionError,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}: PersonasPageProps) {
  const createTitleRef = useRef<HTMLInputElement>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createSubmitted, setCreateSubmitted] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSubmitted, setEditSubmitted] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === activeRole) ?? roles[0] ?? null,
    [activeRole, roles],
  );

  useEffect(() => {
    if (editingRoleId && !roles.some((role) => role.id === editingRoleId)) {
      setEditingRoleId(null);
      setEditError("");
      setEditSubmitted(false);
    }
  }, [editingRoleId, roles]);

  useEffect(() => {
    if (deleteRoleId && !roles.some((role) => role.id === deleteRoleId)) {
      setDeleteRoleId(null);
    }
  }, [deleteRoleId, roles]);

  function focusCreateForm() {
    createTitleRef.current?.focus();
  }

  function resetCreateForm() {
    setCreateTitle("");
    setCreateDescription("");
    setCreateSubmitted(false);
    setCreateError("");
  }

  function startEdit(role: Role) {
    setEditingRoleId(role.id);
    setEditTitle(role.title);
    setEditDescription(role.description);
    setEditSubmitted(false);
    setEditError("");
    setDeleteRoleId(null);
    setCreateError("");
  }

  function cancelEdit() {
    setEditingRoleId(null);
    setEditSubmitted(false);
    setEditError("");
  }

  const createTitleError = getRequiredError(createTitle, TITLE_ERROR);
  const createDescriptionError = getRequiredError(createDescription, DESCRIPTION_ERROR);
  const canCreate = !createTitleError && !createDescriptionError;

  async function handleCreate() {
    setCreateSubmitted(true);
    setCreateError("");

    if (!canCreate) return;

    try {
      await onCreate(createTitle.trim(), createDescription.trim());
      resetCreateForm();
    } catch {
      setCreateError("Could not create the persona.");
    }
  }

  const editRole = roles.find((role) => role.id === editingRoleId) ?? null;
  const editTitleError = getRequiredError(editTitle, TITLE_ERROR);
  const editDescriptionError = getRequiredError(editDescription, DESCRIPTION_ERROR);
  const editHasChanges =
    Boolean(editRole) &&
    (editTitle.trim() !== editRole?.title || editDescription.trim() !== editRole?.description);
  const canSaveEdit =
    Boolean(editRole) && editHasChanges && !editTitleError && !editDescriptionError;

  async function handleSaveEdit() {
    if (!editRole) return;

    setEditSubmitted(true);
    setEditError("");

    if (!canSaveEdit) return;

    try {
      await onUpdate(editRole.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      cancelEdit();
    } catch {
      setEditError("Could not save the persona.");
    }
  }

  async function handleDelete(roleId: string) {
    try {
      const deleted = await onDelete(roleId);
      if (deleted !== false) {
        setDeleteRoleId(null);
      }
    } catch {
      // Controller surfaces the error.
    }
  }

  return (
    <section className={styles.page} aria-label="Personas page">
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>Module 01</p>
          <h1 className={styles.title}>Personas</h1>
          <p className={styles.subtitle}>
            Pick the persona that shapes Generate, then edit the description inline.
          </p>
        </div>

        <div className={styles.selectedSummary}>
          <p className={styles.summaryLabel}>Selected for generation</p>
          {selectedRole ? (
            <>
              <strong>{selectedRole.title}</strong>
              <span>{selectedRole.description}</span>
            </>
          ) : (
            <span>Create a persona to choose what Generate uses.</span>
          )}
        </div>
      </header>

      {(loadError || actionError || createError || editError) && (
        <p className={styles.feedback} aria-live="polite">
          {loadError || actionError || createError || editError}
        </p>
      )}

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelLabel}>Create persona</p>
                <h2 className={styles.panelTitle}>New persona</h2>
              </div>
              <button type="button" className={styles.ghostButton} onClick={focusCreateForm}>
                <ArrowRight size={14} />
                Focus
              </button>
            </div>

            <div className={styles.form}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Title</span>
                <input
                  ref={createTitleRef}
                  className={styles.input}
                  value={createTitle}
                  onChange={(event) => setCreateTitle(event.target.value)}
                  placeholder="Frontend Specialist"
                  aria-invalid={createSubmitted && Boolean(createTitleError)}
                />
                {createSubmitted && createTitleError && (
                  <span className={styles.fieldError}>{createTitleError}</span>
                )}
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Description</span>
                <textarea
                  className={styles.textarea}
                  rows={5}
                  value={createDescription}
                  onChange={(event) => setCreateDescription(event.target.value)}
                  placeholder="Describe how this persona should influence prompts."
                  aria-invalid={createSubmitted && Boolean(createDescriptionError)}
                />
                {createSubmitted && createDescriptionError && (
                  <span className={styles.fieldError}>{createDescriptionError}</span>
                )}
              </label>

              <div className={styles.formActions}>
                <button type="button" className={styles.secondaryButton} onClick={resetCreateForm}>
                  Clear
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => void handleCreate()}
                >
                  <Plus size={14} />
                  Create
                </button>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelLabel}>Selected persona</p>
                <h2 className={styles.panelTitle}>{selectedRole?.title ?? "None"}</h2>
              </div>
            </div>

            <div className={styles.summaryBody}>
              <p>{selectedRole?.description ?? "No persona is selected yet."}</p>
              {selectedRole && (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => onSelect(selectedRole.id)}
                >
                  <Check size={14} />
                  Selected
                </button>
              )}
            </div>
          </section>
        </aside>

        <section className={styles.listPanel}>
          <div className={styles.panelHeader}>
            <p className={styles.count}>{roles.length} total</p>
          </div>

          {isLoading ? (
            <p className={styles.feedback}>Loading personas...</p>
          ) : roles.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No personas yet</h3>
              <p>Create one to start selecting a persona for generation.</p>
              <button type="button" className={styles.primaryButton} onClick={focusCreateForm}>
                <Plus size={14} />
                Create your first persona
              </button>
            </div>
          ) : (
            <div className={styles.list}>
              {roles.map((role) => {
                const isSelected = role.id === activeRole;
                const isEditing = editingRoleId === role.id;
                const isDeleting = deleteRoleId === role.id;

                return (
                  <article
                    key={role.id}
                    className={[styles.card, isSelected ? styles.cardSelected : ""].join(" ")}
                  >
                    <div className={styles.cardHeader}>
                      <div>
                        <p className={styles.cardLabel}>{isSelected ? "Selected" : "Persona"}</p>
                        <h3 className={styles.cardTitle}>{role.title}</h3>
                      </div>

                      <button
                        type="button"
                        className={isSelected ? styles.selectedButton : styles.secondaryButton}
                        onClick={() => onSelect(role.id)}
                        disabled={isSelected}
                      >
                        {isSelected ? (
                          <>
                            <Check size={14} />
                            In use
                          </>
                        ) : (
                          <>
                            <ArrowRight size={14} />
                            Use
                          </>
                        )}
                      </button>
                    </div>

                    {isEditing ? (
                      <div className={styles.form}>
                        <label className={styles.field}>
                          <span className={styles.fieldLabel}>Title</span>
                          <input
                            className={styles.input}
                            value={editTitle}
                            onChange={(event) => setEditTitle(event.target.value)}
                            aria-invalid={editSubmitted && Boolean(editTitleError)}
                          />
                          {editSubmitted && editTitleError && (
                            <span className={styles.fieldError}>{editTitleError}</span>
                          )}
                        </label>

                        <label className={styles.field}>
                          <span className={styles.fieldLabel}>Description</span>
                          <textarea
                            className={styles.textarea}
                            rows={5}
                            value={editDescription}
                            onChange={(event) => setEditDescription(event.target.value)}
                            aria-invalid={editSubmitted && Boolean(editDescriptionError)}
                          />
                          {editSubmitted && editDescriptionError && (
                            <span className={styles.fieldError}>{editDescriptionError}</span>
                          )}
                        </label>

                        <div className={styles.formActions}>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={cancelEdit}
                          >
                            <X size={14} />
                            Cancel
                          </button>
                          <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={() => void handleSaveEdit()}
                            disabled={!canSaveEdit}
                          >
                            <Save size={14} />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className={styles.cardDescription}>{role.description}</p>

                        {isDeleting ? (
                          <div className={styles.deleteConfirm}>
                            <p>Delete this persona?</p>
                            <div className={styles.formActions}>
                              <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => setDeleteRoleId(null)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className={styles.dangerButton}
                                onClick={() => void handleDelete(role.id)}
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.cardActions}>
                            <button
                              type="button"
                              className={styles.secondaryButton}
                              onClick={() => startEdit(role)}
                            >
                              <PencilLine size={14} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className={styles.ghostDangerButton}
                              onClick={() => setDeleteRoleId(role.id)}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function getRequiredError(value: string, message: string) {
  return value.trim().length === 0 ? message : "";
}
