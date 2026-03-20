export type AgentTone = 'formal' | 'informal';
export type SubscriptionStatus = 'active' | 'inactive' | 'blocked' | 'trial';
export type SubscriptionPlan = 'starter' | 'pro' | 'business';
export type ConversationStatus = 'open' | 'resolved' | 'escalated';
export type MessageRole = 'user' | 'assistant';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Agent {
  id: string;
  name: string;
  tone: AgentTone;
  businessInfo: {
    description: string;
    hours: string;
    location?: string;
    productsServices?: string;
  };
  faq: FaqItem[];
  contextFileUrl?: string;
  fallbackAfterAttempts: number;
  isPaused: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  contactPhone: string;
  contactName?: string;
  status: ConversationStatus;
  messages: Message[];
  satisfactionRating: 'positive' | 'negative' | null;
  createdAt: string;
  updatedAt: string;
}

export interface Metrics {
  totalMessages: number;
  avgResponseTimeMs: number;
  resolutionRate: number;
}

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  renewsAt?: string;
}
