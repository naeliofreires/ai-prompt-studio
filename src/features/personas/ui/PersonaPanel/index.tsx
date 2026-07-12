import { ArrowRight, Check } from "lucide-react";
import type { Role } from "../role";
import { PanelHeader } from "../../../../platform/renderer/components/shared/PanelHeader";
import { iconForRole } from "./roleIcons";
import styles from "./PersonaPanel.module.scss";

export interface PersonaPanelProps {
  roles: Role[];
  activeRole: string;
  isLoading: boolean;
  loadError: string;
  actionError: string;
  onSelect: (id: string) => void;
  onManagePersonas: () => void;
}

interface PersonaCardProps {
  persona: Role;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function PersonaPanel({
  roles,
  activeRole,
  isLoading,
  loadError,
  actionError,
  onSelect,
  onManagePersonas,
}: PersonaPanelProps) {
  return (
    <>
      <PanelHeader
        label="Module 01"
        title="Persona Matrix"
        action={
          <button type="button" className={styles.personaCreateButton} onClick={onManagePersonas}>
            <ArrowRight size={14} />
            <span>Personas</span>
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
            const isActive = role.id === activeRole;

            return (
              <div key={role.id} className={styles.personaCardShell}>
                <PersonaCard persona={role} isActive={isActive} onSelect={onSelect} />
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function PersonaCard({ persona, isActive, onSelect }: PersonaCardProps) {
  const Icon = iconForRole(persona);

  return (
    <div
      className={[
        styles.personaCard,
        isActive ? styles.personaButtonActive : styles.personaButtonIdle,
      ].join(" ")}
    >
      <button
        type="button"
        aria-pressed={isActive}
        onClick={() => onSelect(persona.id)}
        className={styles.personaButton}
      >
        <div className={styles.personaButtonLabel}>
          <span className={styles.personaTitleGroup}>
            <Icon size={12} />
            <span>{persona.title}</span>
          </span>
          {isActive && (
            <span className={styles.personaSelectedBadge}>
              <Check size={12} />
              Selected
            </span>
          )}
        </div>
        <p className={styles.personaDescription}>{persona.description}</p>
      </button>
    </div>
  );
}
