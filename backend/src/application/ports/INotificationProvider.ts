export type NotificationType = 'bot_failed' | 'new_conversation' | 'whatsapp_disconnected';

export interface INotificationProvider {
  sendPush(subscriberId: string, type: NotificationType, data?: Record<string, string>): Promise<void>;
  registerToken(subscriberId: string, fcmToken: string): Promise<void>;
}
