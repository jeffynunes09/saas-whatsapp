import { IWhatsAppProvider } from '../ports/IWhatsAppProvider';
import { INotificationProvider } from '../ports/INotificationProvider';

export class ConnectWhatsAppUC {
  constructor(
    private whatsappProvider: IWhatsAppProvider,
    private notificationProvider: INotificationProvider,
  ) {}

  async getOrCreateInstance(instanceName: string): Promise<{ qrCode: string }> {
    const status = await this.whatsappProvider.getStatus(instanceName);
    if (status === 'connected') return { qrCode: '' };

    // Tenta obter QR de instância existente
    const qrCode = await this.whatsappProvider.getQRCode(instanceName);
    if (qrCode) return { qrCode };

    // Instância não existe — cria e retorna o QR
    const created = await this.whatsappProvider.createInstance(instanceName);
    return { qrCode: created.qrCode };
  }

  async handleDisconnect(subscriberId: string, instanceName: string): Promise<void> {
    await this.notificationProvider.sendPush(subscriberId, 'whatsapp_disconnected', { instanceName });
  }
}
