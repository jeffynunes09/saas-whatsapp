import { IAgentRepository } from '../ports/IAgentRepository';
import { IConversationRepository } from '../ports/IConversationRepository';
import { ILLMProvider } from '../ports/ILLMProvider';
import { IWhatsAppProvider } from '../ports/IWhatsAppProvider';
import { INotificationProvider } from '../ports/INotificationProvider';
import { v4 as uuidv4 } from 'uuid';

interface IncomingMessage {
  instanceName: string;
  subscriberId: string;
  contactPhone: string;
  contactName?: string;
  text: string;
}

export class SendMessageUC {
  constructor(
    private agentRepo: IAgentRepository,
    private conversationRepo: IConversationRepository,
    private llmProvider: ILLMProvider,
    private whatsappProvider: IWhatsAppProvider,
    private notificationProvider: INotificationProvider,
  ) {}

  async execute(input: IncomingMessage): Promise<void> {
    const agent = await this.agentRepo.findBySubscriberId(input.subscriberId);
    if (!agent || agent.isPaused) return;

    let conversation = await this.conversationRepo.findByContactPhone(
      input.subscriberId,
      input.contactPhone,
    );

    if (!conversation) {
      conversation = await this.conversationRepo.save({
        id: uuidv4(),
        subscriberId: input.subscriberId,
        whatsappInstanceId: input.instanceName,
        contactPhone: input.contactPhone,
        contactName: input.contactName,
        status: 'open',
        messages: [],
        satisfactionRating: null,
        attemptCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.notificationProvider.sendPush(input.subscriberId, 'new_conversation', {
        contactPhone: input.contactPhone,
      });
    }

    await this.conversationRepo.addMessage(conversation.id, {
      id: uuidv4(),
      conversationId: conversation.id,
      role: 'user',
      content: input.text,
      timestamp: new Date(),
    });

    const systemPrompt = this.buildSystemPrompt(agent);
    const history = conversation.messages.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const { content: responseText } = await this.llmProvider.generateResponse(
      [...history, { role: 'user', content: input.text }],
      systemPrompt,
    );

    await this.conversationRepo.addMessage(conversation.id, {
      id: uuidv4(),
      conversationId: conversation.id,
      role: 'assistant',
      content: responseText,
      timestamp: new Date(),
    });

    await this.whatsappProvider.sendMessage(input.instanceName, input.contactPhone, responseText);

    const newAttempts = conversation.attemptCount + 1;
    if (newAttempts >= agent.fallbackAfterAttempts) {
      await this.conversationRepo.update(conversation.id, { status: 'escalated', attemptCount: newAttempts });
      await this.notificationProvider.sendPush(input.subscriberId, 'bot_failed', {
        contactPhone: input.contactPhone,
        conversationId: conversation.id,
      });
    } else {
      await this.conversationRepo.update(conversation.id, { attemptCount: newAttempts });
    }
  }

  private buildSystemPrompt(agent: { name: string; tone: string; businessInfo: { description: string; hours: string; location?: string; productsServices?: string }; faq: { question: string; answer: string }[] }): string {
    const faqSection = agent.faq.map((f) => `P: ${f.question}\nR: ${f.answer}`).join('\n\n');
    return `Você é ${agent.name}, um assistente virtual de atendimento ao cliente.
Tom: ${agent.tone === 'formal' ? 'Formal e profissional' : 'Amigável e descontraído'}.
Informações do negócio:
- ${agent.businessInfo.description}
- Horário: ${agent.businessInfo.hours}
${agent.businessInfo.location ? `- Localização: ${agent.businessInfo.location}` : ''}
${agent.businessInfo.productsServices ? `- Produtos/Serviços: ${agent.businessInfo.productsServices}` : ''}

Perguntas frequentes:
${faqSection}

Responda de forma concisa e útil. Se não souber a resposta, seja honesto.`;
  }
}
