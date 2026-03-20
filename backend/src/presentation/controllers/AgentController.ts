import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ConfigureAgentUC } from '../../application/use-cases/ConfigureAgentUC';
import { AgentSupabaseRepository } from '../../infrastructure/database/supabase/AgentSupabaseRepository';
import { configureAgentDto } from '../dtos/agent.dto';

export class AgentController {
  private agentRepo = new AgentSupabaseRepository();
  private configureAgentUC = new ConfigureAgentUC(this.agentRepo);

  async getAgent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agent = await this.agentRepo.findBySubscriberId(req.subscriberId!);
      res.json(agent);
    } catch (err) {
      console.error('[getAgent]', err);
      res.status(500).json({ error: 'Erro ao buscar agente' });
    }
  }

  async configureAgent(req: AuthRequest, res: Response): Promise<void> {
    const parsed = configureAgentDto.safeParse(req.body);
    if (!parsed.success) {
      console.error('[configureAgent] Validation error:', JSON.stringify(parsed.error.format()));
      res.status(400).json({ error: parsed.error.format() });
      return;
    }

    try {
      const agent = await this.configureAgentUC.execute({
        ...parsed.data,
        subscriberId: req.subscriberId!,
      });
      res.json(agent);
    } catch (err) {
      console.error('[configureAgent] Error:', err);
      res.status(500).json({ error: 'Erro ao salvar configurações do agente' });
    }
  }

  async togglePause(req: AuthRequest, res: Response): Promise<void> {
    try {
      const existing = await this.agentRepo.findBySubscriberId(req.subscriberId!);
      if (!existing) {
        res.status(404).json({ error: 'Agente não encontrado' });
        return;
      }
      const updated = await this.agentRepo.update(existing.id, { isPaused: !existing.isPaused });
      res.json({ isPaused: updated.isPaused });
    } catch (err) {
      console.error('[togglePause]', err);
      res.status(500).json({ error: 'Erro ao pausar agente' });
    }
  }

  async uploadContextFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const file = (req as unknown as { file?: Express.Multer.File }).file;
      if (!file) {
        res.status(400).json({ error: 'Arquivo não enviado' });
        return;
      }

      const { supabase } = await import('../../infrastructure/database/supabase/client');
      const fileName = `${req.subscriberId!}/${Date.now()}_${file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from('context-files')
        .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('context-files').getPublicUrl(fileName);

      const existing = await this.agentRepo.findBySubscriberId(req.subscriberId!);
      if (existing) {
        await this.agentRepo.update(existing.id, { contextFileUrl: data.publicUrl });
      }

      res.json({ url: data.publicUrl });
    } catch (err) {
      console.error('[uploadContextFile]', err);
      res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
    }
  }
}
