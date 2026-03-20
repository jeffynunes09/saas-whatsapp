import { Order, OrderStatus } from '../../domain/entities/Order';

export interface IOrderRepository {
  save(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  findBySubscriberId(subscriberId: string): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
}
