# Tasks Ativas

## Em andamento
(vazio)

## Pendentes — Crítico (Bloqueia lançamento)

- [ ] **HMAC Kiwify** — validar assinatura do webhook antes de processar eventos de pagamento
- [ ] **Rate limit por assinante** — além do global, limitar por subscriberId no middleware
- [ ] **Limites de mensagens por plano** — Starter 1k, Pro 5k, Business ilimitado; contador no backend
- [ ] **FAQ Builder frontend** — CRUD completo (add/edit/delete) na `web/app/(app)/agent/page.tsx`
- [ ] **Reconexão automática WhatsApp** — polling de status + tentativas automáticas de reconexão
- [ ] **Onboarding guiado** — 3 passos: conectar WhatsApp → configurar agente → criar FAQ
- [ ] **Trial logic** — expiração 7 dias, limite 50 msgs, banner com contador regressivo
- [ ] **HTTPS/SSL** — Let's Encrypt na VPS de produção
- [ ] **Política de privacidade + termos** — obrigatório LGPD antes de aceitar pagamentos

## Pendentes — Alto (Pré-lançamento)

- [ ] **E-mail transacional** — Resend: boas-vindas, confirmação pagamento, alerta desconexão, alerta limite
- [ ] **Botão upgrade** — links Kiwify por plano + tela de sucesso pós-pagamento
- [ ] **Contador de uso** — mensagens consumidas/limite visível no dashboard
- [ ] **Histórico de pagamentos** — tela listando transações Kiwify
- [ ] **Logs estruturados** — Sentry ou Logtail para erros e webhooks

## Pendentes — Médio (Pós-MVP)

- [ ] **Busca em conversas** — por palavra-chave do contato ou conteúdo
- [ ] **Gráfico de volume** — mensagens por dia no dashboard
- [ ] **UptimeRobot** — monitoramento 24/7

## Concluídas

- [x] Estrutura do projeto (monorepo backend + web)
- [x] Auth JWT Supabase (login, register, middleware)
- [x] CRUD do agente IA (configuração, tone, FAQ estrutural, upload contexto)
- [x] Envio e recebimento de mensagens WhatsApp via Evolution API
- [x] Dashboard básico com métricas
- [x] Lista e detalhe de conversas com avaliação
- [x] Página WhatsApp com QR code e polling
- [x] Página de subscription (visual)
- [x] Web mobile-first com BottomNav + Sidebar desktop
- [x] Middleware de proteção de rotas (Edge, via cookie)
- [x] Repositório Git público: github.com/jeffynunes09/saas-whatsapp
