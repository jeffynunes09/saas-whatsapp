import { Router } from 'express';
import { AgentIntentController } from '../controllers/AgentIntentController';
import { authMiddleware } from '../middlewares/authMiddleware';

export const intentRoutes = Router();
const controller = new AgentIntentController();

intentRoutes.use(authMiddleware);

intentRoutes.get('/', (req, res) => controller.list(req as never, res));
intentRoutes.post('/', (req, res) => controller.create(req as never, res));
intentRoutes.patch('/:id', (req, res) => controller.update(req as never, res));
intentRoutes.delete('/:id', (req, res) => controller.remove(req as never, res));
intentRoutes.patch('/:id/toggle', (req, res) => controller.toggleActive(req as never, res));
