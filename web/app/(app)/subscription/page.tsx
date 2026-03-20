'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { authService } from '@/services/authService';
import { Subscription } from '@/types';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const planLabels: Record<string, string> = {
  starter: 'Starter — R$ 97/mês',
  pro: 'Pro — R$ 197/mês',
  business: 'Business — R$ 397/mês',
};

const statusVariant: Record<string, 'green' | 'gray' | 'red' | 'yellow'> = {
  active: 'green',
  inactive: 'gray',
  blocked: 'red',
  trial: 'yellow',
};

const statusLabel: Record<string, string> = {
  active: 'Ativa',
  inactive: 'Inativa',
  blocked: 'Bloqueada',
  trial: 'Trial',
};

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Subscription>('/subscription/status')
      .then((r) => setSubscription(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Header title="Meu Plano" subtitle="Gerencie sua assinatura" />
      <div className="px-4 flex flex-col gap-4 pb-6">

        {loading ? (
          <Card className="animate-pulse h-32 bg-gray-100" />
        ) : subscription ? (
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800">{planLabels[subscription.plan]}</p>
              <Badge
                label={statusLabel[subscription.status]}
                variant={statusVariant[subscription.status]}
              />
            </div>
            {subscription.renewsAt && (
              <p className="text-sm text-gray-500">
                Renova em:{' '}
                <span className="font-medium">
                  {new Date(subscription.renewsAt).toLocaleDateString('pt-BR')}
                </span>
              </p>
            )}
          </Card>
        ) : (
          <Card className="text-center py-8 text-gray-400 text-sm">Assinatura não encontrada</Card>
        )}

        <Card className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-500">Planos disponíveis</p>
          {[
            { plan: 'starter', price: 'R$ 97/mês', features: ['1 número WhatsApp', 'Agente IA', 'Histórico 30 dias'] },
            { plan: 'pro', price: 'R$ 197/mês', features: ['3 números WhatsApp', 'Agente IA avançado', 'Histórico ilimitado'] },
            { plan: 'business', price: 'R$ 397/mês', features: ['Ilimitado', 'IA customizada', 'Suporte prioritário'] },
          ].map(({ plan, price, features }) => (
            <div
              key={plan}
              className={`p-3 rounded-xl border ${
                subscription?.plan === plan ? 'border-primary bg-primary/5' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm capitalize">{plan}</span>
                <span className="text-sm text-gray-600">{price}</span>
              </div>
              <ul className="mt-1 space-y-0.5">
                {features.map((f) => (
                  <li key={f} className="text-xs text-gray-500">• {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </Card>

        <Button variant="danger" onClick={() => authService.logout()}>
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
