import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AgentSupabaseRepository } from '../../infrastructure/database/supabase/AgentSupabaseRepository';
import { AgentIntentSupabaseRepository } from '../../infrastructure/database/supabase/AgentIntentSupabaseRepository';
import { createIntentDto, updateIntentDto } from '../dtos/intent.dto';
import { AgentIntent } from '../../domain/entities/AgentIntent';

export class AgentIntentController {
  private agentRepo = new AgentSupabaseRepository();
  private intentRepo = new AgentIntentSupabaseRepository();

  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agent = await this.agentRepo.findBySubscriberId(req.subscriberId!);
      if (!agent) {
        res.status(404).json({ error: 'Agente não configurado' });
        return;
      }
      const intents = await this.intentRepo.findByAgentId(agent.id);
      res.json(intents);
    } catch (err) {
      console.error('[AgentIntentController] list', err);
      res.status(500).json({ error: 'Erro ao buscar intenções' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    const parsed = createIntentDto.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }
    try {
      const agent = await this.agentRepo.findBySubscriberId(req.subscriberId!);
      if (!agent) {
        res.status(404).json({ error: 'Agente não configurado' });
        return;
      }
      const intent = await this.intentRepo.save({
        id: uuidv4(),
        agentId: agent.id,
        name: parsed.data.name,
        triggerPhrases: parsed.data.trigger_phrases,
        intentType: parsed.data.intent_type,
        fields: parsed.data.fields,
        confirmationMessage: parsed.data.confirmation_message,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      res.status(201).json(intent);
    } catch (err) {
      console.error('[AgentIntentController] create', err);
      res.status(500).json({ error: 'Erro ao criar intenção' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const parsed = updateIntentDto.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }
    try {
      const agent = await this.agentRepo.findBySubscriberId(req.subscriberId!);
      if (!agent) {
        res.status(404).json({ error: 'Agente não configurado' });
        return;
      }
      const intent = await this.intentRepo.findById(req.params.id);
      if (!intent || intent.agentId !== agent.id) {
        res.status(404).json({ error: 'Intenção não encontrada' });
        return;
      }
      const updateData: Partial<AgentIntent> = {};
      if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
      if (parsed.data.trigger_phrases !== undefined) updateData.triggerPhrases = parsed.data.trigger_phrases;
      if (parsed.data.intent_type !== undefined) updateData.intentType = parsed.data.intent_type;
      if (parsed.data.fields !== undefined) updateData.fields = parsed.data.fields;
      if (parsed.data.confirmation_message !== undefined) updateData.confirmationMessage = parsed.data.confirmation_message;

      const updated = await this.intentRepo.update(req.params.id, updateData);
      res.json(updated);
    } catch (err) {
      console.error('[AgentIntentController] update', err);
      res.status(500).json({ error: 'Erro ao atualizar intenção' });
    }
  }

  async remove(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agent = await this.agentRepo.findBySubscriberId(req.subscriberId!);
      if (!agent) {
        res.status(404).json({ error: 'Agente não configurado' });
        return;
      }
      const intent = await this.intentRepo.findById(req.params.id);
      if (!intent || intent.agentId !== agent.id) {
        res.status(404).json({ error: 'Intenção não encontrada' });
        return;
      }
      await this.intentRepo.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error('[AgentIntentController] remove', err);
      res.status(500).json({ error: 'Erro ao deletar intenção' });
    }
  }

  async toggleActive(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agent = await this.agentRepo.findBySubscriberId(req.subscriberId!);
      if (!agent) {
        res.status(404).json({ error: 'Agente não configurado' });
        return;
      }
      const intent = await this.intentRepo.findById(req.params.id);
      if (!intent || intent.agentId !== agent.id) {
        res.status(404).json({ error: 'Intenção não encontrada' });
        return;
      }
      const updated = await this.intentRepo.update(req.params.id, { isActive: !intent.isActive });
      res.json({ isActive: updated.isActive });
    } catch (err) {
      console.error('[AgentIntentController] toggleActive', err);
      res.status(500).json({ error: 'Erro ao atualizar intenção' });
    }
  }
}
