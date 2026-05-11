import { useCustom, useGetIdentity, useList } from "@refinedev/core";
import { Card, Col, Row, Statistic, Table, Typography } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, FireOutlined, SyncOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import { PriorityTag, StatusTag } from "./TaskTags";

type DashboardSummary = {
  total_active: number;
  todo_count: number;
  in_progress_count: number;
  done_count: number;
  cancelled_count: number;
  overdue_count: number;
};

type Task = { id: string; title: string; status: string; priority: string; due_date?: string };

export default function TaskDashboard() {
  const { data: identity } = useGetIdentity<{ id: string }>();

  const { result: summaryResult, query: summaryQuery } = useCustom<DashboardSummary[]>({
    url: "task-dashboard-summary",
    method: "post",
    dataProviderName: "app",
    config: {},
    meta: { kind: "analytics" },
  });

  const summary: DashboardSummary = summaryResult?.data?.[0] ?? {
    total_active: 0,
    todo_count: 0,
    in_progress_count: 0,
    done_count: 0,
    cancelled_count: 0,
    overdue_count: 0,
  };

  const myTaskFilters = useMemo(() => {
    if (!identity?.id) return [];
    return [
      { field: "assigned_to_id", operator: "eq" as const, value: identity.id },
      { field: "status", operator: "nin" as const, value: "done,cancelled" },
    ];
  }, [identity?.id]);

  const { result: myTasksResult, query: myTasksQuery } = useList<Task>({
    resource: "tasks",
    filters: myTaskFilters,
    sorters: [{ field: "due_date", order: "asc" }],
    pagination: { pageSize: 5 },
    queryOptions: { enabled: !!identity?.id },
  });

  const myTasks = myTasksResult?.data ?? [];

  return (
    <div style={{ padding: "24px" }}>
      <Typography.Title level={3} style={{ marginBottom: 24 }}>Dashboard</Typography.Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={4}>
          <Card><Statistic title="Active Tasks" value={summary.total_active} loading={summaryQuery.isLoading} prefix={<UnorderedListOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card><Statistic title="To Do" value={summary.todo_count} loading={summaryQuery.isLoading} prefix={<ClockCircleOutlined style={{ color: "#8c8c8c" }} />} /></Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card><Statistic title="In Progress" value={summary.in_progress_count} loading={summaryQuery.isLoading} prefix={<SyncOutlined style={{ color: "#1677ff" }} />} /></Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card><Statistic title="Done" value={summary.done_count} loading={summaryQuery.isLoading} prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />} /></Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card><Statistic title="Overdue" value={summary.overdue_count} loading={summaryQuery.isLoading} valueStyle={{ color: summary.overdue_count > 0 ? "#ff4d4f" : undefined }} prefix={<ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />} /></Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card><Statistic title="Cancelled" value={summary.cancelled_count} loading={summaryQuery.isLoading} prefix={<FireOutlined style={{ color: "#fa8c16" }} />} /></Card>
        </Col>
      </Row>

      <Card title="My Upcoming Tasks" style={{ marginBottom: 24 }}>
        <Table<Task> rowKey="id" loading={myTasksQuery.isLoading} dataSource={myTasks} pagination={false} size="small">
          <Table.Column dataIndex="title" title="Title" />
          <Table.Column<Task> dataIndex="status" title="Status" width={140} render={(v) => <StatusTag value={v} />} />
          <Table.Column<Task> dataIndex="priority" title="Priority" width={120} render={(v) => <PriorityTag value={v} />} />
          <Table.Column
            dataIndex="due_date"
            title="Due Date"
            width={130}
            render={(v) => {
              if (!v) return "—";
              const isOverdue = new Date(v) < new Date();
              return <span style={{ color: isOverdue ? "#ff4d4f" : undefined }}>{v}</span>;
            }}
          />
        </Table>
      </Card>
    </div>
  );
}
