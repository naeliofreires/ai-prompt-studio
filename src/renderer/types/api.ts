import { z } from "zod";

export const promtizerResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  requirements: z.array(z.string()),
  expectations: z.string(),
  goodToGo: z.boolean(),
}).strict();

export type PromtizerResponse = z.infer<typeof promtizerResponseSchema>;
