import { Plus } from "lucide-react";
import type { Role } from "../../types/role";
import { PanelHeader } from "../shared/PanelHeader";
import { iconForRole } from "./roleIcons";
import styles from "./PersonaPanel.module.scss";

export interface PersonaPanelProps {
  roles: Role[];
  activeRole: string;
  isLoading: boolean;
  loadError: string;
  actionError: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onManage: (role: Role) => void;
}

export function PersonaPanel({
  roles,
  activeRole,
  isLoading,
  loadError,
  actionError,
  onSelect,
  onCreate,
  onManage,
}: PersonaPanelProps) {
  return (
    <>
      <PanelHeader
        label="Module 01"
        title="Persona Matrix"
        action={
          <button type="button" className={styles.personaCreateButton} onClick={onCreate}>
            <Plus size={14} />
            <span>New persona</span>
          </button>
        }
      />

      {(loadError || actionError) && (
        <p className={styles.personaFeedback}>{loadError || actionError}</p>
      )}

      <div className={styles.personaGrid}>
        {isLoading ? (
          <p className={styles.personaFeedback}>Loading custom personas...</p>
        ) : (
          roles.map((role) => {
            const Icon = iconForRole(role);
            const isActive = role.id === activeRole;

            return (
              <div key={role.id} className={styles.personaCard}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSelect(role.id)}
                  className={[
                    styles.personaButton,
                    isActive ? styles.personaButtonActive : styles.personaButtonIdle,
                  ].join(" ")}
                >
                  <div className={styles.personaButtonLabel}>
                    <Icon size={14} />
                    <span>{role.title}</span>
                  </div>
                  <p className={styles.personaDescription}>{role.description}</p>
                </button>
                {role.source === "custom" && (
                  <button
                    type="button"
                    className={styles.personaManageButton}
                    onClick={() => onManage(role)}
                  >
                    Manage
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
