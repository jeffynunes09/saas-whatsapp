import { Request, Response } from 'express';
import { SendMessageUC } from '../../application/use-cases/SendMessageUC';
import { ManageSubscriptionUC } from '../../application/use-cases/ManageSubscriptionUC';
import { AgentSupabaseRepository } from '../../infrastructure/database/supabase/AgentSupabaseRepository';
import { ConversationSupabaseRepository } from '../../infrastructure/database/supabase/ConversationSupabaseRepository';
import { SubscriptionSupabaseRepository } from '../../infrastructure/database/supabase/SubscriptionSupabaseRepository';
import { GroqProvider } from '../../infrastructure/llm/GroqProvider';
import { EvolutionAPIProvider } from '../../infrastructure/whatsapp/EvolutionAPIProvider';
import { FCMProvider } from '../../infrastructure/notifications/FCMProvider';

// Mapa global @lid → JID real (@s.whatsapp.net), populado via contacts.upsert
const lidMap = new Map<string, string>();

export class WebhookController {
  private get sendMessageUC() {
    return new SendMessageUC(
      new AgentSupabaseRepository(),
      new ConversationSupabaseRepository(),
      new GroqProvider(),
      new EvolutionAPIProvider(),
      new FCMProvider(),
    );
  }

  private get manageSubUC() {
    return new ManageSubscriptionUC(new SubscriptionSupabaseRepository());
  }

  async evolutionWebhook(req: Request, res: Response): Promise<void> {
    res.json({ ok: true }); // responde imediatamente para o Evolution API não retentar

    const { event, instance, data } = req.body;

    // instance name = "sub_{subscriberId}"
    const subscriberId = typeof instance === 'string' && instance.startsWith('sub_')
      ? instance.slice(4)
      : null;

    if (!subscriberId) return;

    // Popula mapa @lid → @s.whatsapp.net a partir de eventos de contato
    if (event === 'contacts.upsert' || event === 'contacts.update') {
      const contacts = Array.isArray(data) ? data : [data];
      for (const c of contacts) {
        if (c.lid && c.id?.endsWith('@s.whatsapp.net')) {
          lidMap.set(c.lid, c.id);
          console.log(`[lidMap] ${c.lid} → ${c.id}`);
        }
        // Formato alternativo: id é o @lid, e há campo phoneNumber ou jid separado
        if (c.id?.endsWith('@lid') && c.jid?.endsWith('@s.whatsapp.net')) {
          lidMap.set(c.id, c.jid);
        }
      }
    }

    if (event === 'messages.upsert') {
      const text = data.message?.conversation
        ?? data.message?.extendedTextMessage?.text
        ?? '';
      if (!text) return;

      // Resolve @lid para o JID real se disponível no mapa
      const rawJid = data.key.remoteJid as string;
      const contactPhone = rawJid.endsWith('@lid')
        ? (lidMap.get(rawJid) ?? rawJid)
        : rawJid;

      if (contactPhone.endsWith('@lid')) {
        // @lid ainda não resolvido — tenta buscar nos contatos do Evolution API
        console.warn(`[webhook] @lid não resolvido: ${contactPhone}. Aguardando contacts.upsert.`);
      }

      await this.sendMessageUC.execute({
        instanceName: instance,
        subscriberId,
        contactPhone,
        contactName: data.pushName,
        text,
      });
    }

    if (event === 'connection.update' && data?.state === 'close') {
      await new FCMProvider().sendPush(subscriberId, 'whatsapp_disconnected', { instanceName: instance });
    }
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
