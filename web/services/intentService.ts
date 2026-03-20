import { api } from './api';

export type IntentType = 'schedule' | 'order' | 'info' | 'handoff';
export type FieldType = 'text' | 'date' | 'time' | 'phone' | 'number' | 'select';

export interface IntentField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

export interface AgentIntent {
  id: string;
  agentId: string;
  name: string;
  intentType: IntentType;
  triggerPhrases: string[];
  fields: IntentField[];
  confirmationMessage: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateIntentPayload {
  name: string;
  intent_type: IntentType;
  trigger_phrases: string[];
  fields: IntentField[];
  confirmation_message: string;
}

export const intentService = {
  list: () => api.get<AgentIntent[]>('/agent/intents').then((r) => r.data),
  create: (payload: CreateIntentPayload) =>
    api.post<AgentIntent>('/agent/intents', payload).then((r) => r.data),
  update: (id: string, payload: Partial<CreateIntentPayload>) =>
    api.patch<AgentIntent>(`/agent/intents/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/agent/intents/${id}`),
  toggle: (id: string) =>
    api.patch<{ isActive: boolean }>(`/agent/intents/${id}/toggle`).then((r) => r.data),
};
