import { useEffect } from "react";
import { useLogin } from "@refinedev/core";
import { Flex, Spin, Typography } from "antd";

/**
 * Triggers redirect-based login flow.
 * Shows a loading indicator while redirecting to the backend login page.
 */
export const LoginRedirect: React.FC = () => {
  const { mutate: login } = useLogin();

  useEffect(() => {
    const callbackUrl = window.location.origin + window.location.pathname;
    login({ redirect: true, callbackUrl });
  }, [login]);

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap="middle"
      style={{ minHeight: "100vh" }}
    >
      <Spin size="large" />
      <Typography.Text type="secondary">Redirecting to login...</Typography.Text>
    </Flex>
  );
};
