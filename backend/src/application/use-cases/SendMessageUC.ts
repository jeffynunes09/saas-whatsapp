import { IAgentRepository } from '../ports/IAgentRepository';
import { IConversationRepository } from '../ports/IConversationRepository';
import { ILLMProvider } from '../ports/ILLMProvider';
import { IWhatsAppProvider } from '../ports/IWhatsAppProvider';
import { INotificationProvider } from '../ports/INotificationProvider';
import { IAgentIntentRepository } from '../ports/IAgentIntentRepository';
import { IntentDetectionService } from '../services/IntentDetectionService';
import { IntentFlowService } from '../services/IntentFlowService';
import { AgentIntentSupabaseRepository } from '../../infrastructure/database/supabase/AgentIntentSupabaseRepository';
import { AgentIntent } from '../../domain/entities/AgentIntent';
import { IntentExecution } from '../../domain/entities/IntentExecution';
import { Message } from '../../domain/entities/Conversation';
import { v4 as uuidv4 } from 'uuid';

interface IncomingMessage {
  instanceName: string;
  subscriberId: string;
  contactPhone: string;
  contactName?: string;
  text: string;
}

export class SendMessageUC {
  private intentRepo: IAgentIntentRepository;
  private intentDetectionService: IntentDetectionService;
  private intentFlowService: IntentFlowService;

  constructor(
    private agentRepo: IAgentRepository,
    private conversationRepo: IConversationRepository,
    private llmProvider: ILLMProvider,
    private whatsappProvider: IWhatsAppProvider,
    private notificationProvider: INotificationProvider,
    intentRepo?: IAgentIntentRepository,
  ) {
    this.intentRepo = intentRepo ?? new AgentIntentSupabaseRepository();
    this.intentDetectionService = new IntentDetectionService(llmProvider);
    this.intentFlowService = new IntentFlowService();
  }

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

    // --- Intent Flow ---
    const intents = await this.intentRepo.findByAgentId(agent.id);
    const activeIntents = intents.filter((i) => i.isActive);

    // Busca execução ativa nas mensagens de sistema
    const activeExecution = this.findActiveExecution(conversation.messages);

    // Detecta intenção apenas se não há execução ativa
    const detectedIntent = activeExecution
      ? null
      : await this.intentDetectionService.detect(input.text, activeIntents);

    const flowResult = this.intentFlowService.handleMessage({
      message: input.text,
      activeExecution,
      intents: activeIntents,
      detectedIntent,
    });

    if (flowResult.shouldSkipLLM) {
      await this.conversationRepo.addMessage(conversation.id, {
        id: uuidv4(),
        conversationId: conversation.id,
        role: 'user',
        content: input.text,
        timestamp: new Date(),
      });

      await this.conversationRepo.addMessage(conversation.id, {
        id: uuidv4(),
        conversationId: conversation.id,
        role: 'assistant',
        content: flowResult.response,
        timestamp: new Date(),
      });

      if (flowResult.execution !== null) {
        await this.conversationRepo.addMessage(conversation.id, {
          id: uuidv4(),
          conversationId: conversation.id,
          role: 'system',
          content: '[intent_state]',
          metadata: {
            type: 'intent_execution',
            ...flowResult.execution,
          } as Record<string, unknown>,
          timestamp: new Date(),
        });

        if (
          flowResult.execution.status === 'completed' &&
          flowResult.execution.intentType === 'handoff'
        ) {
          await this.conversationRepo.update(conversation.id, { status: 'escalated' });
          await this.notificationProvider.sendPush(input.subscriberId, 'bot_failed', {
            contactPhone: input.contactPhone,
            conversationId: conversation.id,
          });
        }
      }

      await this.whatsappProvider.sendMessage(input.instanceName, input.contactPhone, flowResult.response);
      return;
    }

    // --- Fluxo normal com LLM ---
    await this.conversationRepo.addMessage(conversation.id, {
      id: uuidv4(),
      conversationId: conversation.id,
      role: 'user',
      content: input.text,
      timestamp: new Date(),
    });

    const systemPrompt = this.buildSystemPrompt(agent, activeIntents);
    const history = conversation.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map((m) => ({
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

  private findActiveExecution(messages: Message[]): IntentExecution | null {
    const systemMessages = [...messages]
      .reverse()
      .filter((m) => m.role === 'system' && m.metadata?.['type'] === 'intent_execution');

    if (systemMessages.length === 0) return null;

    const latest = systemMessages[0];
    if (latest.metadata?.['status'] !== 'in_progress') return null;

    const meta = latest.metadata;
    return {
      intentId: meta['intentId'] as string,
      intentName: meta['intentName'] as string,
      intentType: meta['intentType'] as string,
      status: meta['status'] as IntentExecution['status'],
      currentFieldIndex: meta['currentFieldIndex'] as number,
      collectedData: meta['collectedData'] as Record<string, string>,
    };
  }

  private buildSystemPrompt(
    agent: {
      name: string;
      tone: string;
      businessInfo: { description: string; hours: string; location?: string; productsServices?: string };
      faq: { question: string; answer: string }[];
    },
    activeIntents: AgentIntent[] = [],
  ): string {
    const faqSection = agent.faq.map((f) => `P: ${f.question}\nR: ${f.answer}`).join('\n\n');
    let prompt = `Você é ${agent.name}, um assistente virtual de atendimento ao cliente.
Tom: ${agent.tone === 'formal' ? 'Formal e profissional' : 'Amigável e descontraído'}.
Informações do negócio:
- ${agent.businessInfo.description}
- Horário: ${agent.businessInfo.hours}
${agent.businessInfo.location ? `- Localização: ${agent.businessInfo.location}` : ''}
${agent.businessInfo.productsServices ? `- Produtos/Serviços: ${agent.businessInfo.productsServices}` : ''}

Perguntas frequentes:
${faqSection}

Responda de forma concisa e útil. Se não souber a resposta, seja honesto.`;

    if (activeIntents.length > 0) {
      prompt +=
        '\n\nAÇÕES DISPONÍVEIS NESTE ATENDIMENTO:\n' +
        activeIntents.map((i) => `- ${i.name}`).join('\n') +
        '\nQuando o cliente demonstrar interesse em uma dessas ações, confirme que pode ajudar. O sistema cuidará da coleta dos dados.';
    }

    return prompt;
  }
}
