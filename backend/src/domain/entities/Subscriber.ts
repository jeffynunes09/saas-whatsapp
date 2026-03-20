export type SubscriptionStatus = 'active' | 'inactive' | 'blocked' | 'trial';
export type SubscriptionPlan = 'starter' | 'pro' | 'business';

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  kiwifyCustomerId?: string;
  kiwifySubscriptionId?: string;
  renewsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
