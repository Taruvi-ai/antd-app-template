import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import {
  EXAMPLE_STATUS_VALUES,
  exampleItemFormSchema,
  type ExampleItemFormValues,
} from "./formSchema";
import { applyZodErrorsToAntdForm } from "./zodFormErrors";

// NOTE: use the form instance Refine creates (`formProps.form`). Do NOT call
// `Form.useForm()` yourself and pass `form={form}` after spreading `formProps` —
// that replaces Refine's instance and triggers "useForm is not connected to any
// Form element".
export default function ExampleEdit() {
  const { formProps, saveButtonProps } = useForm<ExampleItemFormValues>({
    resource: "example_items",
    action: "edit",
    redirect: "list",
  });

  const handleFinish = async (values: unknown) => {
    const parsed = exampleItemFormSchema.safeParse(values);

    if (!parsed.success) {
      if (formProps.form) applyZodErrorsToAntdForm(formProps.form, parsed.error);
      return;
    }

    await formProps.onFinish?.(parsed.data);
  };

  return (
    <Edit title="Edit Example Item" saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="Name" name="name">
          <Input placeholder="Enter name" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} placeholder="Optional details" />
        </Form.Item>

        <Form.Item label="Status" name="status">
          <Select
            options={EXAMPLE_STATUS_VALUES.map((value) => ({
              label: value[0].toUpperCase() + value.slice(1),
              value,
            }))}
          />
        </Form.Item>
      </Form>
    </Edit>
  );
}
