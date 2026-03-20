import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { ConversationController } from '../controllers/ConversationController';

export const conversationRoutes = Router();
const controller = new ConversationController();

conversationRoutes.use(authMiddleware);
conversationRoutes.get('/', (req, res) => controller.list(req as never, res));
conversationRoutes.get('/metrics', (req, res) => controller.getMetrics(req as never, res));
conversationRoutes.get('/:id', (req, res) => controller.getOne(req as never, res));
conversationRoutes.patch('/:id/rate', (req, res) => controller.rate(req as never, res));
