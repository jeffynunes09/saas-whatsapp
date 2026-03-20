'use client';

import Link from 'next/link';
import { useConversations } from '@/hooks/useConversations';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const statusLabel: Record<string, string> = {
  open: 'Aberta',
  resolved: 'Resolvida',
  escalated: 'Escalada',
};

const statusVariant: Record<string, 'blue' | 'green' | 'red'> = {
  open: 'blue',
  resolved: 'green',
  escalated: 'red',
};

export default function ConversationsPage() {
  const { conversations, loading } = useConversations();

  return (
    <div>
      <Header title="Conversas" subtitle={`${conversations.length} no total`} />
      <div className="px-4 flex flex-col gap-2 pb-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse h-16 bg-gray-100" />
          ))
        ) : conversations.length === 0 ? (
          <Card className="text-center py-12 text-gray-400 text-sm">Nenhuma conversa ainda</Card>
        ) : (
          conversations.map((conv) => (
            <Link key={conv.id} href={`/conversations/${conv.id}`}>
              <Card className="flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {conv.contactName ?? conv.contactPhone}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {conv.messages[conv.messages.length - 1]?.content ?? 'Sem mensagens'}
                  </p>
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    {new Date(conv.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge label={statusLabel[conv.status]} variant={statusVariant[conv.status]} />
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
