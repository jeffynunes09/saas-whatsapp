import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ConnectWhatsAppUC } from '../../application/use-cases/ConnectWhatsAppUC';
import { EvolutionAPIProvider } from '../../infrastructure/whatsapp/EvolutionAPIProvider';
import { FCMProvider } from '../../infrastructure/notifications/FCMProvider';
import { QRCodeStore } from '../../infrastructure/cache/QRCodeStore';

const whatsappProvider = new EvolutionAPIProvider();
const notificationProvider = new FCMProvider();
const connectWhatsAppUC = new ConnectWhatsAppUC(whatsappProvider, notificationProvider);

export class WhatsAppController {
  async getQRCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instanceName = `sub_${req.subscriberId}`;
      const webhookUrl = `${process.env.BACKEND_URL ?? 'http://host.docker.internal:3000'}/webhooks/evolution`;

      // Serve do cache se disponível
      const cached = QRCodeStore.get(instanceName);
      if (cached) {
        res.json({ qrCode: cached });
        return;
      }

      // Garante que a instância existe, webhook configurado, e tenta obter QR sincronamente
      const { qrCode: freshQR } = await connectWhatsAppUC.getOrCreateInstance(instanceName, webhookUrl);
      if (freshQR) {
        QRCodeStore.set(instanceName, freshQR);
        res.json({ qrCode: freshQR });
        return;
      }

      // QR ainda não chegou — frontend voltará a perguntar no polling
      res.json({ qrCode: '' });
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

  async disconnect(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instanceName = `sub_${req.subscriberId}`;
      await whatsappProvider.deleteInstance(instanceName);
      QRCodeStore.clear(instanceName);
      res.json({ ok: true });
    } catch (err) {
      console.error('[disconnect]', err);
      res.status(500).json({ error: 'Erro ao desconectar' });
    }
  }

  async getPairingCode(req: AuthRequest, res: Response): Promise<void> {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      res.status(400).json({ error: 'phoneNumber obrigatório' });
      return;
    }
    try {
      const instanceName = `sub_${req.subscriberId}`;
      // Garante que a instância existe antes de pedir o pairing code
      await connectWhatsAppUC.getOrCreateInstance(instanceName);
      const pairingCode = await whatsappProvider.getPairingCode(instanceName, phoneNumber);
      res.json({ pairingCode });
    } catch (err) {
      console.error('[getPairingCode]', err);
      res.status(500).json({ error: 'Erro ao obter código de pareamento' });
    }
  }
}
