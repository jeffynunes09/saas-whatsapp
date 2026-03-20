import { supabase } from './client';
import { ISubscriptionRepository } from '../../../application/ports/ISubscriptionRepository';
import { Subscriber, SubscriptionStatus } from '../../../domain/entities/Subscriber';

export class SubscriptionSupabaseRepository implements ISubscriptionRepository {
  async findById(id: string): Promise<Subscriber | null> {
    const { data, error } = await supabase.from('subscribers').select('*').eq('id', id).single();
    if (error || !data) return null;
    return this.toEntity(data);
  }

  async findByEmail(email: string): Promise<Subscriber | null> {
    const { data, error } = await supabase.from('subscribers').select('*').eq('email', email).single();
    if (error || !data) return null;
    return this.toEntity(data);
  }

  async findByKiwifySubscriptionId(subscriptionId: string): Promise<Subscriber | null> {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('kiwify_subscription_id', subscriptionId)
      .single();
    if (error || !data) return null;
    return this.toEntity(data);
  }

  async save(subscriber: Subscriber): Promise<Subscriber> {
    const { data, error } = await supabase
      .from('subscribers')
      .insert(this.toRow(subscriber))
      .select()
      .single();
    if (error) throw error;
    return this.toEntity(data);
  }

  async updateStatus(id: string, status: SubscriptionStatus): Promise<void> {
    const { error } = await supabase
      .from('subscribers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  async update(id: string, data: Partial<Subscriber>): Promise<Subscriber> {
    const { data: updated, error } = await supabase
      .from('subscribers')
      .update({
        ...(data.name && { name: data.name }),
        ...(data.plan && { plan: data.plan }),
        ...(data.status && { status: data.status }),
        ...(data.kiwifySubscriptionId && { kiwify_subscription_id: data.kiwifySubscriptionId }),
        ...(data.renewsAt && { renews_at: data.renewsAt.toISOString() }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return this.toEntity(updated);
  }

  private toEntity(row: Record<string, unknown>): Subscriber {
    return {
      id: row.id as string,
      email: row.email as string,
      name: row.name as string,
      plan: row.plan as Subscriber['plan'],
      status: row.status as SubscriptionStatus,
      kiwifyCustomerId: row.kiwify_customer_id as string | undefined,
      kiwifySubscriptionId: row.kiwify_subscription_id as string | undefined,
      renewsAt: row.renews_at ? new Date(row.renews_at as string) : undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }

  private toRow(s: Subscriber) {
    return {
      id: s.id,
      email: s.email,
      name: s.name,
      plan: s.plan,
      status: s.status,
      kiwify_customer_id: s.kiwifyCustomerId,
      kiwify_subscription_id: s.kiwifySubscriptionId,
      renews_at: s.renewsAt?.toISOString(),
    };
  }
}
