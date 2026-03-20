import axios from 'axios';
import { IWhatsAppProvider } from '../../application/ports/IWhatsAppProvider';

export class EvolutionAPIProvider implements IWhatsAppProvider {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.EVOLUTION_API_URL!;
    this.apiKey = process.env.EVOLUTION_API_KEY!;
  }

  private get headers() {
    return { apikey: this.apiKey };
  }

  async createInstance(instanceName: string, webhookUrl?: string): Promise<{ instanceName: string; qrCode: string }> {
    const payload: Record<string, unknown> = {
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    };
    if (webhookUrl) {
      payload.webhook = {
        enabled: true,
        url: webhookUrl,
        byEvents: false,
        base64: true,
        events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'CONTACTS_UPSERT', 'CONTACTS_UPDATE', 'QRCODE_UPDATED'],
      };
    }
    try {
      const { data } = await axios.post(
        `${this.baseURL}/instance/create`,
        payload,
        { headers: this.headers },
      );
      console.log(`[EvolutionAPI] createInstance response:`, JSON.stringify(data).slice(0, 500));
      const qrCode = data?.qrcode?.base64 ?? '';
      return { instanceName, qrCode };
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 409) {
        console.log(`[EvolutionAPI] createInstance: instância já existe (${status})`);
        return { instanceName, qrCode: '' };
      }
      throw err;
    }
  }

  async getQRCode(instanceName: string): Promise<string> {
    // v2: /instance/connect retorna o QR no body E envia via webhook QRCODE_UPDATED
    try {
      const { data } = await axios.get(
        `${this.baseURL}/instance/connect/${instanceName}`,
        { headers: this.headers },
      );
      console.log(`[EvolutionAPI] connect response:`, JSON.stringify(data).slice(0, 300));
      const base64 = data?.qrcode?.base64 ?? data?.base64 ?? '';
      return base64;
    } catch (err) {
      console.warn(`[EvolutionAPI] connect failed for ${instanceName}:`, (err as { response?: { status?: number; data?: unknown } })?.response?.status, (err as { response?: { status?: number; data?: unknown } })?.response?.data);
      return '';
    }
  }

  async getStatus(instanceName: string): Promise<'connected' | 'disconnected' | 'connecting'> {
    try {
      const { data } = await axios.get(
        `${this.baseURL}/instance/connectionState/${instanceName}`,
        { headers: this.headers },
      );
      const state = data.instance?.state ?? data.state;
      if (state === 'open') return 'connected';
      if (state === 'connecting') return 'connecting';
      return 'disconnected';
    } catch {
      return 'disconnected';
    }
  }

  async sendMessage(instanceName: string, phone: string, text: string): Promise<void> {
    const number = phone.includes('@') ? phone : phone.replace(/\D/g, '');
    try {
      // v2 usa { number, text } sem o wrapper textMessage
      await axios.post(
        `${this.baseURL}/message/sendText/${instanceName}`,
        { number, text },
        { headers: this.headers },
      );
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: { response?: { message?: { exists?: boolean }[] } } } })?.response?.data;
      const isLidBlock = responseData?.response?.message?.some((m) => m.exists === false);
      if (isLidBlock) {
        console.warn(`[EvolutionAPI] @lid não suportado para envio: ${number}`);
        return;
      }
      console.error(`[EvolutionAPI] sendMessage failed for ${number}`, (err as { response?: { status?: number } })?.response?.status);
      throw err;
    }
  }

  async configureWebhook(instanceName: string, webhookUrl: string): Promise<void> {
    const { data } = await axios.post(
      `${this.baseURL}/webhook/set/${instanceName}`,
      {
        webhook: {
          enabled: true,
          url: webhookUrl,
          byEvents: false,
          base64: true,
          events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'CONTACTS_UPSERT', 'CONTACTS_UPDATE', 'QRCODE_UPDATED'],
        },
      },
      { headers: this.headers },
    );
    console.log(`[EvolutionAPI] configureWebhook response:`, JSON.stringify(data).slice(0, 300));
  }

  async getPairingCode(instanceName: string, phoneNumber: string): Promise<string> {
    const { data } = await axios.post(
      `${this.baseURL}/instance/pairingCode/${instanceName}`,
      { phoneNumber },
      { headers: this.headers },
    );
    return data.pairingCode ?? data.code ?? '';
  }

  async logoutInstance(instanceName: string): Promise<void> {
    await axios.delete(
      `${this.baseURL}/instance/logout/${instanceName}`,
      { headers: this.headers },
    );
  }

  async deleteInstance(instanceName: string): Promise<void> {
    await axios.delete(
      `${this.baseURL}/instance/delete/${instanceName}`,
      { headers: this.headers },
    );
  }
}
