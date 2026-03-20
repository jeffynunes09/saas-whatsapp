import { ILLMProvider } from '../ports/ILLMProvider';
import { AgentIntent } from '../../domain/entities/AgentIntent';

export class IntentDetectionService {
  constructor(private llmProvider: ILLMProvider) {}

  async detect(message: string, intents: AgentIntent[]): Promise<AgentIntent | null> {
    if (intents.length === 0) return null;

    // Camada 1 — léxica (sem LLM)
    const lower = message.toLowerCase();
    for (const intent of intents) {
      if (intent.triggerPhrases.some((phrase) => lower.includes(phrase.toLowerCase()))) {
        return intent;
      }
    }

    // Camada 2 — LLM fallback
    const intentList = intents
      .map((i) => `${i.id}: ${i.name} (ex: ${i.triggerPhrases.slice(0, 2).join(', ')})`)
      .join('\n');

    const systemPrompt =
      'Você é um classificador de intenções. Responda APENAS com o id da intenção ou a palavra null. Sem pontuação, sem explicação.';

    const userMessage = `Mensagem: '${message}'\n\nIntenções:\n${intentList}`;

    try {
      const { content } = await this.llmProvider.generateResponse(
        [{ role: 'user', content: userMessage }],
        systemPrompt,
      );

      const matched = intents.find((i) => i.id === content.trim());
      return matched ?? null;
    } catch (err) {
      console.error('[IntentDetectionService]', err);
      return null;
    }
  }
}
