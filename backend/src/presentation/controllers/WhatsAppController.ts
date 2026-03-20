import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ConnectWhatsAppUC } from '../../application/use-cases/ConnectWhatsAppUC';
import { EvolutionAPIProvider } from '../../infrastructure/whatsapp/EvolutionAPIProvider';
import { FCMProvider } from '../../infrastructure/notifications/FCMProvider';

const whatsappProvider = new EvolutionAPIProvider();
const notificationProvider = new FCMProvider();
const connectWhatsAppUC = new ConnectWhatsAppUC(whatsappProvider, notificationProvider);

export class WhatsAppController {
  async getQRCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instanceName = `sub_${req.subscriberId}`;
      const result = await connectWhatsAppUC.getOrCreateInstance(instanceName);
      res.json(result);
    } catch (err) {
      console.error('[getQRCode]', err);
      res.status(500).json({ error: 'Erro ao obter QR Code' });
    }
  }

  async getStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instanceName = `sub_${req.subscriberId}`;
      const status = await whatsappProvider.getStatus(instanceName);
      res.json({ status });
    } catch (err) {
      console.error('[getStatus]', err);
      res.json({ status: 'disconnected' });
    }
  }
}
