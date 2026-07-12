export interface GeneratePromptAttachment {
  name: string;
  mimeType: string;
  sizeBytes: number;
  content: string;
}

export interface GeneratePromptInput {
  personaContext: string;
  rawInput: string;
  providerId: string;
  model: string;
  attachments?: GeneratePromptAttachment[];
}

export interface GeneratePromptOutput {
  prompt: string;
  tokensUsed?: number;
}

export interface LlmAdapter {
  generatePrompt(input: GeneratePromptInput): Promise<GeneratePromptOutput>;
}
