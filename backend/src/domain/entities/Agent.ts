export type AgentTone = 'formal' | 'informal';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Agent {
  id: string;
  subscriberId: string;
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
  systemPrompt?: string;
  createdAt: Date;
  updatedAt: Date;
}
