import type { FormInstance } from "antd";
import type { ZodError } from "zod";

export const applyZodErrorsToAntdForm = (
  form: FormInstance,
  error: ZodError,
) => {
  const grouped = new Map<string, { name: (string | number)[]; errors: string[] }>();

  for (const issue of error.issues) {
    const path = issue.path as (string | number)[];
    const name = path.length > 0 ? path : ["_form"];
    const key = name.join(".");
    const entry = grouped.get(key);

    if (entry) {
      entry.errors.push(issue.message);
    } else {
      grouped.set(key, { name, errors: [issue.message] });
    }
  }

  form.setFields(Array.from(grouped.values()));
};
