import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { SubscriptionSupabaseRepository } from '../../infrastructure/database/supabase/SubscriptionSupabaseRepository';

export interface AuthRequest extends Request {
  subscriberId?: string;
}

const subscriptionRepo = new SubscriptionSupabaseRepository();

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }

  const subscriber = await subscriptionRepo.findByEmail(data.user.email!);
  if (!subscriber) {
    res.status(403).json({ error: 'Assinatura não encontrada' });
    return;
  }

  if (subscriber.status !== 'active' && subscriber.status !== 'trial') {
    res.status(403).json({ error: 'Assinatura inativa ou bloqueada' });
    return;
  }

  // Expira trial automaticamente se prazo passou
  if (subscriber.status === 'trial' && subscriber.trialEndsAt && subscriber.trialEndsAt < new Date()) {
    await subscriptionRepo.updateStatus(subscriber.id, 'inactive');
    res.status(403).json({ error: 'Período de trial encerrado. Assine um plano para continuar.' });
    return;
  }

  req.subscriberId = subscriber.id;
  next();
}
