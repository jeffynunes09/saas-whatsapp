import { Agent } from '../../domain/entities/Agent';

export interface IAgentRepository {
  findBySubscriberId(subscriberId: string): Promise<Agent | null>;
  save(agent: Agent): Promise<Agent>;
  update(id: string, data: Partial<Agent>): Promise<Agent>;
}
