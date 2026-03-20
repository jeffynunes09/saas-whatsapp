'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAgent } from '@/hooks/useAgent';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type FormData = {
  name: string;
  tone: 'formal' | 'informal';
  description: string;
  hours: string;
  location: string;
  productsServices: string;
  fallbackAfterAttempts: string;
  isPaused: boolean;
};

export default function AgentPage() {
  const { agent, loading, save, togglePause } = useAgent();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { control, register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    if (agent) {
      reset({
        name: agent.name,
        tone: agent.tone,
        description: agent.businessInfo?.description,
        hours: agent.businessInfo?.hours,
        location: agent.businessInfo?.location ?? '',
        productsServices: agent.businessInfo?.productsServices ?? '',
        fallbackAfterAttempts: String(agent.fallbackAfterAttempts),
        isPaused: agent.isPaused,
      });
    }
  }, [agent, reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await save({
        name: data.name,
        tone: data.tone,
        businessInfo: {
          description: data.description,
          hours: data.hours,
          location: data.location,
          productsServices: data.productsServices,
        },
        fallbackAfterAttempts: parseInt(data.fallbackAfterAttempts) || 5,
        faq: agent?.faq ?? [],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex flex-col gap-3">
        {[...Array(5)].map((_, i) => <Card key={i} className="animate-pulse h-12 bg-gray-100" />)}
      </div>
    );
  }

  return (
    <div>
      <Header title="Agente IA" subtitle="Configure o comportamento do bot" />
      <form onSubmit={handleSubmit(onSubmit)} className="px-4 flex flex-col gap-4 pb-6">

        <Card className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500">Identidade</h2>
          <Input label="Nome do agente" placeholder="Ex: Atendente Virtual" {...register('name')} />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Tom de comunicação</label>
            <Controller
              control={control}
              name="tone"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {(['formal', 'informal'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => field.onChange(t)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-colors capitalize ${
                        field.value === t
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500">Informações do negócio</h2>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Descrição</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary text-sm outline-none resize-none"
              rows={3}
              placeholder="Descreva seu negócio..."
              {...register('description')}
            />
          </div>
          <Input label="Horário de atendimento" placeholder="Ex: Seg-Sex 9h-18h" {...register('hours')} />
          <Input label="Localização (opcional)" placeholder="Ex: Rua das Flores, 123" {...register('location')} />
          <Input label="Produtos/Serviços (opcional)" placeholder="Ex: Consultoria, Suporte..." {...register('productsServices')} />
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500">Comportamento</h2>
          <Input
            label="Tentativas antes de escalar"
            type="number"
            placeholder="5"
            {...register('fallbackAfterAttempts')}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Pausar bot</p>
              <p className="text-xs text-gray-400">O bot não responderá enquanto pausado</p>
            </div>
            <Controller
              control={control}
              name="isPaused"
              render={({ field }) => (
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => { field.onChange(!field.value); togglePause(); }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    field.value ? 'bg-yellow-400' : 'bg-primary'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      field.value ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}
            />
          </div>
        </Card>

        <Button type="submit" loading={saving}>
          {saved ? '✓ Salvo!' : 'Salvar configurações'}
        </Button>
      </form>
    </div>
  );
}
