'use client';

import { useState } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentStatus } from '@/services/appointmentService';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const statusLabel: Record<AppointmentStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
};

const statusVariant: Record<AppointmentStatus, 'yellow' | 'green' | 'red' | 'blue'> = {
  pending: 'yellow',
  confirmed: 'green',
  cancelled: 'red',
  completed: 'blue',
};

const nextStatus: Record<AppointmentStatus, AppointmentStatus | null> = {
  pending: 'confirmed',
  confirmed: 'completed',
  completed: null,
  cancelled: null,
};

const nextLabel: Record<AppointmentStatus, string | null> = {
  pending: 'Confirmar',
  confirmed: 'Concluir',
  completed: null,
  cancelled: null,
};

export default function AppointmentsPage() {
  const { appointments, loading, updateStatus } = useAppointments();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleAdvance = async (id: string, current: AppointmentStatus) => {
    const next = nextStatus[current];
    if (!next) return;
    setUpdating(id);
    try {
      await updateStatus(id, next);
    } finally {
      setUpdating(null);
    }
  };

  const handleCancel = async (id: string) => {
    setUpdating(id + '-cancel');
    try {
      await updateStatus(id, 'cancelled');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <Header title="Agendamentos" subtitle={`${appointments.length} no total`} />
      <div className="px-4 flex flex-col gap-3 pb-6">
        {loading ? (
          [...Array(3)].map((_, i) => <Card key={i} className="animate-pulse h-24 bg-gray-100" />)
        ) : appointments.length === 0 ? (
          <Card className="text-center py-12 text-gray-400 text-sm">
            Nenhum agendamento ainda.<br />
            Configure um intent do tipo "schedule" no agente.
          </Card>
        ) : (
          appointments.map((appt) => (
            <Card key={appt.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {appt.contactName ?? appt.contactPhone}
                  </p>
                  <p className="text-xs text-gray-400">{appt.contactPhone}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    {new Date(appt.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Badge label={statusLabel[appt.status]} variant={statusVariant[appt.status]} />
              </div>

              {Object.keys(appt.collectedData).length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1">
                  {Object.entries(appt.collectedData).map(([key, val]) => (
                    <p key={key} className="text-xs text-gray-600">
                      <span className="font-medium capitalize">{key}:</span> {val}
                    </p>
                  ))}
                </div>
              )}

              {(nextStatus[appt.status] || appt.status === 'pending') && (
                <div className="flex gap-2">
                  {nextLabel[appt.status] && (
                    <button
                      onClick={() => handleAdvance(appt.id, appt.status)}
                      disabled={updating === appt.id}
                      className="flex-1 py-2 text-xs font-medium bg-primary text-white rounded-xl disabled:opacity-50 transition-opacity"
                    >
                      {updating === appt.id ? '...' : nextLabel[appt.status]}
                    </button>
                  )}
                  {appt.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(appt.id)}
                      disabled={updating === appt.id + '-cancel'}
                      className="flex-1 py-2 text-xs font-medium bg-red-50 text-red-500 rounded-xl disabled:opacity-50 transition-opacity"
                    >
                      {updating === appt.id + '-cancel' ? '...' : 'Cancelar'}
                    </button>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
