import admin from 'firebase-admin';
import { supabase } from '../database/supabase/client';
import { INotificationProvider, NotificationType } from '../../application/ports/INotificationProvider';

export class FCMProvider implements INotificationProvider {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FCM_PROJECT_ID,
          clientEmail: process.env.FCM_CLIENT_EMAIL,
          privateKey: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async sendPush(subscriberId: string, type: NotificationType, data?: Record<string, string>): Promise<void> {
    const { data: tokens } = await supabase
      .from('fcm_tokens')
      .select('token')
      .eq('subscriber_id', subscriberId);

    if (!tokens?.length) return;

    const notificationMap: Record<NotificationType, { title: string; body: string }> = {
      bot_failed: { title: 'Atenção!', body: 'O bot não conseguiu resolver uma conversa.' },
      new_conversation: { title: 'Nova conversa', body: 'Um cliente iniciou uma conversa.' },
      whatsapp_disconnected: { title: 'WhatsApp desconectado', body: 'Reconecte seu número no app.' },
      new_appointment: { title: 'Novo agendamento', body: 'Um cliente fez um agendamento pelo bot.' },
      new_order: { title: 'Novo pedido', body: 'Um cliente fez um pedido pelo bot.' },
    };

    const notification = notificationMap[type];

    await Promise.allSettled(
      tokens.map(({ token }) =>
        admin.messaging().send({
          token,
          notification,
          data: { type, ...data },
        }),
      ),
    );
  }

  async registerToken(subscriberId: string, fcmToken: string): Promise<void> {
    await supabase
      .from('fcm_tokens')
      .upsert({ subscriber_id: subscriberId, token: fcmToken }, { onConflict: 'subscriber_id,token' });
  }
}
