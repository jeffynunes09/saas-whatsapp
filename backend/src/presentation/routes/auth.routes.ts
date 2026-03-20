import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { registerDto, loginDto, fcmTokenDto } from '../dtos/auth.dto';
import { authMiddleware, AuthRequest } from '../middlewares/authMiddleware';
import { FCMProvider } from '../../infrastructure/notifications/FCMProvider';
import { SubscriptionSupabaseRepository } from '../../infrastructure/database/supabase/SubscriptionSupabaseRepository';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const authRoutes = Router();

authRoutes.post('/register', async (req, res) => {
  const parsed = registerDto.safeParse(req.body);
  if (!parsed.success) {
    console.error('[register] Validation error:', parsed.error.format());
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { name: parsed.data.name } },
  });

  if (error) {
    console.error('[register] Supabase error:', error.message, error.status);
    res.status(400).json({ error: error.message });
    return;
  }

  const subscriptionRepo = new SubscriptionSupabaseRepository();
  const existing = await subscriptionRepo.findByEmail(parsed.data.email);
  if (!existing) {
    await subscriptionRepo.save({
      id: uuidv4(),
      email: parsed.data.email,
      name: parsed.data.name,
      plan: 'starter',
      status: 'trial',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  res.status(201).json({ user: data.user, session: data.session });
});

authRoutes.post('/login', async (req, res) => {
  const parsed = loginDto.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error('[login] Supabase error:', error.message, error.status);
    res.status(401).json({ error: error.message });
    return;
  }

  res.json({ user: data.user, session: data.session });
});

authRoutes.post('/fcm-token', authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsed = fcmTokenDto.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }
  await new FCMProvider().registerToken(req.subscriberId!, parsed.data.token);
  res.json({ ok: true });
});
