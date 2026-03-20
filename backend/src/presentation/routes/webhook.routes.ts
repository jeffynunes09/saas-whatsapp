import { Router } from 'express';
import { webhookRateLimit } from '../middlewares/rateLimitMiddleware';
import { WebhookController } from '../controllers/WebhookController';

export const webhookRoutes = Router();
const controller = new WebhookController();

webhookRoutes.use(webhookRateLimit);
webhookRoutes.post('/evolution', (req, res) => controller.evolutionWebhook(req, res));
webhookRoutes.post('/kiwify', (req, res) => controller.kiwifyWebhook(req, res));
