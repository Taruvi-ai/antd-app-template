import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Button, Modal, Typography, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import {
  getLastBoundaryAt,
  getSnapshot,
  subscribe,
  type LogEntry,
} from "../utils/clientLogger";

const BOUNDARY_SUPPRESS_WINDOW_MS = 1500;

const formatEntry = (entry: LogEntry) => {
  const time = new Date(entry.timestamp).toLocaleTimeString();
  return `[${time}] [${entry.source}] ${entry.text}`;
};

const copyText = async (text: string) => {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("Clipboard access is not available in this browser.");
  }
  await navigator.clipboard.writeText(text);
};

export const ConsoleLogDrawer = () => {
  const entries = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const previousCountRef = useRef(0);

  useEffect(() => {
    if (entries.length > previousCountRef.current) {
      const latestEntry = entries[entries.length - 1];
      const boundaryActive =
        latestEntry?.source === "react-error-boundary" ||
        Date.now() - getLastBoundaryAt() < BOUNDARY_SUPPRESS_WINDOW_MS;
      if (!boundaryActive) {
        setIsOpen(true);
      }
    }
    previousCountRef.current = entries.length;
  }, [entries]);

  const latestEntry = useMemo(() => entries[entries.length - 1] ?? null, [entries]);

  const handleCopyVisible = async () => {
    const text = latestEntry ? formatEntry(latestEntry) : "";
    if (!text) {
      message.error("No captured error to copy yet.");
      return;
    }
    try {
      await copyText(text);
      message.success("Latest error copied to clipboard.");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Failed to copy error.",
      );
    }
  };

  if (entries.length === 0 && !isOpen) {
    return null;
  }

  return (
    <Modal
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      title="Browser error captured"
      width={720}
      footer={
        <Button type="primary" danger onClick={() => setIsOpen(false)}>
          Dismiss
        </Button>
      }
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          padding: 16,
          background: "rgba(255, 77, 79, 0.08)",
          border: "1px solid #ff4d4f",
          borderRadius: 8,
        }}
      >
        <Typography.Paragraph
          style={{
            flex: 1,
            margin: 0,
            fontFamily: "Monaco, Consolas, 'Courier New', monospace",
            fontSize: 13,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {latestEntry?.text ?? "Unknown error"}
        </Typography.Paragraph>
        <Button
          type="text"
          icon={<CopyOutlined />}
          onClick={handleCopyVisible}
          aria-label="Copy error"
        />
      </div>
    </Modal>
  );
};
