import type { PromtizerResponse } from "../../types/api";
import styles from "./ResponseCard.module.scss";

export interface ResponseCardProps {
  response: PromtizerResponse;
}

export function ResponseCard({ response }: ResponseCardProps) {
  const statusLabel = response.goodToGo ? "Ready to Go" : "Needs Refinement";

  return (
    <article className={styles.card} aria-label="Structured Promtizer response">
      <header className={styles.header}>
        <h3 className={styles.title}>{response.title}</h3>
        <span className={response.goodToGo ? styles.readyBadge : styles.refinementBadge}>
          {statusLabel}
        </span>
      </header>

      <p className={styles.description}>{response.description}</p>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Requirements addressed</h4>
        <ul className={styles.requirements}>
          {response.requirements.map((requirement) => (
            <li key={requirement}>{requirement}</li>
          ))}
        </ul>
      </section>

      <aside className={styles.expectationsCallout}>
        <h4 className={styles.sectionTitle}>What to expect</h4>
        <p>{response.expectations}</p>
      </aside>
    </article>
  );
}
