import React, { useEffect } from "react";
import { useLogin } from "@refinedev/core";
import { Flex, Spin, Typography } from "antd";

export const Login: React.FC = () => {
  const { mutate: login } = useLogin();

  useEffect(() => {
    login({ redirect: true });
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
      <Typography.Text type="secondary">
        Redirecting to login...
      </Typography.Text>
    </Flex>
  );
};
