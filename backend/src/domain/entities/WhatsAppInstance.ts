export type InstanceStatus = 'connected' | 'disconnected' | 'connecting';

export interface WhatsAppInstance {
  id: string;
  subscriberId: string;
  instanceName: string;
  phoneNumber?: string;
  status: InstanceStatus;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}
