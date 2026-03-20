import { supabase } from './client';
import { IOrderRepository } from '../../../application/ports/IOrderRepository';
import { Order, OrderStatus } from '../../../domain/entities/Order';

export class OrderSupabaseRepository implements IOrderRepository {
  async save(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const { data: row, error } = await supabase
      .from('orders')
      .insert({
        subscriber_id: data.subscriberId,
        conversation_id: data.conversationId,
        contact_phone: data.contactPhone,
        contact_name: data.contactName,
        collected_data: data.collectedData,
        status: data.status,
      })
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(row);
  }

  async findBySubscriberId(subscriberId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('subscriber_id', subscriberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(this.toEntity);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  private toEntity(row: Record<string, unknown>): Order {
    return {
      id: row['id'] as string,
      subscriberId: row['subscriber_id'] as string,
      conversationId: row['conversation_id'] as string | null,
      contactPhone: row['contact_phone'] as string,
      contactName: row['contact_name'] as string | undefined,
      collectedData: (row['collected_data'] as Record<string, string>) ?? {},
      status: row['status'] as OrderStatus,
      createdAt: new Date(row['created_at'] as string),
      updatedAt: new Date(row['updated_at'] as string),
    };
  }
}
