/**
 * EXAMPLE: CanAccess & useCan — Role-based UI access control
 *
 * This file shows the two ways to gate UI elements using Cerbos policies:
 *
 *   1. <CanAccess>  — declarative wrapper, hides children when unauthorized
 *   2. useCan()     — imperative hook, lets you branch logic in code
 *
 * ─── Prerequisites ────────────────────────────────────────────────────────────
 *  • accessControlProvider is wired in App.tsx (see bottom of this file)
 *  • A Cerbos policy exists for the resource you are checking
 *  • Resource strings are ALWAYS prefixed: "datatable:tasks", "custom:dashboard"
 *  • Action names are ALWAYS canonical: "read" | "create" | "update" | "delete" | "execute"
 *    (never pass "list", "show", or "edit" — they will never match a policy rule)
 *
 * ─── Action mapping cheat-sheet ───────────────────────────────────────────────
 *  UI context     →  pass to useCan / CanAccess
 *  list page      →  "read"
 *  show page      →  "read"
 *  edit form      →  "update"
 *  create form    →  "create"
 *  delete button  →  "delete"
 *  run function   →  "execute"
 */

import { CanAccess, useCan, useGetIdentity } from "@refinedev/core";
import { Alert, Button, Card, Divider, Space, Tag, Typography } from "antd";
import { DeleteOutlined, EditOutlined, LockOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

// ─── 1. <CanAccess> — declarative, preferred for whole sections ───────────────
//
// Props:
//   resource  — prefixed ACL string, e.g. "datatable:tasks"
//   action    — canonical Cerbos action
//   params    — optional { id } scopes the check to a specific row (row-level)
//   fallback  — rendered when access is denied (default: nothing / hidden)
//
// The component renders its children when authorized, and the fallback (or
// nothing) when unauthorized. It does NOT disable — it hides.

function SectionGuardedByRole() {
  return (
    <Card title="1 — <CanAccess>: hide a whole section by role" style={{ marginBottom: 24 }}>
      <Paragraph type="secondary">
        The card below is only visible to users whose role is allowed the
        <Text code>"read"</Text> action on <Text code>datatable:tasks</Text>.
      </Paragraph>

      {/* Basic: hide entire block for unauthorized roles */}
      <CanAccess resource="datatable:tasks" action="read">
        <Alert
          type="success"
          message="You can read tasks — this block is visible."
          showIcon
        />
      </CanAccess>

      <Divider />

      {/* With a fallback shown when access is denied */}
      <CanAccess
        resource="custom:dashboard"
        action="view"
        fallback={
          <Alert
            type="error"
            icon={<LockOutlined />}
            message="Admin only — you do not have access to the dashboard."
            showIcon
          />
        }
      >
        <Alert
          type="success"
          message="Admin dashboard is accessible to you."
          showIcon
        />
      </CanAccess>
    </Card>
  );
}

// ─── 2. <CanAccess params={{ id }}> — row-level check ────────────────────────
//
// When you pass params.id, the backend fetches that record's attributes and
// evaluates any CEL condition in the policy (e.g. created_by_id == principal.id).
// Without params.id the check is role-only (no row-level condition evaluated).

function RowActionsWithCanAccess({ records }: { records: { id: string; title: string }[] }) {
  return (
    <Card title="2 — <CanAccess params={{ id }}>: per-row action buttons" style={{ marginBottom: 24 }}>
      <Paragraph type="secondary">
        Edit is visible only when the policy's ownership condition matches this
        user. Delete is visible only to admins (role-only, no condition needed).
      </Paragraph>
      {records.map((record) => (
        <div
          key={record.id}
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
        >
          <Text style={{ flex: 1 }}>{record.title}</Text>

          {/* Row-level: checks "update" action + evaluates the CEL condition
              request.resource.attr.created_by_id == request.principal.id     */}
          <CanAccess resource="datatable:tasks" action="update" params={{ id: record.id }}>
            <Button size="small" icon={<EditOutlined />}>Edit</Button>
          </CanAccess>

          {/* Role-only: no params, just checks if the role has "delete" */}
          <CanAccess resource="datatable:tasks" action="delete">
            <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
          </CanAccess>
        </div>
      ))}
    </Card>
  );
}

// ─── 3. useCan() — imperative hook, branch your own logic ───────────────────
//
// Use this when you need to:
//   • conditionally fetch data based on permission
//   • show different text/styles depending on role
//   • disable (not hide) a control
//   • combine multiple checks into a single condition
//
// The hook is batched automatically — all useCan calls in the same render cycle
// are sent as ONE network request. Never debounce or throttle useCan manually.

function ImperativeChecks() {
  // Role-only check (no params) — fast, no record fetch needed
  const { data: canCreate, isLoading: createLoading } = useCan({
    resource: "datatable:tasks",
    action: "create",
  });

  // Role-only check for admin actions
  const { data: canDelete } = useCan({
    resource: "datatable:tasks",
    action: "delete",
  });

  // Row-level check — backend fetches record "abc-123" and evaluates CEL
  const { data: canEditRow } = useCan({
    resource: "datatable:tasks",
    action: "update",
    params: { id: "abc-123" },
  });

  return (
    <Card title="3 — useCan(): imperative permission checks" style={{ marginBottom: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Paragraph type="secondary">
          Check <Text code>data.can</Text> to branch logic in JSX or handlers.
          <Text code>isLoading</Text> is true while the check is in-flight.
        </Paragraph>

        {/* Render a button only when the user can create */}
        {canCreate?.can && (
          <Button type="primary" icon={<PlusOutlined />}>
            Create Task (shown because canCreate = true)
          </Button>
        )}

        {/* Disable a button instead of hiding it */}
        <Button
          disabled={!canCreate?.can || createLoading}
          loading={createLoading}
        >
          Save (disabled when no create permission)
        </Button>

        {/* Show role badge based on permission */}
        <Space>
          <Text>Your permissions:</Text>
          <Tag color={canCreate?.can ? "green" : "default"}>create</Tag>
          <Tag color={canDelete?.can ? "green" : "default"}>delete</Tag>
          <Tag color={canEditRow?.can ? "green" : "default"}>update row abc-123</Tag>
        </Space>
      </Space>
    </Card>
  );
}

// ─── 4. Combining useCan with useGetIdentity ─────────────────────────────────
//
// For ownership checks where you already have the row data (e.g. in a table),
// it is more efficient to compare identity.id against record.created_by_id
// directly rather than making a per-row useCan call. The policy still enforces
// it on the backend — this is purely a UI convenience.

function OwnershipCheckInTable() {
  const { data: identity } = useGetIdentity<{ id: string }>();

  const exampleRecord = {
    id: "abc-123",
    title: "Example record",
    created_by_id: identity?.id, // pretend this record was created by current user
  };

  const isOwner = !!identity?.id && exampleRecord.created_by_id === identity.id;

  return (
    <Card title="4 — Ownership check via identity (table rows)" style={{ marginBottom: 24 }}>
      <Paragraph type="secondary">
        When the row data already contains <Text code>created_by_id</Text>,
        compare it against <Text code>identity.id</Text> directly —
        no extra network round-trip per row.
      </Paragraph>
      <Space>
        <Text>{exampleRecord.title}</Text>
        {isOwner ? (
          <Button size="small" icon={<EditOutlined />}>Edit (you own this)</Button>
        ) : (
          <Text type="secondary">Edit not available (not your record)</Text>
        )}
      </Space>
    </Card>
  );
}

// ─── Main example page ────────────────────────────────────────────────────────

const EXAMPLE_RECORDS = [
  { id: "1", title: "Write documentation" },
  { id: "2", title: "Review pull request" },
];

export default function CanAccessExample() {
  return (
    <div style={{ padding: 24, maxWidth: 760 }}>
      <Title level={3}>CanAccess & useCan — Examples</Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        These patterns require <Text code>accessControlProvider</Text> wired in{" "}
        <Text code>App.tsx</Text>. See the comment below for the setup snippet.
      </Paragraph>

      <SectionGuardedByRole />
      <RowActionsWithCanAccess records={EXAMPLE_RECORDS} />
      <ImperativeChecks />
      <OwnershipCheckInTable />

      <Card title="App.tsx setup" style={{ marginBottom: 24 }}>
        <Paragraph>
          Wire <Text code>accessControlProvider</Text> once in <Text code>App.tsx</Text>:
        </Paragraph>
        <pre
          style={{
            background: "#f5f5f5",
            padding: 16,
            borderRadius: 6,
            fontSize: 13,
            overflowX: "auto",
          }}
        >
{`import { accessControlProvider } from "@taruvi/refine-providers";
import { taruviClient } from "./taruviClient";

<Refine
  accessControlProvider={accessControlProvider(taruviClient)}
  {/* ...other providers */}
/>`}
        </pre>
      </Card>
    </div>
  );
}
