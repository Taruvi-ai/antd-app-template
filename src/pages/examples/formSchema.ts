import { z } from "zod";

export const EXAMPLE_STATUS_VALUES = ["draft", "active", "archived"] as const;

export const exampleItemFormSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, { error: "Name is required" })
    .max(120, { error: "Name must be at most 120 characters" }),
  description: z
    .string()
    .trim()
    .max(1000, { error: "Description must be at most 1000 characters" })
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  status: z.enum(EXAMPLE_STATUS_VALUES, { error: "Status is required" }),
});

export type ExampleItemFormInput = z.input<typeof exampleItemFormSchema>;
export type ExampleItemFormValues = z.output<typeof exampleItemFormSchema>;
