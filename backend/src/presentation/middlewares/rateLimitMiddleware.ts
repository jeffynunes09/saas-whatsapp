import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: 'Rate limit excedido' },
});
