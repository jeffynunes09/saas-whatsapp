# Backend — Memória de Contexto

## Padrões Detectados no Código

### Controller
- Instancia repositório e UC no construtor da classe
- Método async retorna `Promise<void>`
- Valida com Zod `safeParse` → 400 se inválido
- Try/catch com `console.error('[nomeMétodo]', err)` → 500
- `req` tipado como `AuthRequest` (não `Request`)

### Use Case
- Recebe dependências via construtor (injeção manual, sem framework DI)
- Não acessa `req`/`res` — só dados de negócio
- Orquestra repositórios, LLM e providers na sequência correta

### Rota
- `Router()` do Express, controller instanciado no módulo
- `agentRoutes.use(authMiddleware)` aplica a todas as sub-rotas
- Cast `req as never` por limitação de tipos do Express com AuthRequest

### DTO
- Zod schema exportado, `safeParse` sempre (não `parse`)
- Tipos derivados com `z.infer<typeof schema>`

## Repositórios Existentes

| Interface | Implementação | Tabela Supabase |
|-----------|---------------|-----------------|
| IAgentRepository | AgentSupabaseRepository | agents |
| IConversationRepository | ConversationSupabaseRepository | conversations, messages |
| ISubscriptionRepository | SubscriptionSupabaseRepository | subscribers |

## Use Cases Existentes

| Use Case | O que faz |
|----------|-----------|
| SendMessageUC | Recebe msg WhatsApp → busca/cria conversa → chama LLM → envia resposta → verifica fallback |
| ConfigureAgentUC | Cria ou atualiza agente do assinante |
| ConnectWhatsAppUC | Inicia instância na Evolution API |
| ManageSubscriptionUC | Ativa/desativa assinante via evento Kiwify |

## Endpoints Existentes

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/forgot-password
GET    /api/agent
POST   /api/agent
PATCH  /api/agent/pause
POST   /api/agent/context-file
GET    /api/conversations
GET    /api/conversations/:id
PATCH  /api/conversations/:id/rate
GET    /api/conversations/metrics
GET    /api/whatsapp/qrcode
GET    /api/whatsapp/status
GET    /api/subscription/status
POST   /webhooks/kiwify
POST   /webhooks/evolution
```

## Endpoints Faltando (baseado no roadmap)

```
GET    /api/subscription/usage          # msgs usadas no mês
GET    /api/subscription/payments       # histórico de pagamentos
POST   /api/agent/faq                   # adicionar FAQ item
PATCH  /api/agent/faq/:index            # editar FAQ item
DELETE /api/agent/faq/:index            # remover FAQ item
GET    /api/conversations/search?q=     # busca em conversas
```

## Variáveis de Ambiente

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
KIWIFY_SECRET=          # HMAC — ainda não implementado
RESEND_API_KEY=         # e-mail — ainda não implementado
PORT=3000
```

## Armadilhas

- `supabase` client usa `SERVICE_ROLE_KEY` (bypass RLS) — nunca expor no frontend
- `authMiddleware` cria novo `supabase` client para cada request (performance — considerar singleton)
- Evolution API pode ficar offline; sem retry logic implementado
- `attemptCount` reseta ao criar nova conversa, não ao longo do tempo
