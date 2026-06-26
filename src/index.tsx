import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ConsoleLogDrawer } from "./components/ConsoleLogDrawer";

const drawerContainer = document.getElementById(
  "console-log-drawer-root",
) as HTMLElement;
createRoot(drawerContainer).render(<ConsoleLogDrawer />);

const container = document.getElementById("root") as HTMLElement;
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
