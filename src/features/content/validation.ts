import { z } from "zod";

export const contentSourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["TEXT", "MARKDOWN"]),
  rawContent: z.string().min(1, "Content is required"),
});

export type ContentSourceInput = z.infer<typeof contentSourceSchema>;
