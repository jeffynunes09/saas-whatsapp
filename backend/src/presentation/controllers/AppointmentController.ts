import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AppointmentSupabaseRepository } from '../../infrastructure/database/supabase/AppointmentSupabaseRepository';
import { AppointmentStatus } from '../../domain/entities/Appointment';

const repo = new AppointmentSupabaseRepository();

export class AppointmentController {
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const appointments = await repo.findBySubscriberId(req.subscriberId!);
      res.json(appointments);
    } catch (err) {
      console.error('[AppointmentController] list:', err);
      res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body as { status: AppointmentStatus };
    const valid: AppointmentStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!valid.includes(status)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }
    try {
      await repo.updateStatus(id, status);
      res.json({ ok: true });
    } catch (err) {
      console.error('[AppointmentController] updateStatus:', err);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }
}
