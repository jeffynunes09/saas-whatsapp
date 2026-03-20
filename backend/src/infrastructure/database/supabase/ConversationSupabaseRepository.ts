import { supabase } from './client';
import { IConversationRepository, ConversationFilters } from '../../../application/ports/IConversationRepository';
import { Conversation, Message } from '../../../domain/entities/Conversation';

export class ConversationSupabaseRepository implements IConversationRepository {
  async findById(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, messages(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async findBySubscriberId(subscriberId: string, filters?: ConversationFilters): Promise<Conversation[]> {
    let query = supabase
      .from('conversations')
      .select('*, messages(*)')
      .eq('subscriber_id', subscriberId)
      .order('updated_at', { ascending: false });

    if (filters?.contactPhone) query = query.ilike('contact_phone', `%${filters.contactPhone}%`);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => this.toEntity(row));
  }

  async findByContactPhone(subscriberId: string, phone: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, messages(*)')
      .eq('subscriber_id', subscriberId)
      .eq('contact_phone', phone)
      .eq('status', 'open')
      .single();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async save(conversation: Conversation): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        id: conversation.id,
        subscriber_id: conversation.subscriberId,
        whatsapp_instance_id: conversation.whatsappInstanceId,
        contact_phone: conversation.contactPhone,
        contact_name: conversation.contactName,
        status: conversation.status,
        satisfaction_rating: conversation.satisfactionRating,
        attempt_count: conversation.attemptCount,
      })
      .select()
      .single();

    if (error) throw error;
    return { ...conversation, ...this.toEntity({ ...data, messages: [] }) };
  }

  async update(id: string, data: Partial<Conversation>): Promise<Conversation> {
    const { data: updated, error } = await supabase
      .from('conversations')
      .update({
        ...(data.status && { status: data.status }),
        ...(data.satisfactionRating !== undefined && { satisfaction_rating: data.satisfactionRating }),
        ...(data.attemptCount !== undefined && { attempt_count: data.attemptCount }),
        ...(data.resolvedAt && { resolved_at: data.resolvedAt.toISOString() }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, messages(*)')
      .single();

    if (error) throw error;
    return this.toEntity(updated);
  }

  async addMessage(conversationId: string, message: Message): Promise<void> {
    const { error } = await supabase.from('messages').insert({
      id: message.id,
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp.toISOString(),
    });

    if (error) throw error;
  }

  async getMetrics(subscriberId: string): Promise<{ totalMessages: number; avgResponseTimeMs: number; resolutionRate: number }> {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id, status')
      .eq('subscriber_id', subscriberId);

    const total = conversations?.length ?? 0;
    const resolved = conversations?.filter((c) => c.status === 'resolved').length ?? 0;

    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', (conversations ?? []).map((c) => c.id));

    return {
      totalMessages: count ?? 0,
      avgResponseTimeMs: 2500,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
    };
  }

  private toEntity(row: Record<string, unknown>): Conversation {
    const messages = (row.messages as Record<string, unknown>[] | undefined) ?? [];
    return {
      id: row.id as string,
      subscriberId: row.subscriber_id as string,
      whatsappInstanceId: row.whatsapp_instance_id as string,
      contactPhone: row.contact_phone as string,
      contactName: row.contact_name as string | undefined,
      status: row.status as Conversation['status'],
      messages: messages.map((m) => ({
        id: m.id as string,
        conversationId: m.conversation_id as string,
        role: m.role as Message['role'],
        content: m.content as string,
        timestamp: new Date(m.timestamp as string),
      })),
      satisfactionRating: row.satisfaction_rating as Conversation['satisfactionRating'],
      attemptCount: row.attempt_count as number,
      resolvedAt: row.resolved_at ? new Date(row.resolved_at as string) : undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }
}
