'use client';

import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { OrderStatus } from '@/services/orderService';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const statusVariant: Record<OrderStatus, 'yellow' | 'green' | 'blue' | 'gray' | 'red'> = {
  pending: 'yellow',
  confirmed: 'green',
  preparing: 'blue',
  delivered: 'gray',
  cancelled: 'red',
};

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'delivered',
  delivered: null,
  cancelled: null,
};

const nextLabel: Record<OrderStatus, string | null> = {
  pending: 'Confirmar',
  confirmed: 'Preparando',
  preparing: 'Entregue',
  delivered: null,
  cancelled: null,
};

export default function OrdersPage() {
  const { orders, loading, updateStatus } = useOrders();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleAdvance = async (id: string, current: OrderStatus) => {
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
      <Header title="Pedidos" subtitle={`${orders.length} no total`} />
      <div className="px-4 flex flex-col gap-3 pb-6">
        {loading ? (
          [...Array(3)].map((_, i) => <Card key={i} className="animate-pulse h-24 bg-gray-100" />)
        ) : orders.length === 0 ? (
          <Card className="text-center py-12 text-gray-400 text-sm">
            Nenhum pedido ainda.<br />
            Configure um intent do tipo "order" no agente.
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {order.contactName ?? order.contactPhone}
                  </p>
                  <p className="text-xs text-gray-400">{order.contactPhone}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Badge label={statusLabel[order.status]} variant={statusVariant[order.status]} />
              </div>

              {Object.keys(order.collectedData).length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1">
                  {Object.entries(order.collectedData).map(([key, val]) => (
                    <p key={key} className="text-xs text-gray-600">
                      <span className="font-medium capitalize">{key}:</span> {val}
                    </p>
                  ))}
                </div>
              )}

              {(nextStatus[order.status] || order.status === 'pending') && (
                <div className="flex gap-2">
                  {nextLabel[order.status] && (
                    <button
                      onClick={() => handleAdvance(order.id, order.status)}
                      disabled={updating === order.id}
                      className="flex-1 py-2 text-xs font-medium bg-primary text-white rounded-xl disabled:opacity-50 transition-opacity"
                    >
                      {updating === order.id ? '...' : nextLabel[order.status]}
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={updating === order.id + '-cancel'}
                      className="flex-1 py-2 text-xs font-medium bg-red-50 text-red-500 rounded-xl disabled:opacity-50 transition-opacity"
                    >
                      {updating === order.id + '-cancel' ? '...' : 'Cancelar'}
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
