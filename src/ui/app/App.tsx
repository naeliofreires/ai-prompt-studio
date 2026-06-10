import { useState, type ComponentType } from "react";
import { GitPullRequest } from "lucide-react";
import { GhReviewApp } from "../../../apps/gh-review/ui/app/GhReviewApp";
import { PromptizerApp } from "../../../apps/promptizer/ui/app/PromptizerApp";
import styles from "./App.module.css";

type HubAppId = "promptizer" | "gh-review";

interface HubAppIconProps {
  size?: number;
  className?: string;
}

interface HubApp {
  id: HubAppId;
  label: string;
  icon: ComponentType<HubAppIconProps>;
}

function PromptizerMenuIcon({ className }: HubAppIconProps) {
  return <img src="/icon.svg" alt="" aria-hidden="true" className={className} />;
}

const hubApps: HubApp[] = [
  {
    id: "promptizer",
    label: "Promptizer",
    icon: PromptizerMenuIcon,
  },
  {
    id: "gh-review",
    label: "GH Review",
    icon: GitPullRequest,
  },
];

export function App() {
  const [activeApp, setActiveApp] = useState<HubAppId>("promptizer");

  return (
    <div className={styles.hubShell}>
      <aside className={styles.sideRail}>
        <nav className={styles.appMenu} aria-label="Aplicativos">
          {hubApps.map((app) => {
            const Icon = app.icon;
            const isActive = activeApp === app.id;

            return (
              <button
                key={app.id}
                type="button"
                className={styles.appButton}
                aria-label={app.label}
                aria-current={isActive ? "page" : undefined}
                title={app.label}
                onClick={() => setActiveApp(app.id)}
              >
                <Icon size={22} className={styles.appButtonIcon} />
              </button>
            );
          })}
        </nav>
      </aside>

      <div className={styles.appViewport}>
        {activeApp === "promptizer" ? <PromptizerApp /> : <GhReviewApp />}
      </div>
    </div>
  );
}
