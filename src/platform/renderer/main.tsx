import React from "react";
import ReactDOM from "react-dom/client";
import { PromptizerApp } from "../../features/prompt-studio/ui/PromptizerApp";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PromptizerApp />
  </React.StrictMode>,
);
