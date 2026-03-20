import { Request, Response } from 'express';
import { SendMessageUC } from '../../application/use-cases/SendMessageUC';
import { ManageSubscriptionUC } from '../../application/use-cases/ManageSubscriptionUC';
import { AgentSupabaseRepository } from '../../infrastructure/database/supabase/AgentSupabaseRepository';
import { ConversationSupabaseRepository } from '../../infrastructure/database/supabase/ConversationSupabaseRepository';
import { SubscriptionSupabaseRepository } from '../../infrastructure/database/supabase/SubscriptionSupabaseRepository';
import { OpenAIProvider } from '../../infrastructure/llm/OpenAIProvider';
import { EvolutionAPIProvider } from '../../infrastructure/whatsapp/EvolutionAPIProvider';
import { FCMProvider } from '../../infrastructure/notifications/FCMProvider';
import { supabase } from '../../infrastructure/database/supabase/client';

export class WebhookController {
  private get sendMessageUC() {
    return new SendMessageUC(
      new AgentSupabaseRepository(),
      new ConversationSupabaseRepository(),
      new OpenAIProvider(),
      new EvolutionAPIProvider(),
      new FCMProvider(),
    );
  }

  private get manageSubUC() {
    return new ManageSubscriptionUC(new SubscriptionSupabaseRepository());
  }

  async evolutionWebhook(req: Request, res: Response): Promise<void> {
    const { event, instance, data } = req.body;

    if (event === 'messages.upsert' && data?.key?.fromMe === false) {
      const { data: instanceRow } = await supabase
        .from('whatsapp_instances')
        .select('subscriber_id')
        .eq('instance_name', instance)
        .single();

      if (instanceRow) {
        await this.sendMessageUC.execute({
          instanceName: instance,
          subscriberId: instanceRow.subscriber_id,
          contactPhone: data.key.remoteJid.replace('@s.whatsapp.net', ''),
          contactName: data.pushName,
          text: data.message?.conversation ?? data.message?.extendedTextMessage?.text ?? '',
        });
      }
    }

    if (event === 'connection.update' && data?.state === 'close') {
      const { data: instanceRow } = await supabase
        .from('whatsapp_instances')
        .select('subscriber_id')
        .eq('instance_name', instance)
        .single();

      if (instanceRow) {
        await new FCMProvider().sendPush(instanceRow.subscriber_id, 'whatsapp_disconnected', { instanceName: instance });
      }
    }

    res.json({ ok: true });
  }

  async kiwifyWebhook(req: Request, res: Response): Promise<void> {
    const { event, subscription } = req.body;

    const planMap: Record<string, 'starter' | 'pro' | 'business'> = {
      starter: 'starter',
      pro: 'pro',
      business: 'business',
    };

    if (event === 'order_approved' || event === 'subscription_renewed') {
      await this.manageSubUC.activate(
        subscription.id,
        subscription.customer.email,
        planMap[subscription.plan] ?? 'starter',
        new Date(subscription.next_payment),
      );
    }

    if (event === 'subscription_canceled') {
      await this.manageSubUC.cancel(subscription.id);
    }

    if (event === 'subscription_overdue') {
      await this.manageSubUC.block(subscription.id);
    }

    res.json({ ok: true });
  }
}
