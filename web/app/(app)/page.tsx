'use client';

import { useConversations } from '@/hooks/useConversations';
import { useAgent } from '@/hooks/useAgent';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  const { metrics, conversations, loading: loadingConvs } = useConversations();
  const { agent, loading: loadingAgent } = useAgent();

  return (
    <div>
      <Header title="Dashboard" subtitle="Visão geral do seu agente" />
      <div className="px-4 flex flex-col gap-4 pb-4">

        {/* Status do agente */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Agente</p>
            <p className="font-semibold text-gray-800">{loadingAgent ? '...' : (agent?.name ?? 'Não configurado')}</p>
          </div>
          {!loadingAgent && agent && (
            <Badge
              label={agent.isPaused ? 'Pausado' : 'Ativo'}
              variant={agent.isPaused ? 'yellow' : 'green'}
            />
          )}
        </Card>

        {/* Métricas */}
        {loadingConvs ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse h-20 bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <p className="text-2xl font-bold text-primary">{metrics?.totalMessages ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">Mensagens</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-primary">
                {metrics ? `${Math.round(metrics.avgResponseTimeMs / 1000)}s` : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Resp. média</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-primary">
                {metrics ? `${Math.round(metrics.resolutionRate * 100)}%` : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Resolvidas</p>
            </Card>
          </div>
        )}

        {/* Últimas conversas */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2 px-1">Conversas recentes</h2>
          {loadingConvs ? (
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse h-14 bg-gray-100" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <Card className="text-center py-8 text-gray-400 text-sm">Nenhuma conversa ainda</Card>
          ) : (
            <div className="flex flex-col gap-2">
              {conversations.slice(0, 5).map((conv) => (
                <Card key={conv.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {conv.contactName ?? conv.contactPhone}
                    </p>
                    <p className="text-xs text-gray-400">
                      {conv.messages[conv.messages.length - 1]?.content.slice(0, 50)}...
                    </p>
                  </div>
                  <Badge
                    label={conv.status}
                    variant={conv.status === 'open' ? 'blue' : conv.status === 'resolved' ? 'green' : 'red'}
                  />
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
