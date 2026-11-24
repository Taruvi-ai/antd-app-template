import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Collapse, Flex, Result, Typography } from "antd";
import { CheckOutlined, CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import { reportError } from "../utils/clientLogger";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  error: Error | null;
  copied: boolean;
};

const formatError = (error: Error): string =>
  error.stack || `${error.name}: ${error.message}`;

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, copied: false };
  private copyResetTimer: ReturnType<typeof setTimeout> | null = null;

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError("react-error-boundary", [error], {
      component_stack: info.componentStack ?? "",
    });
  }

  componentWillUnmount(): void {
    if (this.copyResetTimer) clearTimeout(this.copyResetTimer);
  }

  handleReset = (): void => {
    this.setState({ error: null, copied: false });
  };

  handleCopy = async (): Promise<void> => {
    const error = this.state.error;
    if (!error) return;
    try {
      await navigator.clipboard.writeText(formatError(error));
      this.setState({ copied: true });
      if (this.copyResetTimer) clearTimeout(this.copyResetTimer);
      this.copyResetTimer = setTimeout(() => this.setState({ copied: false }), 1500);
    } catch {
      /* clipboard unavailable — user can still select the details manually */
    }
  };

  render(): ReactNode {
    const { error, copied } = this.state;

    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <Flex justify="center" style={{ padding: "48px 16px" }}>
        <Result
          status="error"
          title="This page hit a snag."
          subTitle="One of the components on this page couldn't render. The rest of the app is fine — you can retry, or copy the details to share with whoever is helping you."
          extra={[
            <Button key="retry" type="primary" icon={<ReloadOutlined />} onClick={this.handleReset}>
              Try again
            </Button>,
            <Button
              key="copy"
              icon={copied ? <CheckOutlined /> : <CopyOutlined />}
              onClick={this.handleCopy}
            >
              {copied ? "Copied" : "Copy details"}
            </Button>,
          ]}
        >
          <Typography.Paragraph>
            <Typography.Text code>{error.name || "Error"}</Typography.Text>{" "}
            <Typography.Text type="danger">
              {error.message || "An unknown error occurred."}
            </Typography.Text>
          </Typography.Paragraph>
          <Collapse
            ghost
            items={[
              {
                key: "details",
                label: "Technical details",
                children: (
                  <pre
                    style={{
                      margin: 0,
                      maxHeight: 320,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: 12,
                    }}
                  >
                    {formatError(error)}
                  </pre>
                ),
              },
            ]}
          />
        </Result>
      </Flex>
    );
  }
}
