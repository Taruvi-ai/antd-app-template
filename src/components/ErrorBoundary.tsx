import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Card, Collapse, Space, Typography } from "antd";
import {
  CheckOutlined,
  CopyOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
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
    const text = formatError(error);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      this.setState({ copied: true });
      if (this.copyResetTimer) clearTimeout(this.copyResetTimer);
      this.copyResetTimer = setTimeout(
        () => this.setState({ copied: false }),
        1500,
      );
    } catch {
      /* user can still select text manually */
    }
  };

  render(): ReactNode {
    const { error, copied } = this.state;

    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
        }}
      >
        <Card
          style={{ width: "100%", maxWidth: 720, borderLeft: "3px solid #ff4d4f" }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Typography.Text type="danger" strong style={{ letterSpacing: "0.14em" }}>
                ERROR
              </Typography.Text>
              <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                {error.name || "Error"}
              </Typography.Text>
            </div>

            <div>
              <Typography.Title level={3} style={{ marginTop: 0 }}>
                This page hit a snag.
              </Typography.Title>
              <Typography.Paragraph type="secondary">
                One of the components on this page couldn&apos;t render. The rest of
                the app is fine — you can retry, or copy the details to share with
                whoever is helping you.
              </Typography.Paragraph>
            </div>

            <Typography.Paragraph
              code
              style={{
                display: "block",
                padding: "12px 16px",
                background: "rgba(255, 77, 79, 0.06)",
                borderLeft: "2px solid #ff4d4f",
                margin: 0,
                wordBreak: "break-word",
              }}
            >
              {error.message || "An unknown error occurred."}
            </Typography.Paragraph>

            <Space wrap>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={this.handleReset}
              >
                Try again
              </Button>
              <Button
                icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                onClick={this.handleCopy}
              >
                {copied ? "Copied" : "Copy details"}
              </Button>
            </Space>

            <Collapse
              items={[
                {
                  key: "details",
                  label: "Technical details",
                  children: (
                    <Typography.Paragraph
                      style={{
                        margin: 0,
                        fontFamily: "monospace",
                        fontSize: 12,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {formatError(error)}
                    </Typography.Paragraph>
                  ),
                },
              ]}
            />
          </Space>
        </Card>
      </div>
    );
  }
}
