'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { conversationService } from '@/services/conversationService';
import { Conversation } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [conv, setConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);

  useEffect(() => {
    conversationService.getOne(id)
      .then((data) => {
        setConv(data);
        setRating(data.satisfactionRating);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRate = async (value: 'positive' | 'negative') => {
    await conversationService.rate(id, value);
    setRating(value);
  };

  if (loading) {
    return (
      <div className="p-4 flex flex-col gap-3">
        {[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse h-12 bg-gray-100" />)}
      </div>
    );
  }

  if (!conv) {
    return <div className="p-4 text-center text-gray-400">Conversa não encontrada</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button onClick={() => router.back()} className="text-primary font-medium text-sm">← Voltar</button>
        <div className="flex-1">
          <p className="font-bold text-gray-800">{conv.contactName ?? conv.contactPhone}</p>
        </div>
        <Badge
          label={conv.status}
          variant={conv.status === 'open' ? 'blue' : conv.status === 'resolved' ? 'green' : 'red'}
        />
      </div>

      <div className="px-4 flex flex-col gap-2 mb-4">
        {conv.messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
              msg.role === 'assistant'
                ? 'bg-primary-light text-gray-800 self-start rounded-tl-none'
                : 'bg-white border border-gray-200 text-gray-800 self-end rounded-tr-none ml-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <Card>
          <p className="text-sm font-medium text-gray-700 mb-3">Avaliação da conversa</p>
          <div className="flex gap-2">
            <Button
              variant={rating === 'positive' ? 'primary' : 'ghost'}
              onClick={() => handleRate('positive')}
              className="flex-1"
            >
              👍 Positiva
            </Button>
            <Button
              variant={rating === 'negative' ? 'danger' : 'ghost'}
              onClick={() => handleRate('negative')}
              className="flex-1"
            >
              👎 Negativa
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
