import {Refine} from "@refinedev/core";
import {DevtoolsPanel, DevtoolsProvider} from "@refinedev/devtools";
import {RefineKbarProvider} from "@refinedev/kbar";

import {
  ErrorComponent,
  ThemedLayout,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerProvider, {
  DocumentTitleHandler,
  NavigateToResource,
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
} from "./providers/refineProviders.ts";
import Navkit from "@taruvi/navkit";
import {taruviClient} from "./taruviClient.ts";
import {CustomSider} from "./components";
import {TaskDashboard, TaskCreate, TaskEdit, AllTasksList, MyTasksList} from "./pages/tasks";
import {DashboardOutlined, UnorderedListOutlined, UserOutlined} from "@ant-design/icons";

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
        <div
          ref={navRef}
          style={{ position: 'sticky', top: 0, zIndex: 1300, width: '100%' }}
        >
          <Navkit client={taruviClient} getTheme={(theme) => setMode(theme)} />
        </div>
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
          resources={[
            {
              name: "dashboard",
              list: "/dashboard",
              meta: { label: "Dashboard", icon: <DashboardOutlined /> },
            },
            {
              name: "my-tasks",
              list: "/my-tasks",
              meta: { label: "My Tasks", icon: <UserOutlined /> },
            },
            {
              name: "tasks",
              list: "/tasks",
              create: "/tasks/create",
              edit: "/tasks/edit/:id",
              meta: { label: "All Tasks", icon: <UnorderedListOutlined />, canDelete: true },
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            projectId: "OeEx5p-f4v2mf-61ddWh",
          }}
        >
          <Routes>
            <Route
              element={
                <ThemedLayout Sider={(props) => <CustomSider {...props} />}>
                  <Box
                    sx={{
                      ml: { xs: 0, md: "var(--app-sider-width, 56px)" },
                      transition: "margin-left 0.2s ease-in-out",
                    }}
                  >
                    <Outlet/>
                  </Box>
                </ThemedLayout>
              }
            >
              <Route index element={<NavigateToResource resource="dashboard"/>}/>
              <Route path="/dashboard" element={<TaskDashboard />}/>
              <Route path="/my-tasks" element={<MyTasksList />}/>
              <Route path="/tasks" element={<AllTasksList />}/>
              <Route path="/tasks/create" element={<TaskCreate />}/>
              <Route path="/tasks/edit/:id" element={<TaskEdit />}/>
              <Route path="*" element={<ErrorComponent/>}/>
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
