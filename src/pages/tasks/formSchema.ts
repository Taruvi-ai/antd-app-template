import { z } from "zod";

export const TASK_STATUS_VALUES = ["todo", "in_progress", "done", "cancelled", "blocked"] as const;
export const TASK_PRIORITY_VALUES = ["low", "medium", "high", "urgent"] as const;

export const taskFormSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .min(1, { error: "Title is required" })
    .max(255, { error: "Title must be at most 255 characters" }),
  description: z
    .string()
    .trim()
    .max(2000, { error: "Description must be at most 2000 characters" })
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  status: z.enum(TASK_STATUS_VALUES, { error: "Status is required" }),
  priority: z.enum(TASK_PRIORITY_VALUES, { error: "Priority is required" }),
  due_date: z.string().optional().nullable(),
  assigned_to_id: z.string().uuid().optional().nullable(),
});

export type TaskFormInput = z.input<typeof taskFormSchema>;
export type TaskFormValues = z.output<typeof taskFormSchema>;
