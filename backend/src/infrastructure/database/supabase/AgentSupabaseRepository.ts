import { supabase } from './client';
import { IAgentRepository } from '../../../application/ports/IAgentRepository';
import { Agent } from '../../../domain/entities/Agent';

export class AgentSupabaseRepository implements IAgentRepository {
  async findBySubscriberId(subscriberId: string): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('subscriber_id', subscriberId)
      .single();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async save(agent: Agent): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .insert(this.toRow(agent))
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async update(id: string, data: Partial<Agent>): Promise<Agent> {
    const { data: updated, error } = await supabase
      .from('agents')
      .update(this.toPartialRow(data))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(updated);
  }

  private toEntity(row: Record<string, unknown>): Agent {
    return {
      id: row.id as string,
      subscriberId: row.subscriber_id as string,
      name: row.name as string,
      tone: row.tone as Agent['tone'],
      businessInfo: row.business_info as Agent['businessInfo'],
      faq: (row.faq as Agent['faq']) ?? [],
      contextFileUrl: row.context_file_url as string | undefined,
      fallbackAfterAttempts: row.fallback_after_attempts as number,
      isPaused: row.is_paused as boolean,
      systemPrompt: row.system_prompt as string | undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }

  private toRow(agent: Agent) {
    return {
      id: agent.id,
      subscriber_id: agent.subscriberId,
      name: agent.name,
      tone: agent.tone,
      business_info: agent.businessInfo,
      faq: agent.faq,
      context_file_url: agent.contextFileUrl,
      fallback_after_attempts: agent.fallbackAfterAttempts,
      is_paused: agent.isPaused,
      system_prompt: agent.systemPrompt,
    };
  }

  private toPartialRow(data: Partial<Agent>) {
    return {
      ...(data.name && { name: data.name }),
      ...(data.tone && { tone: data.tone }),
      ...(data.businessInfo && { business_info: data.businessInfo }),
      ...(data.faq && { faq: data.faq }),
      ...(data.contextFileUrl !== undefined && { context_file_url: data.contextFileUrl }),
      ...(data.fallbackAfterAttempts !== undefined && { fallback_after_attempts: data.fallbackAfterAttempts }),
      ...(data.isPaused !== undefined && { is_paused: data.isPaused }),
      updated_at: new Date().toISOString(),
    };
  }
}
