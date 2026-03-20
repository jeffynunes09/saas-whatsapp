import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { OrderSupabaseRepository } from '../../infrastructure/database/supabase/OrderSupabaseRepository';
import { OrderStatus } from '../../domain/entities/Order';

const repo = new OrderSupabaseRepository();

export class OrderController {
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const orders = await repo.findBySubscriberId(req.subscriberId!);
      res.json(orders);
    } catch (err) {
      console.error('[OrderController] list:', err);
      res.status(500).json({ error: 'Erro ao listar pedidos' });
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };
    const valid: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }
    try {
      await repo.updateStatus(id, status);
      res.json({ ok: true });
    } catch (err) {
      console.error('[OrderController] updateStatus:', err);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }
}
