import {
  promptStudioSessionSchema,
  promptStudioSessionShapeSchema,
  type PromptStudioSession,
} from "./session.js";

export const promptStudioIpcChannels = {
  getSession: "promptStudio:getSession",
  saveSession: "promptStudio:saveSession",
  recoverSession: "promptStudio:recoverSession",
} as const;

export const getPromptStudioSessionResultSchema = promptStudioSessionShapeSchema;
export const savePromptStudioSessionPayloadSchema = promptStudioSessionSchema;

export type GetPromptStudioSessionResult = PromptStudioSession;
export type SavePromptStudioSessionPayload = PromptStudioSession;
