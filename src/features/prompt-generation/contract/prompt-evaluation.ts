import { z } from "zod";

export const promptEvaluationSchema = z.object({
  score: z.number().min(0).max(5),
  summary: z.string().trim().min(1),
  suggestions: z.array(z.string().trim().min(1)),
});

export type PromptEvaluation = z.infer<typeof promptEvaluationSchema>;
