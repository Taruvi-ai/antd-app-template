import { useShow } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { TASK_PRIORITY_VALUES, TASK_STATUS_VALUES, taskFormSchema, type TaskFormInput, type TaskFormValues } from "./formSchema";
import { applyZodErrorsToAntdForm } from "./zodFormErrors";

export default function TaskEdit() {
  const { formProps, saveButtonProps, query } = useForm<TaskFormValues>({
    resource: "tasks",
    action: "edit",
    redirect: "list",
  });
  const [form] = Form.useForm<TaskFormInput>();

  const handleFinish = async (values: TaskFormInput & { due_date?: any }) => {
    const { due_date, ...rest } = values as any;
    const parsed = taskFormSchema.safeParse(rest);
    if (!parsed.success) {
      applyZodErrorsToAntdForm(form, parsed.error);
      return;
    }
    await formProps.onFinish?.({
      ...parsed.data,
      due_date: due_date ? dayjs(due_date).format("YYYY-MM-DD") : null,
    });
  };

  const record = query?.data?.data as any;

  return (
    <Edit title="Edit Task" saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          ...record,
          due_date: record?.due_date ? dayjs(record.due_date) : undefined,
        }}
      >
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input placeholder="Task title" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Status" name="status">
          <Select
            options={TASK_STATUS_VALUES.map((v) => ({
              label: v.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              value: v,
            }))}
          />
        </Form.Item>
        <Form.Item label="Priority" name="priority">
          <Select
            options={TASK_PRIORITY_VALUES.map((v) => ({
              label: v[0].toUpperCase() + v.slice(1),
              value: v,
            }))}
          />
        </Form.Item>
        <Form.Item label="Due Date" name="due_date">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Edit>
  );
}
