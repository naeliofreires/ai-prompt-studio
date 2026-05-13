export interface GeneratePromptInput {
  personaContext: string;
  rawInput: string;
  providerId: string;
  model: string;
}

export interface GeneratePromptOutput {
  prompt: string;
  tokensUsed?: number;
}

export interface LlmAdapter {
  generatePrompt(input: GeneratePromptInput): Promise<GeneratePromptOutput>;
}
