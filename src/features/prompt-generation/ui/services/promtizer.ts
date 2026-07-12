import { promtizerResponseSchema, type PromtizerResponse } from "../types/api";

export class PromtizerResponseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromtizerResponseValidationError";
  }
}

function parseJsonResponse(rawResponse: string): unknown {
  try {
    return JSON.parse(rawResponse) as unknown;
  } catch (err) {
    throw new PromtizerResponseValidationError(
      err instanceof Error
        ? `Promtizer API response is not valid JSON: ${err.message}`
        : "Promtizer API response is not valid JSON.",
    );
  }
}

export function validatePromtizerResponse(rawResponse: string): PromtizerResponse {
  const parsedResponse = promtizerResponseSchema.safeParse(parseJsonResponse(rawResponse));

  if (!parsedResponse.success) {
    throw new PromtizerResponseValidationError(
      `Promtizer API response does not match the expected schema: ${parsedResponse.error.message}`,
    );
  }

  return parsedResponse.data;
}
