import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { AppointmentController } from '../controllers/AppointmentController';

export const appointmentRoutes = Router();
const controller = new AppointmentController();

appointmentRoutes.use(authMiddleware);
appointmentRoutes.get('/', (req, res) => controller.list(req as never, res));
appointmentRoutes.patch('/:id/status', (req, res) => controller.updateStatus(req as never, res));
