import type { CrudFilters } from "@refinedev/core";
import { HttpError } from "@refinedev/core";
import { List, useTable } from "@refinedev/antd";
import { Button, Form, Input, Select, Space, Table, Tag, Typography } from "antd";
import { EXAMPLE_STATUS_VALUES } from "./formSchema";

type ExampleItem = {
  id: number | string;
  name: string;
  status?: (typeof EXAMPLE_STATUS_VALUES)[number];
  created_at?: string;
};

type ExampleSearch = {
  name?: string;
  status?: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export default function ExampleList() {
  const { tableProps, searchFormProps } = useTable<ExampleItem, HttpError, ExampleSearch>({
    resource: "example_items",
    pagination: {
      mode: "server",
      pageSize: 10,
    },
    sorters: {
      initial: [{ field: "id", order: "desc" }],
    },
    onSearch: (values): CrudFilters => {
      const next: CrudFilters = [];
      const name = values.name?.trim();
      if (name) {
        next.push({ field: "name", operator: "containss", value: name });
      }
      if (values.status) {
        next.push({ field: "status", operator: "eq", value: values.status });
      }
      return next;
    },
  });

  return (
    <List title="Example List (useTable + server pagination)">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Form {...searchFormProps} layout="inline">
          <Form.Item name="name">
            <Input.Search
              placeholder="Search by name"
              allowClear
              style={{ width: 280 }}
              onSearch={() => searchFormProps.form?.submit?.()}
            />
          </Form.Item>

          <Form.Item name="status">
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: 180 }}
              options={EXAMPLE_STATUS_VALUES.map((value) => ({
                label: value[0].toUpperCase() + value.slice(1),
                value,
              }))}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Apply filters
            </Button>
          </Form.Item>
        </Form>

        <Table<ExampleItem>
          {...tableProps}
          rowKey="id"
          pagination={
            tableProps.pagination === false
              ? false
              : {
                  ...tableProps.pagination,
                  showSizeChanger: true,
                  pageSizeOptions: [...PAGE_SIZE_OPTIONS].map(String),
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }
          }
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
