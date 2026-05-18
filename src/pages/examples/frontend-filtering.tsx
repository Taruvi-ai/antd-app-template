/**
 * EXAMPLE: Frontend (client-side) filtering
 *
 * Use client-side filtering ONLY when:
 *   • The full dataset is small and already loaded (e.g. a config list, enum values)
 *   • The user explicitly asked for local filtering
 *   • The list is intentionally not backend-driven (e.g. static reference data)
 *
 * For any backend-backed list, use server-side filters via useList / useDataGrid
 * instead — see list.tsx in this folder for that pattern.
 *
 * ─── What this file covers ────────────────────────────────────────────────────
 *   1. Filter a locally held array (no backend at all)
 *   2. Fetch once from the backend, then filter in React
 *   3. Controlled filter state with reset
 *   4. Debounced text filter (avoids re-rendering on every keystroke)
 */

import { useList } from "@refinedev/core";
import { Input, Select, Space, Table, Tag, Typography } from "antd";
import { useMemo, useState } from "react";

const { Title, Text, Paragraph } = Typography;

// ─── Shared types & constants ─────────────────────────────────────────────────

type ExampleItem = {
  id: string | number;
  name: string;
  status: "active" | "draft" | "archived";
  priority: "low" | "medium" | "high";
};

const STATUS_OPTIONS = ["active", "draft", "archived"] as const;
const PRIORITY_OPTIONS = ["low", "medium", "high"] as const;

const STATUS_COLORS: Record<string, string> = {
  active: "green",
  draft: "gold",
  archived: "default",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "blue",
  medium: "orange",
  high: "red",
};

// ─── 1. Filter a static local array ──────────────────────────────────────────
//
// The simplest case: the data lives in the component (or a constant).
// All filtering is pure JavaScript — no hooks, no network.

const STATIC_ITEMS: ExampleItem[] = [
  { id: 1, name: "Write docs",       status: "active",   priority: "high"   },
  { id: 2, name: "Review PR",        status: "draft",    priority: "medium" },
  { id: 3, name: "Fix bug #42",      status: "active",   priority: "high"   },
  { id: 4, name: "Update README",    status: "archived", priority: "low"    },
  { id: 5, name: "Deploy to staging",status: "active",   priority: "medium" },
  { id: 6, name: "Team standup",     status: "draft",    priority: "low"    },
];

function StaticArrayFilter() {
  const [nameFilter, setNameFilter]         = useState("");
  const [statusFilter, setStatusFilter]     = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();

  // useMemo keeps the derived array stable — recomputes only when inputs change
  const filtered = useMemo(() => {
    return STATIC_ITEMS.filter((item) => {
      const matchesName     = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesStatus   = !statusFilter   || item.status   === statusFilter;
      const matchesPriority = !priorityFilter || item.priority === priorityFilter;
      return matchesName && matchesStatus && matchesPriority;
    });
  }, [nameFilter, statusFilter, priorityFilter]);

  return (
    <div style={{ marginBottom: 32 }}>
      <Title level={5}>1 — Static array filter</Title>
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        All data is in a constant. Filtering is pure JS inside{" "}
        <Text code>useMemo</Text>.
      </Paragraph>

      <Space wrap style={{ marginBottom: 12 }}>
        <Input
          placeholder="Search name…"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          allowClear
          style={{ width: 200 }}
        />
        <Select
          placeholder="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          style={{ width: 140 }}
          options={STATUS_OPTIONS.map((v) => ({ label: v, value: v }))}
        />
        <Select
          placeholder="Priority"
          value={priorityFilter}
          onChange={setPriorityFilter}
          allowClear
          style={{ width: 140 }}
          options={PRIORITY_OPTIONS.map((v) => ({ label: v, value: v }))}
        />
      </Space>

      <Table<ExampleItem> rowKey="id" dataSource={filtered} pagination={false} size="small">
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column<ExampleItem> dataIndex="status"   title="Status"   width={110}
          render={(v) => <Tag color={STATUS_COLORS[v]}>{v}</Tag>} />
        <Table.Column<ExampleItem> dataIndex="priority" title="Priority" width={110}
          render={(v) => <Tag color={PRIORITY_COLORS[v]}>{v}</Tag>} />
      </Table>
    </div>
  );
}

// ─── 2. Fetch once, filter in React ──────────────────────────────────────────
//
// Fetch a small list once (pagination: mode "off") and keep all filtering
// in React state. Only use this pattern for genuinely small, stable datasets
// (config lists, enum lookup tables, etc.). For large or growing datasets,
// push filters to the backend instead.

function FetchOnceFilter() {
  const [nameFilter,     setNameFilter]     = useState("");
  const [statusFilter,   setStatusFilter]   = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();

  // Fetch the full list once — no server-side filters sent
  const { result, query } = useList<ExampleItem>({
    resource: "example_items",
    pagination: { mode: "off" },  // fetch all rows in one request
    sorters: [{ field: "name", order: "asc" }],
  });

  const allItems = (result?.data ?? []) as ExampleItem[];

  // Filter the fetched array in React
  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      const matchesName     = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesStatus   = !statusFilter   || item.status   === statusFilter;
      const matchesPriority = !priorityFilter || item.priority === priorityFilter;
      return matchesName && matchesStatus && matchesPriority;
    });
  }, [allItems, nameFilter, statusFilter, priorityFilter]);

  return (
    <div style={{ marginBottom: 32 }}>
      <Title level={5}>2 — Fetch once, filter in React</Title>
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        <Text code>pagination: {"{ mode: \"off\" }"}</Text> fetches all rows in one
        request. Filtering runs entirely in <Text code>useMemo</Text> on the cached data.
        Only appropriate for small, stable datasets (under ~500 rows).
      </Paragraph>

      <Space wrap style={{ marginBottom: 12 }}>
        <Input
          placeholder="Search name…"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          allowClear
          style={{ width: 200 }}
        />
        <Select
          placeholder="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          style={{ width: 140 }}
          options={STATUS_OPTIONS.map((v) => ({ label: v, value: v }))}
        />
        <Select
          placeholder="Priority"
          value={priorityFilter}
          onChange={setPriorityFilter}
          allowClear
          style={{ width: 140 }}
          options={PRIORITY_OPTIONS.map((v) => ({ label: v, value: v }))}
        />
      </Space>

      <Table<ExampleItem>
        rowKey="id"
        loading={query.isLoading}
        dataSource={filtered}
        pagination={false}
        size="small"
      >
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column<ExampleItem> dataIndex="status"   title="Status"   width={110}
          render={(v) => <Tag color={STATUS_COLORS[v]}>{v}</Tag>} />
        <Table.Column<ExampleItem> dataIndex="priority" title="Priority" width={110}
          render={(v) => <Tag color={PRIORITY_COLORS[v]}>{v}</Tag>} />
      </Table>
    </div>
  );
}

// ─── 3. Controlled filter state with a reset button ──────────────────────────
//
// Centralise all filter state in a single object so you can reset everything
// in one setState call — useful when there are 3+ filter fields.

type FilterState = {
  name: string;
  status: string | undefined;
  priority: string | undefined;
};

const DEFAULT_FILTERS: FilterState = {
  name: "",
  status: undefined,
  priority: undefined,
};

function ControlledFiltersWithReset() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const filtered = useMemo(() => {
    return STATIC_ITEMS.filter((item) => {
      const matchesName     = !filters.name     || item.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesStatus   = !filters.status   || item.status   === filters.status;
      const matchesPriority = !filters.priority || item.priority === filters.priority;
      return matchesName && matchesStatus && matchesPriority;
    });
  }, [filters]);

  const isDirty = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div style={{ marginBottom: 32 }}>
      <Title level={5}>3 — Centralised filter state + reset</Title>
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        All filter fields live in one object. The Reset button restores{" "}
        <Text code>DEFAULT_FILTERS</Text> in a single call.
      </Paragraph>

      <Space wrap style={{ marginBottom: 12 }}>
        <Input
          placeholder="Search name…"
          value={filters.name}
          onChange={(e) => setFilter("name", e.target.value)}
          allowClear
          style={{ width: 200 }}
        />
        <Select
          placeholder="Status"
          value={filters.status}
          onChange={(v) => setFilter("status", v)}
          allowClear
          style={{ width: 140 }}
          options={STATUS_OPTIONS.map((v) => ({ label: v, value: v }))}
        />
        <Select
          placeholder="Priority"
          value={filters.priority}
          onChange={(v) => setFilter("priority", v)}
          allowClear
          style={{ width: 140 }}
          options={PRIORITY_OPTIONS.map((v) => ({ label: v, value: v }))}
        />
        {isDirty && (
          <a onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</a>
        )}
        <Text type="secondary">
          Showing {filtered.length} / {STATIC_ITEMS.length}
        </Text>
      </Space>

      <Table<ExampleItem> rowKey="id" dataSource={filtered} pagination={false} size="small">
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column<ExampleItem> dataIndex="status"   title="Status"   width={110}
          render={(v) => <Tag color={STATUS_COLORS[v]}>{v}</Tag>} />
        <Table.Column<ExampleItem> dataIndex="priority" title="Priority" width={110}
          render={(v) => <Tag color={PRIORITY_COLORS[v]}>{v}</Tag>} />
      </Table>
    </div>
  );
}

// ─── 4. Debounced text filter ─────────────────────────────────────────────────
//
// Avoids re-filtering on every keystroke for large arrays. The filter state is
// split into an "input" value (updates immediately for the UI) and a "term"
// value (updates after a 300ms pause). The heavy useMemo only re-runs when
// "term" changes.
//
// Note: for BACKEND-driven lists, debounce the term before updating the
// provider filter (so you don't fire a new HTTP request on every keystroke).
// For client-side filtering this is a nice-to-have but rarely necessary.

function DebouncedTextFilter() {
  const [inputValue, setInputValue] = useState("");
  // "term" updates after the user stops typing for 300 ms
  const [term, setTerm]             = useState("");

  // Debounce: update term 300 ms after input stops changing
  const handleChange = (value: string) => {
    setInputValue(value);
    clearTimeout((handleChange as any).__timer);
    (handleChange as any).__timer = setTimeout(() => setTerm(value.trim()), 300);
  };

  const filtered = useMemo(
    () =>
      STATIC_ITEMS.filter((item) =>
        !term || item.name.toLowerCase().includes(term.toLowerCase()),
      ),
    [term],
  );

  return (
    <div style={{ marginBottom: 32 }}>
      <Title level={5}>4 — Debounced text filter</Title>
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        <Text code>inputValue</Text> updates every keystroke (controlled input).
        <Text code>term</Text> updates 300 ms after typing stops (drives filtering).
        For backend lists, send <Text code>term</Text> as a provider filter instead.
      </Paragraph>

      <Input
        placeholder="Type to filter name…"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        allowClear
        style={{ width: 260, marginBottom: 12 }}
      />
      <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
        Active filter term: <Text code>{term || "(none)"}</Text>
        {" · "}showing {filtered.length} of {STATIC_ITEMS.length}
      </Text>

      <Table<ExampleItem> rowKey="id" dataSource={filtered} pagination={false} size="small">
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column<ExampleItem> dataIndex="status"   title="Status"   width={110}
          render={(v) => <Tag color={STATUS_COLORS[v]}>{v}</Tag>} />
        <Table.Column<ExampleItem> dataIndex="priority" title="Priority" width={110}
          render={(v) => <Tag color={PRIORITY_COLORS[v]}>{v}</Tag>} />
      </Table>
    </div>
  );
}

// ─── Main example page ────────────────────────────────────────────────────────

export default function FrontendFilteringExample() {
  return (
    <div style={{ padding: 24, maxWidth: 760 }}>
      <Title level={3}>Frontend (client-side) filtering — Examples</Title>
      <Paragraph type="secondary" style={{ marginBottom: 8 }}>
        Use these patterns only for small / static datasets. For any
        backend-backed list, push filters to the server via{" "}
        <Text code>useList</Text> / <Text code>useDataGrid</Text> filters — see{" "}
        <Text code>list.tsx</Text> for that pattern.
      </Paragraph>

      <StaticArrayFilter />
      <FetchOnceFilter />
      <ControlledFiltersWithReset />
      <DebouncedTextFilter />
    </div>
  );
}
