import { api } from './api';

export const whatsappService = {
  getQRCode: () => api.get<{ qrCode: string }>('/whatsapp/qrcode').then((r) => r.data),
  getStatus: () =>
    api.get<{ status: 'connected' | 'disconnected' | 'connecting' }>('/whatsapp/status').then((r) => r.data),
  getPairingCode: (phoneNumber: string) =>
    api.post<{ pairingCode: string }>('/whatsapp/pairing-code', { phoneNumber }).then((r) => r.data),
  disconnect: () => api.post('/whatsapp/disconnect').then((r) => r.data),
};
