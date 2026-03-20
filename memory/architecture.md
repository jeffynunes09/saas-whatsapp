# Arquitetura — Decisões e Fluxos

## Fluxo Principal: Mensagem Recebida no WhatsApp

```
WhatsApp do cliente
    ↓ webhook
Evolution API (Docker)
    ↓ POST /webhooks/evolution
WebhookController
    ↓ extrai instanceName, contactPhone, text
    ↓ resolve subscriberId pela instanceName
SendMessageUC.execute()
    ├── agentRepo.findBySubscriberId() → verifica isPaused
    ├── conversationRepo.findByContactPhone() → busca ou cria conversa
    ├── conversationRepo.addMessage() → salva mensagem do usuário
    ├── llmProvider.generateResponse() → Claude Haiku ou GPT-4o mini
    ├── conversationRepo.addMessage() → salva resposta do bot
    ├── whatsappProvider.sendMessage() → Evolution API → WhatsApp cliente
    └── verifica attemptCount >= fallbackAfterAttempts → escala conversa
```

## Fluxo de Pagamento: Kiwify → Ativação

```
Kiwify
    ↓ POST /webhooks/kiwify  (HMAC não validado ainda — CRÍTICO)
WebhookController
    ↓ tipo do evento: order.approved / order.refunded / subscription.canceled
ManageSubscriptionUC.execute()
    ├── order.approved → subscriber.status = 'active', subscriber.plan = plano
    ├── order.refunded → subscriber.status = 'inactive'
    └── subscription.canceled → subscriber.status = 'blocked'
```

## Fluxo de Auth

```
Frontend
    ↓ POST /api/auth/login { email, password }
AuthController (a implementar) ou Supabase diretamente
    ↓ supabase.auth.signInWithPassword()
    ↓ retorna { session: { access_token } }
Frontend
    ↓ localStorage.setItem('access_token') + document.cookie
    ↓ redirect → /
```

## Modelo de Dados (Supabase)

```
subscribers
  id, email, name, plan, status, renewsAt, createdAt, fcmToken

agents
  id, subscriberId, name, tone, businessInfo (jsonb), faq (jsonb[]),
  contextFileUrl, fallbackAfterAttempts, isPaused

whatsapp_instances
  id, subscriberId, instanceName, status

conversations
  id, subscriberId, whatsappInstanceId, contactPhone, contactName,
  status (open/resolved/escalated), satisfactionRating, attemptCount,
  createdAt, updatedAt

messages
  id, conversationId, role (user/assistant), content, timestamp
```

## Limite de Mensagens por Plano (não implementado)

```
Starter:  1.000 msgs/mês → 1 número WhatsApp
Pro:      5.000 msgs/mês → 2 números WhatsApp
Business: ilimitado      → 5 números WhatsApp
```
Implementação planejada: contador em `subscribers.messageCount` + reset mensal via cron ou edge function Supabase.

## Infra de Produção (alvo)

```
VPS (DigitalOcean/Hostinger)
├── Docker: Evolution API (porta 8080)
├── Docker: Backend Node.js (porta 3000)
├── Nginx: proxy reverso + SSL Let's Encrypt
└── Supabase: managed cloud (gratuito até certos limites)

Frontend: Vercel (deploy automático via Git)
```

## Pontos de Risco Arquitetural

1. **Evolution API instável** — sem retry automático de reconexão (gap crítico)
2. **Webhook Kiwify sem HMAC** — qualquer request pode ativar assinaturas fraudulentamente
3. **LLM sem cache** — FAQ respondido pelo LLM toda vez; cache de respostas frequentes reduz custo
4. **Rate limiting global** — um abusador pode bloquear todos os outros assinantes
5. **Trial sem expiração** — assinantes em trial têm acesso ilimitado indefinidamente
