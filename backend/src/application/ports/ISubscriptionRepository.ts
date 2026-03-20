import { Subscriber, SubscriptionStatus } from '../../domain/entities/Subscriber';

export interface ISubscriptionRepository {
  findById(id: string): Promise<Subscriber | null>;
  findByEmail(email: string): Promise<Subscriber | null>;
  findByKiwifySubscriptionId(subscriptionId: string): Promise<Subscriber | null>;
  save(subscriber: Subscriber): Promise<Subscriber>;
  updateStatus(id: string, status: SubscriptionStatus): Promise<void>;
  update(id: string, data: Partial<Subscriber>): Promise<Subscriber>;
}
