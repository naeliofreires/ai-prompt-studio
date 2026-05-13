import type { PersonaId } from "../../../shared";
import styles from "./PersonaSelector.module.css";

interface Persona {
  id: PersonaId;
  title: string;
  description: string;
}

interface PersonaSelectorProps {
  roles: Persona[];
  activeRole: PersonaId;
  onSelect: (id: PersonaId) => void;
}

export function PersonaSelector({ roles, activeRole, onSelect }: PersonaSelectorProps) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.step}>01</span>
        <div>
          <h2>Persona</h2>
        </div>
      </div>

      <div className={styles.personaGrid}>
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            aria-pressed={role.id === activeRole}
            className={role.id === activeRole ? styles.personaActive : styles.persona}
            onClick={() => onSelect(role.id)}
          >
            <span>{role.title}</span>
            <small>{role.description}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
