import OpenAI from 'openai';
import { ILLMProvider, LLMMessage, LLMResponse } from '../../application/ports/ILLMProvider';

export class OpenAIProvider implements ILLMProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateResponse(messages: LLMMessage[], systemPrompt: string): Promise<LLMResponse> {
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content ?? '';
    const tokensUsed = completion.usage?.total_tokens ?? 0;
    return { content, tokensUsed };
  }
}
