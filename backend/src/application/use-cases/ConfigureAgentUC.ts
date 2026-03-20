import { IAgentRepository } from '../ports/IAgentRepository';
import { Agent } from '../../domain/entities/Agent';
import { v4 as uuidv4 } from 'uuid';

type ConfigureAgentInput = Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>;

export class ConfigureAgentUC {
  constructor(private agentRepo: IAgentRepository) {}

  async execute(input: ConfigureAgentInput): Promise<Agent> {
    const existing = await this.agentRepo.findBySubscriberId(input.subscriberId);

    if (existing) {
      return this.agentRepo.update(existing.id, { ...input, updatedAt: new Date() });
    }

    return this.agentRepo.save({
      ...input,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
