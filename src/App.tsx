import {Refine} from "@refinedev/core";
import {Authenticated} from "@refinedev/core";
import {DevtoolsPanel, DevtoolsProvider} from "@refinedev/devtools";
import {RefineKbarProvider} from "@refinedev/kbar";

import {
  ThemedLayout,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import {App as AntdApp} from "antd";
import Box from "@mui/material/Box";
import {BrowserRouter, Outlet, Route, Routes} from "react-router";
import {ColorModeContext, ColorModeContextProvider} from "./contexts/color-mode";
import {useContext, useEffect, useRef} from "react";

import {
  taruviAppProvider,
  taruviAuthProvider,
  taruviDataProvider,
  taruviStorageProvider,
  taruviUserProvider,
  taruviAccessControlProvider,
} from "./providers/refineProviders.ts";
import Navkit from "@taruvi/navkit";
import {taruviClient} from "./taruviClient.ts";
import {CustomSider} from "./components";
import {DashboardOutlined} from "@ant-design/icons";
import {Login} from "./utils/Login";
import {Home} from "./pages/home";

function AppInner() {
  const {setMode} = useContext(ColorModeContext);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navRef.current) {
      document.documentElement.style.setProperty('--nav-height', `${navRef.current.offsetHeight}px`);
    }
  }, []);

  return (
    <AntdApp>
      <DevtoolsProvider>
        <Refine
          dataProvider={{
            default: taruviDataProvider,
            storage: taruviStorageProvider,
            app: taruviAppProvider,
            user: taruviUserProvider,
          }}
          notificationProvider={useNotificationProvider}
          routerProvider={routerProvider}
          authProvider={taruviAuthProvider}
          accessControlProvider={taruviAccessControlProvider}
          resources={[
            {
              name: "dashboard",
              list: "/dashboard",
              meta: { label: "Dashboard", icon: <DashboardOutlined /> },
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            projectId: "OeEx5p-f4v2mf-61ddWh",
          }}
        >
          <Routes>
            {/* ── Public — no auth required ── */}

            {/*<Route path="/welcome" element={<div>Welcome public page</div>} />*/}

            {/* ── Protected — requires a valid session ── */}
            <Route
              path="/*"
              element={
                <Authenticated key="protected" fallback={<Login />}>
                  <>
                    <div
                      ref={navRef}
                      style={{ position: 'sticky', top: 0, zIndex: 1300, width: '100%' }}
                    >
                      <Navkit client={taruviClient} getTheme={(theme) => setMode(theme)} />
                    </div>
                    <ThemedLayout Sider={(props) => <CustomSider {...props} />}>
                      <Box
                        sx={{
                          ml: { xs: 0, md: "var(--app-sider-width, 56px)" },
                          transition: "margin-left 0.2s ease-in-out",
                        }}
                      >
                        <Outlet />
                      </Box>
                    </ThemedLayout>
                  </>
                </Authenticated>
              }
            >
              <Route path="dashboard" element={<Home />}/>
            </Route>
          </Routes>
          <UnsavedChangesNotifier/>
          <DocumentTitleHandler/>
        </Refine>
        <DevtoolsPanel/>
      </DevtoolsProvider>
    </AntdApp>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AppInner/>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
