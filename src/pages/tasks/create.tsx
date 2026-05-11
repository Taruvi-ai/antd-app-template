import { useCustomMutation, useList, useNotification } from "@refinedev/core";
import { Create } from "@refinedev/antd";
import { Button, DatePicker, Form, Input, Select } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { TASK_PRIORITY_VALUES, TASK_STATUS_VALUES, taskFormSchema } from "./formSchema";
import { applyZodErrorsToAntdForm } from "./zodFormErrors";

type UserOption = { id: string; username: string; first_name?: string; last_name?: string };

export default function TaskCreate() {
  const navigate = useNavigate();
  const { open } = useNotification();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const { mutateAsync: createTask } = useCustomMutation();

  // User autocomplete
  const [userSearch, setUserSearch] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setUserSearchTerm(userSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [userSearch]);
  const userFilters = useMemo(
    () => userSearchTerm ? [{ field: "username", operator: "containss" as const, value: userSearchTerm }] : [],
    [userSearchTerm],
  );
  const { result: usersResult } = useList<UserOption>({
    resource: "users",
    dataProviderName: "user",
    filters: userFilters,
    pagination: { pageSize: 10 },
  });
  const userOptions = (usersResult?.data ?? []).map((u) => ({
    label: u.first_name ? `${u.first_name} ${u.last_name} (${u.username})` : u.username,
    value: u.id,
  }));

  // Parent task autocomplete
  const [parentSearch, setParentSearch] = useState("");
  const [parentSearchTerm, setParentSearchTerm] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setParentSearchTerm(parentSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [parentSearch]);
  const parentFilters = useMemo(
    () => parentSearchTerm ? [{ field: "title", operator: "containss" as const, value: parentSearchTerm }] : [],
    [parentSearchTerm],
  );
  const { result: parentTasksResult } = useList<{ id: string; title: string }>({
    resource: "tasks",
    filters: parentFilters,
    pagination: { pageSize: 10 },
    sorters: [{ field: "title", order: "asc" }],
  });
  const parentOptions = (parentTasksResult?.data ?? []).map((t) => ({
    label: t.title,
    value: t.id,
  }));

  const handleFinish = async (values: Record<string, unknown>) => {
    const { parent_task_id, due_date, ...rest } = values as any;
    const parsed = taskFormSchema.safeParse(rest);
    if (!parsed.success) {
      applyZodErrorsToAntdForm(form, parsed.error);
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        ...parsed.data,
        due_date: due_date ? dayjs(due_date).format("YYYY-MM-DD") : undefined,
      };
      if (parent_task_id) payload.parent_task_id = parent_task_id;

      const res = await createTask({
        url: "create-task",
        method: "post",
        values: payload,
        dataProviderName: "app",
        meta: { kind: "function" },
      });

      const data = (res as any)?.data;
      if (data?.success) {
        open?.({ type: "success", message: "Task created" });
        navigate("/tasks");
      } else {
        open?.({ type: "error", message: data?.error ?? "Failed to create task" });
      }
    } catch {
      open?.({ type: "error", message: "Failed to create task" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Create
      title="Create Task"
      footerButtons={
        <Button type="primary" loading={submitting} onClick={() => form.submit()}>
          Save
        </Button>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="Title" name="title" rules={[{ required: true, message: "Title is required" }]}>
          <Input placeholder="Task title" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Optional description" />
        </Form.Item>
        <Form.Item label="Status" name="status" initialValue="todo">
          <Select options={TASK_STATUS_VALUES.map((v) => ({ label: v.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()), value: v }))} />
        </Form.Item>
        <Form.Item label="Priority" name="priority" initialValue="medium">
          <Select options={TASK_PRIORITY_VALUES.map((v) => ({ label: v[0].toUpperCase() + v.slice(1), value: v }))} />
        </Form.Item>
        <Form.Item label="Due Date" name="due_date">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Assign To" name="assigned_to_id">
          <Select showSearch filterOption={false} onSearch={setUserSearch} placeholder="Search user..." allowClear options={userOptions} />
        </Form.Item>
        <Form.Item label="Parent Task" name="parent_task_id">
          <Select showSearch filterOption={false} onSearch={setParentSearch} placeholder="Search parent task..." allowClear options={parentOptions} />
        </Form.Item>
      </Form>
    </Create>
  );
}
