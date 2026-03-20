import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ConversationSupabaseRepository } from '../../infrastructure/database/supabase/ConversationSupabaseRepository';

const conversationRepo = new ConversationSupabaseRepository();

export class ConversationController {
  async list(req: AuthRequest, res: Response): Promise<void> {
    const { contactPhone, keyword, status } = req.query as Record<string, string>;
    const conversations = await conversationRepo.findBySubscriberId(req.subscriberId!, {
      contactPhone,
      keyword,
      status,
    });
    res.json(conversations);
  }

  async getOne(req: AuthRequest, res: Response): Promise<void> {
    const conversation = await conversationRepo.findById(req.params.id);
    if (!conversation || conversation.subscriberId !== req.subscriberId) {
      res.status(404).json({ error: 'Conversa não encontrada' });
      return;
    }
    res.json(conversation);
  }

  async rate(req: AuthRequest, res: Response): Promise<void> {
    const { rating } = req.body as { rating: 'positive' | 'negative' };
    const conversation = await conversationRepo.findById(req.params.id);
    if (!conversation || conversation.subscriberId !== req.subscriberId) {
      res.status(404).json({ error: 'Conversa não encontrada' });
      return;
    }
    await conversationRepo.update(req.params.id, { satisfactionRating: rating });
    res.json({ ok: true });
  }

  async getMetrics(req: AuthRequest, res: Response): Promise<void> {
    const metrics = await conversationRepo.getMetrics(req.subscriberId!);
    res.json(metrics);
  }
}
