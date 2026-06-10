import { useState } from "react";
import { GitPullRequest } from "lucide-react";
import styles from "./GhReviewApp.module.css";

export function GhReviewApp() {
  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const canLoadPullRequests = username.trim().length > 0 && accessToken.trim().length > 0;

  return (
    <main className={styles.screen}>
      <section className={styles.header} aria-labelledby="gh-review-title">
        <span className={styles.eyebrow}>GitHub workflow</span>
        <h1 id="gh-review-title">GH Review</h1>
        <p>Conecte sua conta para revisar pull requests com contexto e velocidade.</p>
      </section>

      <form
        className={styles.credentialsForm}
        aria-label="GitHub credentials"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className={styles.fieldGroup}>
          <label htmlFor="github-username">GitHub username</label>
          <input
            id="github-username"
            name="githubUsername"
            type="text"
            autoComplete="username"
            placeholder="octocat"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="github-access-token">Access token</label>
          <input
            id="github-access-token"
            name="githubAccessToken"
            type="password"
            autoComplete="off"
            placeholder="ghp_..."
            spellCheck={false}
            value={accessToken}
            onChange={(event) => setAccessToken(event.target.value)}
          />
        </div>

        <button className={styles.submitButton} type="submit" disabled={!canLoadPullRequests}>
          <GitPullRequest size={18} />
          Buscar PRs
        </button>
      </form>
    </main>
  );
}
