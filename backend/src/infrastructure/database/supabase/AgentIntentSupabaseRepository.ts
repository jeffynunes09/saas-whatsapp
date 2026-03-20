import { supabase } from './client';
import { IAgentIntentRepository } from '../../../application/ports/IAgentIntentRepository';
import { AgentIntent, IntentField } from '../../../domain/entities/AgentIntent';

export class AgentIntentSupabaseRepository implements IAgentIntentRepository {
  async findByAgentId(agentId: string): Promise<AgentIntent[]> {
    const { data, error } = await supabase
      .from('agent_intents')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []).map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<AgentIntent | null> {
    const { data, error } = await supabase
      .from('agent_intents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async save(intent: AgentIntent): Promise<AgentIntent> {
    const { data, error } = await supabase
      .from('agent_intents')
      .insert(this.toRow(intent))
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(data);
  }

  async update(id: string, data: Partial<AgentIntent>): Promise<AgentIntent> {
    const { data: updated, error } = await supabase
      .from('agent_intents')
      .update(this.toPartialRow(data))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('agent_intents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private toEntity(row: Record<string, unknown>): AgentIntent {
    return {
      id: row.id as string,
      agentId: row.agent_id as string,
      name: row.name as string,
      triggerPhrases: row.trigger_phrases as string[],
      intentType: row.intent_type as AgentIntent['intentType'],
      fields: (row.fields as IntentField[]) ?? [],
      confirmationMessage: row.confirmation_message as string,
      isActive: row.is_active as boolean,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }

  private toRow(intent: AgentIntent) {
    return {
      id: intent.id,
      agent_id: intent.agentId,
      name: intent.name,
      trigger_phrases: intent.triggerPhrases,
      intent_type: intent.intentType,
      fields: intent.fields,
      confirmation_message: intent.confirmationMessage,
      is_active: intent.isActive,
    };
  }

  private toPartialRow(data: Partial<AgentIntent>) {
    return {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.triggerPhrases !== undefined && { trigger_phrases: data.triggerPhrases }),
      ...(data.intentType !== undefined && { intent_type: data.intentType }),
      ...(data.fields !== undefined && { fields: data.fields }),
      ...(data.confirmationMessage !== undefined && { confirmation_message: data.confirmationMessage }),
      ...(data.isActive !== undefined && { is_active: data.isActive }),
      updated_at: new Date().toISOString(),
    };
  }
}
