'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useIntents } from '@/hooks/useIntents';
import { IntentType } from '@/services/intentService';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const typeLabel: Record<IntentType, string> = {
  schedule: 'Agendamento',
  order: 'Pedido',
  info: 'Informação',
  handoff: 'Escalada humana',
};

const typeVariant: Record<IntentType, 'blue' | 'green' | 'gray' | 'yellow'> = {
  schedule: 'blue',
  order: 'green',
  info: 'gray',
  handoff: 'yellow',
};

export default function IntentsPage() {
  const { intents, loading, toggle, remove } = useIntents();
  const [removing, setRemoving] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    setToggling(id);
    try { await toggle(id); } finally { setToggling(null); }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remover este comportamento?')) return;
    setRemoving(id);
    try { await remove(id); } finally { setRemoving(null); }
  };

  return (
    <div>
      <Header
        title="Comportamentos do Bot"
        subtitle="O que seu bot sabe fazer além de responder perguntas"
        action={
          <Link href="/intents/new">
            <Button className="w-auto px-4 py-2 text-sm">+ Adicionar</Button>
          </Link>
        }
      />
      <div className="px-4 flex flex-col gap-3 pb-6">
        {loading ? (
          [...Array(3)].map((_, i) => <Card key={i} className="animate-pulse h-20 bg-gray-100" />)
        ) : intents.length === 0 ? (
          <Card className="text-center py-12 flex flex-col items-center gap-3">
            <p className="text-gray-400 text-sm">Nenhum comportamento configurado.</p>
            <p className="text-xs text-gray-300 max-w-xs">
              Adicione ações como "Agendar consulta" ou "Fazer pedido" e o bot coletará os dados automaticamente.
            </p>
            <Link href="/intents/new">
              <Button className="w-auto px-6 mt-1">Adicionar comportamento</Button>
            </Link>
          </Card>
        ) : (
          intents.map((intent) => (
            <Card key={intent.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-800">{intent.name}</p>
                    <Badge label={typeLabel[intent.intentType]} variant={typeVariant[intent.intentType]} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Ativado por: {intent.triggerPhrases.slice(0, 3).join(', ')}
                    {intent.triggerPhrases.length > 3 ? ` +${intent.triggerPhrases.length - 3}` : ''}
                  </p>
                  {intent.fields.length > 0 && (
                    <p className="text-xs text-gray-300 mt-0.5">
                      Coleta: {intent.fields.map((f) => f.label).join(', ')}
                    </p>
                  )}
                </div>

                {/* Toggle ativo */}
                <button
                  onClick={() => handleToggle(intent.id)}
                  disabled={toggling === intent.id}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${
                    intent.isActive ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      intent.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-2 pt-1 border-t border-gray-100">
                <Link href={`/intents/${intent.id}`} className="flex-1">
                  <button className="w-full py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-xl">
                    Editar
                  </button>
                </Link>
                <button
                  onClick={() => handleRemove(intent.id)}
                  disabled={removing === intent.id}
                  className="flex-1 py-1.5 text-xs font-medium text-red-400 bg-red-50 rounded-xl disabled:opacity-50"
                >
                  {removing === intent.id ? '...' : 'Remover'}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
