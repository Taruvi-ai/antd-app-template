/**
 * EXAMPLE: Public & Protected pages
 *
 * Shows the two route types in a Taruvi + Refine app and how to wire them
 * in App.tsx. The actual routing lives in App.tsx — the components here are
 * the page-level building blocks.
 *
 * ─── Route types ──────────────────────────────────────────────────────────────
 *
 *  PROTECTED  — requires a valid session. If the user is not authenticated,
 *               Refine's <Authenticated> wrapper redirects them to /login.
 *
 *  PUBLIC     — no authentication needed. Place these routes OUTSIDE the
 *               <Authenticated> wrapper in App.tsx.
 *
 * ─── App.tsx wiring ───────────────────────────────────────────────────────────
 *
 *  <Routes>
 *
 *    ── Public routes (outside Authenticated) ──────────────────────────────
 *    <Route path="/login"   element={<LoginRedirect />} />
 *    <Route path="/welcome" element={<WelcomePage />} />
 *
 *    ── Protected routes (inside Authenticated) ────────────────────────────
 *    <Route
 *      element={
 *        <Authenticated key="protected" fallback={<Navigate to="/login" />}>
 *          <ThemedLayout>
 *            <Outlet />
 *          </ThemedLayout>
 *        </Authenticated>
 *      }
 *    >
 *      <Route index element={<NavigateToResource resource="dashboard" />} />
 *      <Route path="/dashboard" element={<Dashboard />} />
 *      <Route path="/records"   element={<RecordsList />} />
 *    </Route>
 *
 *  </Routes>
 *
 * ─── Login ────────────────────────────────────────────────────────────────────
 *  Taruvi uses redirect-based auth. NEVER build a custom login form.
 *  Always use <LoginRedirect /> for /login and useLogin() to trigger the flow.
 *  Tokens come back in the URL hash — the authProvider handles them for you.
 */

import { useGetIdentity, useIsAuthenticated, useLogin, useLogout } from "@refinedev/core";
import { Alert, Button, Card, Divider, Space, Tag, Typography } from "antd";
import { LockOutlined, UnlockOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

// ─── 1. Public page component ────────────────────────────────────────────────
//
// A public page is just a normal React component. The "public" behaviour comes
// entirely from placing it OUTSIDE <Authenticated> in App.tsx routing.
// The component itself has no auth-awareness unless you choose to add it.

export function WelcomePage() {
  const { mutate: login } = useLogin();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 16,
        padding: 24,
      }}
    >
      <UnlockOutlined style={{ fontSize: 48, color: "#1677ff" }} />
      <Title level={2} style={{ margin: 0 }}>Welcome</Title>
      <Paragraph type="secondary" style={{ textAlign: "center", maxWidth: 400 }}>
        This is a public page. It is accessible without logging in because it
        lives outside the <Text code>&lt;Authenticated&gt;</Text> wrapper in{" "}
        <Text code>App.tsx</Text>.
      </Paragraph>
      <Button
        type="primary"
        size="large"
        onClick={() => login({ callbackUrl: "/dashboard" })}
      >
        Log in to continue
      </Button>
      <Tag color="blue">Route: /welcome — public</Tag>
    </div>
  );
}

// ─── 2. Protected page component ─────────────────────────────────────────────
//
// Also a plain React component. Being "protected" means it is placed INSIDE
// <Authenticated> in App.tsx. If the session expires mid-session, authProvider
// triggers a redirect to /login automatically via onError handling.
//
// You can additionally gate a protected page by ROLE using <CanAccess> — see
// can-access.tsx for that pattern.

export function ProtectedDashboard() {
  const { data: identity, isLoading } = useGetIdentity<{
    id: string;
    username: string;
    first_name?: string;
  }>();
  const { mutate: logout } = useLogout();

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <Space align="center" style={{ marginBottom: 16 }}>
        <LockOutlined style={{ fontSize: 24, color: "#52c41a" }} />
        <Title level={3} style={{ margin: 0 }}>Protected Dashboard</Title>
        <Tag color="green">Route: /dashboard — protected</Tag>
      </Space>

      <Paragraph type="secondary">
        This page is inside <Text code>&lt;Authenticated&gt;</Text> in App.tsx.
        Unauthenticated users are redirected to <Text code>/login</Text> before
        ever reaching this component.
      </Paragraph>

      <Card
        title={
          <Space>
            <UserOutlined />
            Current session
          </Space>
        }
        loading={isLoading}
        style={{ marginBottom: 16 }}
      >
        {identity ? (
          <Space direction="vertical">
            <Text>
              <Text strong>Username:</Text> {identity.username}
            </Text>
            <Text>
              <Text strong>ID:</Text> <Text code>{identity.id}</Text>
            </Text>
            {identity.first_name && (
              <Text>
                <Text strong>Name:</Text> {identity.first_name}
              </Text>
            )}
          </Space>
        ) : (
          <Text type="secondary">No identity loaded</Text>
        )}
      </Card>

      <Button danger onClick={() => logout()}>
        Log out
      </Button>
    </div>
  );
}

// ─── 3. Page that adapts to auth state (optional pattern) ────────────────────
//
// Sometimes you want a page that is publicly accessible but shows richer
// content when logged in (e.g. a landing page). Use useIsAuthenticated() for
// this — do NOT use it as a substitute for proper route protection.

export function AdaptivePage() {
  const { data: auth, isLoading } = useIsAuthenticated();
  const { data: identity } = useGetIdentity<{ username: string }>();
  const { mutate: login } = useLogin();

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <Title level={3}>Adaptive page (public + auth-aware)</Title>
      <Paragraph type="secondary">
        This page is publicly accessible. It uses{" "}
        <Text code>useIsAuthenticated()</Text> to show different content
        depending on session state. Do not use this instead of route protection
        for sensitive pages.
      </Paragraph>

      <Divider />

      {isLoading ? (
        <Text type="secondary">Checking session…</Text>
      ) : auth?.authenticated ? (
        <Alert
          type="success"
          message={`Logged in as ${identity?.username ?? "unknown"}`}
          description="You have an active session. Protected routes are accessible."
          showIcon
        />
      ) : (
        <Alert
          type="info"
          message="Not logged in"
          description={
            <Space direction="vertical">
              <Text>You are browsing as a guest.</Text>
              <Button
                type="primary"
                size="small"
                onClick={() => login({ callbackUrl: "/dashboard" })}
              >
                Log in
              </Button>
            </Space>
          }
          showIcon
        />
      )}
    </div>
  );
}

// ─── 4. LoginRedirect — always use this for /login ───────────────────────────
//
// Taruvi auth is redirect-based. Import LoginRedirect from components/auth and
// wire it to the /login route. Never replace it with a custom form.
//
// In App.tsx:
//   import { LoginRedirect } from "./components/auth/LoginRedirect";
//   <Route path="/login" element={<LoginRedirect />} />
//
// To trigger login from anywhere:
//   const { mutate: login } = useLogin();
//   login({ callbackUrl: "/dashboard" });  // redirects to /accounts/login/

// ─── Default export: reference page showing all patterns ─────────────────────

export default function PublicProtectedExample() {
  return (
    <div style={{ padding: 24, maxWidth: 760 }}>
      <Title level={3}>Public & Protected pages — Examples</Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Route protection is configured in <Text code>App.tsx</Text>, not inside
        individual page components. The components below show the building
        blocks; read the comments in this file for the App.tsx wiring.
      </Paragraph>

      <Card title="Route type summary" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Alert
            type="info"
            message={
              <>
                <Text strong>Public route</Text> — place outside{" "}
                <Text code>&lt;Authenticated&gt;</Text> in App.tsx. No session required.
                Examples: <Text code>/login</Text>, <Text code>/welcome</Text>
              </>
            }
          />
          <Alert
            type="success"
            message={
              <>
                <Text strong>Protected route</Text> — place inside{" "}
                <Text code>&lt;Authenticated fallback={"{"}...{"}"}&gt;</Text> in App.tsx.
                Redirects to <Text code>/login</Text> when session is missing.
                Examples: <Text code>/dashboard</Text>, <Text code>/records</Text>
              </>
            }
          />
          <Alert
            type="warning"
            message={
              <>
                <Text strong>Role-gated route</Text> — a protected route with an
                additional <Text code>&lt;CanAccess&gt;</Text> check inside the component.
                Authenticated users without the right role see a 403 screen.
                See <Text code>can-access.tsx</Text> for this pattern.
              </>
            }
          />
        </Space>
      </Card>

      <ProtectedDashboard />
      <AdaptivePage />
    </div>
  );
}
