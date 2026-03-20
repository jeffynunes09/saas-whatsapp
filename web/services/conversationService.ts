import { api } from './api';
import { Conversation, Metrics } from '@/types';

export const conversationService = {
  list: (params?: { contactPhone?: string; status?: string }) =>
    api.get<Conversation[]>('/conversations', { params }).then((r) => r.data),

  getOne: (id: string) => api.get<Conversation>(`/conversations/${id}`).then((r) => r.data),

  rate: (id: string, rating: 'positive' | 'negative') =>
    api.patch(`/conversations/${id}/rate`, { rating }).then((r) => r.data),

  getMetrics: () => api.get<Metrics>('/conversations/metrics').then((r) => r.data),
};
