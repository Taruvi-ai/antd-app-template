import { useList } from "@refinedev/core";
import { List } from "@refinedev/antd";
import { Input, Select, Space, Table, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { EXAMPLE_STATUS_VALUES } from "./formSchema";

type ExampleItem = {
  id: number | string;
  name: string;
  status?: (typeof EXAMPLE_STATUS_VALUES)[number];
  created_at?: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function ExampleList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filters = useMemo(() => {
    const nextFilters: Array<{ field: string; operator: "containss" | "eq"; value: string }> = [];

    if (searchTerm) {
      nextFilters.push({ field: "name", operator: "containss", value: searchTerm });
    }

    if (statusFilter) {
      nextFilters.push({ field: "status", operator: "eq", value: statusFilter });
    }

    return nextFilters;
  }, [searchTerm, statusFilter]);

  const { result, query } = useList<ExampleItem>({
    resource: "example_items",
    filters,
    sorters: [{ field: "id", order: "desc" }],
    pagination: {
      currentPage,
      pageSize,
    },
  });

  const rows = result?.data ?? [];
  const total = result?.total ?? 0;

  return (
    <List title="Example List (Backend Driven)">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space wrap>
          <Input.Search
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name"
            allowClear
            style={{ width: 280 }}
          />

          <Select
            placeholder="Filter by status"
            value={statusFilter}
            allowClear
            onChange={(value) => setStatusFilter(value)}
            style={{ width: 180 }}
            options={EXAMPLE_STATUS_VALUES.map((value) => ({
              label: value[0].toUpperCase() + value.slice(1),
              value,
            }))}
          />
        </Space>

        <Table<ExampleItem>
          rowKey="id"
          loading={query.isLoading}
          dataSource={rows}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE_OPTIONS.map(String),
            onChange: (page, nextPageSize) => {
              setCurrentPage(page);
              setPageSize(nextPageSize ?? 10);
            },
          }}
        >
          <Table.Column dataIndex="id" title="ID" width={90} />
          <Table.Column dataIndex="name" title="Name" />
          <Table.Column<ExampleItem>
            dataIndex="status"
            title="Status"
            width={140}
            render={(value) => {
              const color =
                value === "active" ? "green" : value === "archived" ? "default" : "gold";
              return <Tag color={color}>{value ?? "draft"}</Tag>;
            }}
          />
          <Table.Column dataIndex="created_at" title="Created At" width={220} />
          <Table.Column<ExampleItem>
            title="Actions"
            width={180}
            render={() => (
              <Space>
                <Typography.Text type="secondary">View</Typography.Text>
                <Typography.Text type="secondary">Edit</Typography.Text>
              </Space>
            )}
          />
        </Table>
      </Space>
    </List>
  );
}
