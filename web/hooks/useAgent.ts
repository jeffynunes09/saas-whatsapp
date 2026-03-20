'use client';

import { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { Agent } from '@/types';

export function useAgent() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    agentService.getAgent()
      .then((data) => setAgent(data && Object.keys(data).length > 0 ? data : null))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro'))
      .finally(() => setLoading(false));
  }, []);

  const save = async (data: Partial<Agent>) => {
    const updated = await agentService.configureAgent(data);
    setAgent(updated);
    return updated;
  };

  const togglePause = async () => {
    const result = await agentService.togglePause();
    setAgent((prev) => prev ? { ...prev, isPaused: result.isPaused } : prev);
  };

  return { agent, loading, error, save, togglePause };
}
