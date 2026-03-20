import Anthropic from '@anthropic-ai/sdk';
import { ILLMProvider, LLMMessage, LLMResponse } from '../../application/ports/ILLMProvider';

export class ClaudeProvider implements ILLMProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generateResponse(messages: LLMMessage[], systemPrompt: string): Promise<LLMResponse> {
    const response = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
    return { content, tokensUsed };
  }
}
