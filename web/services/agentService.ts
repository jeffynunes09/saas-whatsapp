import { api } from './api';
import { Agent } from '@/types';

export const agentService = {
  getAgent: () => api.get<Agent>('/agent').then((r) => r.data),

  configureAgent: (data: Partial<Agent>) => api.post<Agent>('/agent', data).then((r) => r.data),

  togglePause: () => api.patch<{ isPaused: boolean }>('/agent/pause').then((r) => r.data),

  uploadContextFile: (formData: FormData) =>
    api.post<{ url: string }>('/agent/context-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
};
