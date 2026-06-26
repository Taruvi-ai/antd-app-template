import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  ErrorComponent,
  ThemedLayout,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import { Navkit } from "./navkit/Navkit";
import routerProvider, { DocumentTitleHandler } from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { useContext, useEffect, useRef } from "react";
import { taruviClient } from "./taruviClient";
import {
  taruviDataProvider,
  taruviAuthProvider,
  taruviStorageProvider,
  taruviAppProvider,
  taruviUserProvider,
  // taruviAccessControlProvider, // Uncomment to enable Cerbos-based access control
} from "./providers/refineProviders";
import {
  CustomSider,
  ErrorBoundary,
  UnsavedChangesDialog,
} from "./components";
import { LoginRedirect } from "./components/auth/LoginRedirect";
import {
  ColorModeContextProvider,
  ColorModeContext,
} from "./contexts/color-mode";
import { AppSettingsProvider, useAppSettings } from "./contexts/app-settings";
import { Home } from "./pages/home";
import { Login } from "./pages/login";
import { useNavkitProfileMenuItems } from "./navkit/useNavkitProfileMenuItems";
import "./app-root.css";

const AppContent = () => {
  const { setMode } = useContext(ColorModeContext);
  const navRef = useRef<HTMLDivElement>(null);
  const { settings } = useAppSettings();
  const profileMenuItems = useNavkitProfileMenuItems();

  useEffect(() => {
    if (navRef.current) {
      const height = navRef.current.offsetHeight;
      document.documentElement.style.setProperty("--nav-height", `${height}px`);
    }
  }, []);

  return (
    <>
      <div
        ref={navRef}
        data-nav-container
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1300,
          width: "100%",
        }}
      >
        <Navkit
          client={taruviClient}
          getTheme={(theme) => setMode(theme)}
          profileMenuItems={profileMenuItems}
        />
      </div>
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
            // accessControlProvider={taruviAccessControlProvider}
            resources={[]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              projectId: "OeEx5p-f4v2mf-61ddWh",
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="login-route" fallback={<Outlet />}>
                    <Navigate to="/" replace />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<Login />} />
              </Route>
              <Route
                element={
                  <Authenticated
                    key="authenticated-inner"
                    fallback={<LoginRedirect />}
                  >
                    <ThemedLayout
                      Header={() => null}
                      Sider={(props) => <CustomSider {...props} />}
                    >
                      <div
                        className="app-main-content"
                        style={{
                          marginLeft: "var(--app-sider-width, 56px)",
                          transition: "margin-left 0.2s ease-in-out",
                        }}
                      >
                        <ErrorBoundary>
                          <Outlet />
                        </ErrorBoundary>
                      </div>
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route index element={<Home />} />
                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>

            <RefineKbar />
            <UnsavedChangesDialog />
            <DocumentTitleHandler
              handler={() => settings?.displayName || ""}
            />
          </Refine>
          <DevtoolsPanel />
        </DevtoolsProvider>
      </AntdApp>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AppSettingsProvider>
            <AppContent />
          </AppSettingsProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
