# ZapBot — Memória Global do Projeto

## Propósito

SaaS de atendimento automático via WhatsApp com IA. Pequenos negócios configuram um bot em minutos. Planos R$97/197/397/mês via Kiwify.

## Stack Completa

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 App Router + React 18 + Tailwind CSS |
| Backend | Node.js + Express + TypeScript (Clean Architecture) |
| Banco | Supabase (PostgreSQL + Auth + Storage) |
| WhatsApp | Evolution API (self-hosted, Docker) |
| IA | Claude Haiku 4.5 ou GPT-4o mini (intercambiável via ILLMProvider) |
| Pagamentos | Kiwify (webhook) |
| E-mail | Resend (não implementado ainda) |
| Infra | VPS DigitalOcean/Hostinger + Docker Compose |

## Estado Atual

**Pronto:** Auth JWT/Supabase, CRUD do agente, envio/recebimento de mensagens, conversas, upload de contexto (backend), QR code WhatsApp, dashboard básico, web mobile-first.

**Faltando (crítico para lançar):**
- [ ] HMAC validação webhook Kiwify
- [ ] Rate limit por assinante (além do global)
- [ ] Limites de mensagens por plano no backend
- [ ] FAQ builder CRUD no frontend
- [ ] Reconexão automática WhatsApp
- [ ] Onboarding guiado 3 passos
- [ ] E-mail transacional (Resend)
- [ ] Botão upgrade → Kiwify + tela pós-pagamento
- [ ] Trial com expiração (7d) e limite (50 msgs)
- [ ] Contador de uso de mensagens no dashboard
- [ ] SSL/HTTPS na VPS
- [ ] Política de privacidade + termos (LGPD)

**Faltando (alto, pós-lançamento imediato):**
- [ ] Logs estruturados (Sentry ou Logtail)
- [ ] UptimeRobot configurado
- [ ] Busca em conversas por palavra-chave
- [ ] Gráfico de volume de mensagens por dia
- [ ] Histórico de pagamentos

## Arquivos-Chave

| Arquivo | Responsabilidade |
|---------|-----------------|
| `backend/src/server.ts` | Entry point — registra todas as rotas |
| `backend/src/application/use-cases/SendMessageUC.ts` | Lógica principal de resposta do bot |
| `backend/src/presentation/controllers/AgentController.ts` | CRUD do agente (exemplo de padrão) |
| `backend/src/presentation/middlewares/authMiddleware.ts` | JWT → subscriberId |
| `backend/src/presentation/controllers/WebhookController.ts` | Recebe eventos Kiwify e Evolution |
| `web/app/(app)/page.tsx` | Dashboard principal |
| `web/app/(app)/agent/page.tsx` | Página de configuração do agente |
| `web/middleware.ts` | Proteção de rotas via cookie |
| `web/services/api.ts` | Axios com interceptors |
| `docker-compose.yml` | Evolution API + backend |

## Decisões Técnicas Tomadas

1. **Clean Architecture no backend** — use cases são o centro, não os controllers
2. **ILLMProvider como interface** — permite trocar OpenAI ↔ Claude sem mudar use cases
3. **Supabase Auth** — JWT gerenciado pelo Supabase, authMiddleware só valida
4. **Cookie + localStorage para token** — localStorage para API calls, cookie para middleware Edge Next.js
5. **Evolution API self-hosted** — mais barato que Meta Cloud API oficial; risco de instabilidade
6. **Kiwify para pagamentos** — sem implementar Stripe; webhooks são a única integração de billing
7. **Mobile-first web em vez de React Native** — menor custo de distribuição e build
