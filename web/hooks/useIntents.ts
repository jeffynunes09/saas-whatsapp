'use client';

import { useState, useEffect, useCallback } from 'react';
import { intentService, AgentIntent, CreateIntentPayload } from '@/services/intentService';

export function useIntents() {
  const [intents, setIntents] = useState<AgentIntent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await intentService.list();
      setIntents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (payload: CreateIntentPayload) => {
    const created = await intentService.create(payload);
    setIntents((prev) => [created, ...prev]);
    return created;
  };

  const toggle = async (id: string) => {
    const { isActive } = await intentService.toggle(id);
    setIntents((prev) => prev.map((i) => (i.id === id ? { ...i, isActive } : i)));
  };

  const remove = async (id: string) => {
    await intentService.remove(id);
    setIntents((prev) => prev.filter((i) => i.id !== id));
  };

  return { intents, loading, create, toggle, remove, reload: load };
}
