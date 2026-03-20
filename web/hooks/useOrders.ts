'use client';

import { useState, useEffect, useCallback } from 'react';
import { orderService, Order, OrderStatus } from '@/services/orderService';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await orderService.list();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await orderService.updateStatus(id, status);
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  return { orders, loading, updateStatus, reload: load };
}
