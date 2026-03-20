import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/authMiddleware';
import { SubscriptionSupabaseRepository } from '../../infrastructure/database/supabase/SubscriptionSupabaseRepository';
import { Response } from 'express';

export const subscriptionRoutes = Router();
const subscriptionRepo = new SubscriptionSupabaseRepository();

subscriptionRoutes.use(authMiddleware);

subscriptionRoutes.get('/status', async (req: AuthRequest, res: Response) => {
  const subscriber = await subscriptionRepo.findById(req.subscriberId!);
  if (!subscriber) {
    res.status(404).json({ error: 'Assinante não encontrado' });
    return;
  }
  res.json({
    plan: subscriber.plan,
    status: subscriber.status,
    renewsAt: subscriber.renewsAt,
  });
});
