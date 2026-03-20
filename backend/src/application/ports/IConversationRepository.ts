import { Conversation, Message } from '../../domain/entities/Conversation';

export interface ConversationFilters {
  contactPhone?: string;
  keyword?: string;
  status?: string;
}

export interface IConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  findBySubscriberId(subscriberId: string, filters?: ConversationFilters): Promise<Conversation[]>;
  findByContactPhone(subscriberId: string, phone: string): Promise<Conversation | null>;
  save(conversation: Conversation): Promise<Conversation>;
  update(id: string, data: Partial<Conversation>): Promise<Conversation>;
  addMessage(conversationId: string, message: Message): Promise<void>;
  getMetrics(subscriberId: string): Promise<{
    totalMessages: number;
    avgResponseTimeMs: number;
    resolutionRate: number;
  }>;
}
