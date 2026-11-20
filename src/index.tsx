import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { installClientLogger } from "./utils/clientLogger";
import "./app-root.css";

// Dev-only: ships browser errors to logs/frontend.ndjson via the Vite middleware.
installClientLogger();

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
