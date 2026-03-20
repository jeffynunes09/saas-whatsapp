interface QREntry {
  qrCode: string;
  expiresAt: number;
}

// Singleton em memória — QR codes expiram em 30s (tempo de vida no WhatsApp)
const store = new Map<string, QREntry>();

export const QRCodeStore = {
  set(instanceName: string, qrCode: string): void {
    store.set(instanceName, { qrCode, expiresAt: Date.now() + 30_000 });
  },

  get(instanceName: string): string {
    const entry = store.get(instanceName);
    if (!entry) return '';
    if (Date.now() > entry.expiresAt) {
      store.delete(instanceName);
      return '';
    }
    return entry.qrCode;
  },

  clear(instanceName: string): void {
    store.delete(instanceName);
  },
};
