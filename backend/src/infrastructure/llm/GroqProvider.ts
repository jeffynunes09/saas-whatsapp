import OpenAI from 'openai';
import { ILLMProvider, LLMMessage, LLMResponse } from '../../application/ports/ILLMProvider';

export class GroqProvider implements ILLMProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async generateResponse(messages: LLMMessage[], systemPrompt: string): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
    });

    const content = response.choices[0]?.message?.content ?? '';
    const tokensUsed = (response.usage?.prompt_tokens ?? 0) + (response.usage?.completion_tokens ?? 0);
    return { content, tokensUsed };
  }
}
