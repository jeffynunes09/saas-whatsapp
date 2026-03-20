import { api } from './api';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  subscriberId: string;
  conversationId: string | null;
  contactPhone: string;
  contactName?: string;
  collectedData: Record<string, string>;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export const orderService = {
  list: () => api.get<Order[]>('/orders').then((r) => r.data),
  updateStatus: (id: string, status: OrderStatus) =>
    api.patch(`/orders/${id}/status`, { status }).then((r) => r.data),
};
