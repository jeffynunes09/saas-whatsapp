import { IWhatsAppProvider } from '../ports/IWhatsAppProvider';
import { INotificationProvider } from '../ports/INotificationProvider';

export class ConnectWhatsAppUC {
  constructor(
    private whatsappProvider: IWhatsAppProvider,
    private notificationProvider: INotificationProvider,
  ) {}

  async getOrCreateInstance(instanceName: string, webhookUrl?: string): Promise<{ qrCode: string }> {
    const status = await this.whatsappProvider.getStatus(instanceName);
    console.log(`[ConnectWhatsAppUC] status de ${instanceName}: ${status}`);

    if (status === 'connected') {
      if (webhookUrl) await this.whatsappProvider.configureWebhook(instanceName, webhookUrl).catch(() => {});
      return { qrCode: '' };
    }

    // Instância em connecting — QR está sendo gerado, aguarda webhook QRCODE_UPDATED
    if (status === 'connecting') {
      return { qrCode: '' };
    }

    // Instância desconectada — logout + delete para remover completamente, depois cria fresca
    console.log(`[ConnectWhatsAppUC] recriando instância ${instanceName}`);
    await this.whatsappProvider.logoutInstance(instanceName).catch(() => {});
    await this.whatsappProvider.deleteInstance(instanceName).catch(() => {});
    const created = await this.whatsappProvider.createInstance(instanceName, webhookUrl);
    console.log(`[ConnectWhatsAppUC] instância criada, qrCode length: ${created.qrCode.length}`);
    return { qrCode: created.qrCode };
  }

  async handleDisconnect(subscriberId: string, instanceName: string): Promise<void> {
    await this.notificationProvider.sendPush(subscriberId, 'whatsapp_disconnected', { instanceName });
  }
}
