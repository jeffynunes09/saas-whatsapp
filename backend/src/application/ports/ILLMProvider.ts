export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  tokensUsed: number;
}

export interface ILLMProvider {
  generateResponse(messages: LLMMessage[], systemPrompt: string): Promise<LLMResponse>;
}
