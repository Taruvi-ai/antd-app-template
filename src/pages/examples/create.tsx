import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import {
  EXAMPLE_STATUS_VALUES,
  exampleItemFormSchema,
  type ExampleItemFormInput,
  type ExampleItemFormValues,
} from "./formSchema";
import { applyZodErrorsToAntdForm } from "./zodFormErrors";

export default function ExampleCreate() {
  const { formProps, saveButtonProps } = useForm<ExampleItemFormValues>({
    resource: "example_items",
    action: "create",
    redirect: "list",
  });
  const [form] = Form.useForm<ExampleItemFormInput>();

  const handleFinish = async (values: ExampleItemFormInput) => {
    const parsed = exampleItemFormSchema.safeParse(values);

    if (!parsed.success) {
      applyZodErrorsToAntdForm(form, parsed.error);
      return;
    }

    await formProps.onFinish?.(parsed.data);
  };

  return (
    <Create title="Create Example Item" saveButtonProps={saveButtonProps}>
      <Form {...formProps} form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="Name" name="name">
          <Input placeholder="Enter name" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} placeholder="Optional details" />
        </Form.Item>

        <Form.Item label="Status" name="status" initialValue="draft">
          <Select
            options={EXAMPLE_STATUS_VALUES.map((value) => ({
              label: value[0].toUpperCase() + value.slice(1),
              value,
            }))}
          />
        </Form.Item>
      </Form>
    </Create>
  );
}
