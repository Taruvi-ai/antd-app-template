import {Refine} from "@refinedev/core";
import {DevtoolsPanel, DevtoolsProvider} from "@refinedev/devtools";
import {RefineKbar, RefineKbarProvider} from "@refinedev/kbar";

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
import {
  taruviAccessControlProvider,
  taruviAppProvider, taruviAuthProvider,
  taruviDataProvider,
  taruviStorageProvider,
  taruviUserProvider
} from "./providers/refineProviders.ts";
import Navkit from "@taruvi/navkit";
import {taruviClient} from "./taruviClient.ts";
import {useContext} from "react";
import {CustomSider} from "./components";
import ExampleCreate from "./pages/examples/create.tsx";
import ExampleList from "./pages/examples/list.tsx";
import ExampleEdit from "./pages/examples/edit.tsx";

function AppInner() {
  const {setMode} = useContext(ColorModeContext);

  return (
    <AntdApp>
      <DevtoolsProvider>
        <Navkit client={taruviClient} getTheme={(theme) => setMode(theme)}/>
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
          resources={[
            {name: "list", list: "/list"},
            {name: "create", list: "/create"},
            {name: "edit", list: "/edit"},
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
                  <Box sx={{ ml: { xs: 0, md: "72px" }, transition: "margin-left 0.2s ease-in-out" }}>
                    <Outlet/>
                  </Box>
                </ThemedLayout>
              }
            >
              <Route index element={<NavigateToResource resource="projects"/>}/>
              <Route path="/list" element={<ExampleList />}/>
              <Route path="/create" element={<ExampleCreate />}/>
              <Route path="/edit" element={<ExampleEdit />}/>
              <Route path="*" element={<ErrorComponent/>}/>
            </Route>
          </Routes>

          {/*<RefineKbar/>*/}
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
