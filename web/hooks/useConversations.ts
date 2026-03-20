'use client';

import { useState, useEffect } from 'react';
import { conversationService } from '@/services/conversationService';
import { Conversation, Metrics } from '@/types';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      conversationService.list(),
      conversationService.getMetrics(),
    ]).then(([convs, met]) => {
      setConversations(convs);
      setMetrics(met);
    }).finally(() => setLoading(false));
  }, []);

  const rate = async (id: string, rating: 'positive' | 'negative') => {
    await conversationService.rate(id, rating);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, satisfactionRating: rating } : c)),
    );
  };

  return { conversations, metrics, loading, rate };
}
