import { WhatsAppInstance } from '../../domain/entities/WhatsAppInstance';

export interface IWhatsAppProvider {
  createInstance(instanceName: string, webhookUrl?: string): Promise<{ instanceName: string; qrCode: string }>;
  getQRCode(instanceName: string): Promise<string>;
  getStatus(instanceName: string): Promise<'connected' | 'disconnected' | 'connecting'>;
  sendMessage(instanceName: string, phone: string, text: string): Promise<void>;
  deleteInstance(instanceName: string): Promise<void>;
  logoutInstance(instanceName: string): Promise<void>;
  configureWebhook(instanceName: string, webhookUrl: string): Promise<void>;
}
