import { IWhatsAppProvider } from '../ports/IWhatsAppProvider';
import { INotificationProvider } from '../ports/INotificationProvider';

export class ConnectWhatsAppUC {
  constructor(
    private whatsappProvider: IWhatsAppProvider,
    private notificationProvider: INotificationProvider,
  ) {}

  async getOrCreateInstance(instanceName: string, webhookUrl?: string): Promise<{ qrCode: string }> {
    const status = await this.whatsappProvider.getStatus(instanceName);
    if (status === 'connected') {
      if (webhookUrl) await this.whatsappProvider.configureWebhook(instanceName, webhookUrl).catch(() => {});
      return { qrCode: '' };
    }

    // Tenta obter QR de instância existente
    const qrCode = await this.whatsappProvider.getQRCode(instanceName);
    if (qrCode) {
      if (webhookUrl) await this.whatsappProvider.configureWebhook(instanceName, webhookUrl).catch(() => {});
      return { qrCode };
    }

    // Instância não existe — cria, configura webhook e retorna o QR
    const created = await this.whatsappProvider.createInstance(instanceName);
    if (webhookUrl) await this.whatsappProvider.configureWebhook(instanceName, webhookUrl).catch(() => {});
    return { qrCode: created.qrCode };
  }

  async handleDisconnect(subscriberId: string, instanceName: string): Promise<void> {
    await this.notificationProvider.sendPush(subscriberId, 'whatsapp_disconnected', { instanceName });
  }
}
