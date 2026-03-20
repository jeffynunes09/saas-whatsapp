import { Request, Response } from 'express';
import crypto from 'crypto';
import { SendMessageUC } from '../../application/use-cases/SendMessageUC';
import { ManageSubscriptionUC } from '../../application/use-cases/ManageSubscriptionUC';
import { AgentSupabaseRepository } from '../../infrastructure/database/supabase/AgentSupabaseRepository';
import { ConversationSupabaseRepository } from '../../infrastructure/database/supabase/ConversationSupabaseRepository';
import { SubscriptionSupabaseRepository } from '../../infrastructure/database/supabase/SubscriptionSupabaseRepository';
import { GroqProvider } from '../../infrastructure/llm/GroqProvider';
import { EvolutionAPIProvider } from '../../infrastructure/whatsapp/EvolutionAPIProvider';
import { FCMProvider } from '../../infrastructure/notifications/FCMProvider';
import { QRCodeStore } from '../../infrastructure/cache/QRCodeStore';

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
    // Valida que a requisição vem do Evolution API (apikey no header)
    const apiKey = process.env.EVOLUTION_API_KEY;
    if (apiKey && req.headers['apikey'] !== apiKey) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.json({ ok: true }); // responde imediatamente para o Evolution API não retentar

    const { event, instance, data } = req.body;
    console.log(`[webhook] event="${event}" instance="${instance}" data=${JSON.stringify(data).slice(0, 200)}`);

    // instance name = "sub_{subscriberId}"
    const subscriberId = typeof instance === 'string' && instance.startsWith('sub_')
      ? instance.slice(4)
      : null;

    if (!subscriberId) return;

    const eventLower = typeof event === 'string' ? event.toLowerCase() : '';

    if (eventLower === 'qrcode.updated' || eventLower === 'qrcode_updated') {
      const qrCode = data?.qrcode?.base64 ?? data?.base64 ?? '';
      console.log(`[webhook] qrcode event para ${instance}, base64 length: ${qrCode.length}`);
      if (qrCode) {
        QRCodeStore.set(instance, qrCode);
        console.log(`[webhook] QR code armazenado para ${instance}`);
      }
      return;
    }

    if (eventLower === 'connection.update' && data?.state === 'open') {
      QRCodeStore.clear(instance);
    }

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
        console.warn(`[webhook] @lid não resolvido: ${contactPhone}. Mensagem ignorada.`);
        return
      }

      try {
        await this.sendMessageUC.execute({
          instanceName: instance,
          subscriberId,
          contactPhone,
          contactName: data.pushName,
          text,
        });
      } catch (err) {
        console.error('[webhook] sendMessageUC error:', err);
      }
    }

    if (event === 'connection.update' && data?.state === 'close') {
      try {
        await new FCMProvider().sendPush(subscriberId, 'whatsapp_disconnected', { instanceName: instance });
      } catch (err) {
        console.error('[webhook] FCM push error:', err);
      }
    }
  }

  private validateKiwifyHMAC(rawBody: Buffer, signature: string | undefined): boolean {
    const secret = process.env.KIWIFY_SECRET;
    if (!secret) {
      console.warn('[kiwify] KIWIFY_SECRET não configurado — validação HMAC desativada');
      return true;
    }
    if (!signature) return false;

    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  async kiwifyWebhook(req: Request, res: Response): Promise<void> {
    // req.body é Buffer (express.raw aplicado em server.ts antes do express.json)
    const rawBody = req.body as Buffer;
    const signature = req.headers['x-kiwify-signature'] as string | undefined;

    if (!this.validateKiwifyHMAC(rawBody, signature)) {
      console.warn('[kiwify] Assinatura HMAC inválida — request rejeitado');
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: { event: string; subscription: any };
    try {
      parsed = JSON.parse(rawBody.toString('utf8'));
    } catch {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }

    const { event, subscription } = parsed;

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
