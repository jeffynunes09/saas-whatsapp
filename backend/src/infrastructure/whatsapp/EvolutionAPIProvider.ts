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

  async createInstance(instanceName: string): Promise<{ instanceName: string; qrCode: string }> {
    try {
      const { data } = await axios.post(
        `${this.baseURL}/instance/create`,
        { instanceName, qrcode: true, integration: 'WHATSAPP-BAILEYS' },
        { headers: this.headers },
      );
      console.log(data)
      return { instanceName, qrCode: data.qrcode?.base64 ?? '' };
    } catch (err: any) {
      // Instance already exists — fetch QR from existing instance
      if (err?.response?.status === 403 || err?.response?.status === 409) {
        const qrCode = await this.getQRCode(instanceName);
        return { instanceName, qrCode };
      }
      throw err;
    }
  }

  async getQRCode(instanceName: string): Promise<string> {
    try {
      const { data } = await axios.get(
        `${this.baseURL}/instance/connect/${instanceName}`,
        { headers: this.headers },
      );
      // v1: { base64 } | v2: { qrcode: { base64 } }
      return data.base64 ?? data.qrcode?.base64 ?? '';
    } catch {
      return '';
    }
  }

  async getStatus(instanceName: string): Promise<'connected' | 'disconnected' | 'connecting'> {
    try {
      const { data } = await axios.get(
        `${this.baseURL}/instance/connectionState/${instanceName}`,
        { headers: this.headers },
      );
      const state = data.instance?.state;
      if (state === 'open') return 'connected';
      if (state === 'connecting') return 'connecting';
      return 'disconnected';
    } catch {
      return 'disconnected';
    }
  }

  async sendMessage(instanceName: string, phone: string, text: string): Promise<void> {
    await axios.post(
      `${this.baseURL}/message/sendText/${instanceName}`,
      { number: phone, text },
      { headers: this.headers },
    );
  }

  async getPairingCode(instanceName: string, phoneNumber: string): Promise<string> {
    const { data } = await axios.post(
      `${this.baseURL}/instance/pairingCode/${instanceName}`,
      { phoneNumber },
      { headers: this.headers },
    );
    return data.pairingCode ?? data.code ?? '';
  }

  async deleteInstance(instanceName: string): Promise<void> {
    await axios.delete(
      `${this.baseURL}/instance/delete/${instanceName}`,
      { headers: this.headers },
    );
  }
}
