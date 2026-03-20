export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  subscriberId: string;
  conversationId: string | null;
  contactPhone: string;
  contactName?: string;
  collectedData: Record<string, string>;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}
