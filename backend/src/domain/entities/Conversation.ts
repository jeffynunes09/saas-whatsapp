export type ConversationStatus = 'open' | 'resolved' | 'escalated';
export type MessageRole = 'user' | 'assistant';
export type SatisfactionRating = 'positive' | 'negative' | null;

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  subscriberId: string;
  whatsappInstanceId: string;
  contactPhone: string;
  contactName?: string;
  status: ConversationStatus;
  messages: Message[];
  satisfactionRating: SatisfactionRating;
  attemptCount: number;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
