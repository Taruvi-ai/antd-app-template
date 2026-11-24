// antd v5 officially supports React 16–18; this patch makes it work on React 19.
// Must be imported before any antd component. Remove when moving to antd v6.
import "@ant-design/v5-patch-for-react-19";
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
