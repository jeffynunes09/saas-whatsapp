import { ISubscriptionRepository } from '../ports/ISubscriptionRepository';
import { Subscriber, SubscriptionPlan, SubscriptionStatus } from '../../domain/entities/Subscriber';
import { v4 as uuidv4 } from 'uuid';

export class ManageSubscriptionUC {
  constructor(private subscriptionRepo: ISubscriptionRepository) {}

  async activate(kiwifySubscriptionId: string, email: string, plan: SubscriptionPlan, renewsAt: Date): Promise<void> {
    const subscriber = await this.subscriptionRepo.findByKiwifySubscriptionId(kiwifySubscriptionId);

    if (subscriber) {
      await this.subscriptionRepo.update(subscriber.id, {
        status: 'active',
        plan,
        renewsAt,
        updatedAt: new Date(),
      });
      return;
    }

    const existing = await this.subscriptionRepo.findByEmail(email);
    if (existing) {
      await this.subscriptionRepo.update(existing.id, {
        status: 'active',
        plan,
        kiwifySubscriptionId,
        renewsAt,
        updatedAt: new Date(),
      });
      return;
    }

    await this.subscriptionRepo.save({
      id: uuidv4(),
      email,
      name: '',
      plan,
      status: 'active',
      kiwifySubscriptionId,
      renewsAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async block(kiwifySubscriptionId: string): Promise<void> {
    const subscriber = await this.subscriptionRepo.findByKiwifySubscriptionId(kiwifySubscriptionId);
    if (subscriber) {
      await this.subscriptionRepo.updateStatus(subscriber.id, 'blocked');
    }
  }

  async cancel(kiwifySubscriptionId: string): Promise<void> {
    const subscriber = await this.subscriptionRepo.findByKiwifySubscriptionId(kiwifySubscriptionId);
    if (subscriber) {
      await this.subscriptionRepo.updateStatus(subscriber.id, 'inactive');
    }
  }
}
