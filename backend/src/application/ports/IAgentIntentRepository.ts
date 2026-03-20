import { AgentIntent } from '../../domain/entities/AgentIntent';

export interface IAgentIntentRepository {
  findByAgentId(agentId: string): Promise<AgentIntent[]>;
  findById(id: string): Promise<AgentIntent | null>;
  save(intent: AgentIntent): Promise<AgentIntent>;
  update(id: string, data: Partial<AgentIntent>): Promise<AgentIntent>;
  delete(id: string): Promise<void>;
}
