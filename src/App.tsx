import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { ErrorComponent, ThemedLayout, useNotificationProvider } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import routerProvider, { DocumentTitleHandler } from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import { DashboardOutlined } from "@ant-design/icons";
import Navkit from "@taruvi/navkit";
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
import { CustomSider, ErrorBoundary, UnsavedChangesDialog } from "./components";
import { LoginRedirect } from "./components/auth/LoginRedirect";
import { ColorModeContextProvider, ColorModeContext } from "./contexts/color-mode";
import { AppSettingsProvider, useAppSettings } from "./contexts/app-settings";
import { Home } from "./pages/home";
import { Login } from "./pages/login";
import { useNavkitProfileMenuItems } from "./navkit/useNavkitProfileMenuItems";

const AppContent = () => {
  const { setMode } = useContext(ColorModeContext);
  const navRef = useRef<HTMLDivElement>(null);
  const { settings } = useAppSettings();
  const profileMenuItems = useNavkitProfileMenuItems();

  // Publish the Navkit banner height so the layout can sit below it.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const apply = () => {
      const h = el.offsetHeight;
      const root = document.documentElement;
      root.style.setProperty("--nav-height", `${h}px`);
      root.style.setProperty("--app-available-height", `calc(100vh - ${h}px)`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div
        ref={navRef}
        data-nav-container
        style={{ position: "sticky", top: 0, zIndex: 1300, width: "100%" }}
      >
        <Navkit
          client={taruviClient}
          getTheme={(theme) => setMode(theme)}
          profileMenuItems={profileMenuItems}
        />
      </div>
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
          // accessControlProvider={taruviAccessControlProvider} // Uncomment to enable Cerbos-based access control
          resources={[
            {
              name: "dashboard",
              list: "/",
              meta: { label: "Dashboard", icon: <DashboardOutlined /> },
            },
            // Add your resources here
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            projectId: "obEpHJ-M7JimA-31GF1J",
          }}
        >
          <Routes>
            {/* ── Public — no auth required (add public pages here) ── */}
            <Route
              element={
                <Authenticated key="login-route" fallback={<Outlet />}>
                  <Navigate to="/" replace />
                </Authenticated>
              }
            >
              <Route path="/login" element={<Login />} />
            </Route>

            {/* ── Protected — requires a valid session ── */}
            <Route
              element={
                <Authenticated key="authenticated-inner" fallback={<LoginRedirect />}>
                  <ThemedLayout
                    Header={() => null}
                    Sider={(props) => <CustomSider {...props} />}
                    initialSiderCollapsed={true}
                  >
                    <div
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
          <DocumentTitleHandler handler={() => settings?.displayName || ""} />
        </Refine>
        <DevtoolsPanel />
      </DevtoolsProvider>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <AppSettingsProvider>
              <AppContent />
            </AppSettingsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
