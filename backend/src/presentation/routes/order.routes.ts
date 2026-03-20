import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { OrderController } from '../controllers/OrderController';

export const orderRoutes = Router();
const controller = new OrderController();

orderRoutes.use(authMiddleware);
orderRoutes.get('/', (req, res) => controller.list(req as never, res));
orderRoutes.patch('/:id/status', (req, res) => controller.updateStatus(req as never, res));
