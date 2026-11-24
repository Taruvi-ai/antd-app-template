import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNotification } from "@refinedev/core";
import { Button, Modal, Tooltip, Typography } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { getLastBoundaryAt, getSnapshot, subscribe, type LogEntry } from "../utils/clientLogger";

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

/** Pops up the latest captured client error. Opt-in: mount it inside <Refine>. */
export const ConsoleLogDrawer = () => {
  const { open } = useNotification();
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
      open?.({
        type: "error",
        message: "No error to copy",
        description: "There is no captured error yet.",
      });
      return;
    }
    try {
      await copyText(text);
      open?.({
        type: "success",
        message: "Error copied",
        description: "The latest error is in your clipboard.",
      });
    } catch (error) {
      open?.({
        type: "error",
        message: "Copy failed",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  if (entries.length === 0 && !isOpen) {
    return null;
  }

  return (
    <Modal
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      title="Something went wrong"
      width={720}
      footer={
        <Button type="primary" danger onClick={() => setIsOpen(false)}>
          Dismiss
        </Button>
      }
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <Typography.Paragraph
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "Monaco, Consolas, 'Courier New', monospace",
          }}
          type="danger"
        >
          {latestEntry?.text ?? "Unknown error"}
        </Typography.Paragraph>
        <Tooltip title="Copy error">
          <Button
            type="text"
            aria-label="Copy error"
            icon={<CopyOutlined />}
            onClick={handleCopyVisible}
          />
        </Tooltip>
      </div>
    </Modal>
  );
};
