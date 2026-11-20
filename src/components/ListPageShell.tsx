import type { ReactNode } from "react";
import { CreateButton, List } from "@refinedev/antd";
import { Flex, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

/**
 * The standard list-page shell. Every list page renders as **one** card
 * section: heading + primary action, then the toolbar row, then the
 * active-filter row, then the rows. Use this rather than hand-rolling the
 * scaffold so list pages don't drift apart in composition.
 *
 * Page-level padding lives here, so pages own their padding in one place.
 */
export type ListPageShellProps = {
  /** Page heading. Rendered as the page's only H1. */
  title: string;
  /** Label for the primary create action, e.g. "New ticket". Omit for no create button. */
  createLabel?: string;
  /** Search input and filter controls, laid out in the standard toolbar row. */
  toolbar: ReactNode;
  /** Active-filter tag row. Render `null`/`undefined` when no filter is set. */
  activeFilters?: ReactNode;
  /** The table or list body, including its own empty and loading states. */
  children: ReactNode;
};

export const ListPageShell = ({
  title,
  createLabel,
  toolbar,
  activeFilters,
  children,
}: ListPageShellProps) => (
  <div style={{ padding: 16 }}>
    <List
      title={<Typography.Title level={2} style={{ margin: 0 }}>{title}</Typography.Title>}
      headerButtons={
        createLabel ? (
          <CreateButton type="primary" icon={<PlusOutlined />}>
            {createLabel}
          </CreateButton>
        ) : null
      }
    >
      <Flex wrap gap={12} align="center" style={{ marginBottom: 16 }}>
        {toolbar}
      </Flex>

      {activeFilters ? <div style={{ marginBottom: 12 }}>{activeFilters}</div> : null}

      {children}
    </List>
  </div>
);
