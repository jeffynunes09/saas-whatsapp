import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { WhatsAppController } from '../controllers/WhatsAppController';

export const whatsappRoutes = Router();
const controller = new WhatsAppController();

whatsappRoutes.use(authMiddleware);
whatsappRoutes.get('/qrcode', (req, res) => controller.getQRCode(req as never, res));
whatsappRoutes.get('/status', (req, res) => controller.getStatus(req as never, res));
whatsappRoutes.post('/pairing-code', (req, res) => controller.getPairingCode(req as never, res));
whatsappRoutes.post('/disconnect', (req, res) => controller.disconnect(req as never, res));
