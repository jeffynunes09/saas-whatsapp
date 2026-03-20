# Backend — Contexto Local

Node.js + Express + TypeScript. Clean Architecture em 4 camadas. Porta padrão 3000.

## Estrutura de Pastas

```
src/
  server.ts                          # entry point — registra rotas e middlewares
  presentation/
    controllers/                     # recebem req/res, delegam ao UC ou repo
    routes/                          # Router do Express, aplica authMiddleware
    middlewares/
      authMiddleware.ts              # verifica JWT Supabase → injeta subscriberId
      rateLimitMiddleware.ts         # global 100req/15min, webhook 300req/min
      errorMiddleware.ts
    dtos/                            # schemas Zod para validação de entrada
  application/
    use-cases/                       # lógica de negócio, orquestram tudo
    ports/                           # interfaces (IAgentRepository, ILLMProvider…)
  domain/
    entities/                        # Agent, Conversation, Subscriber, WhatsAppInstance
  infrastructure/
    database/supabase/               # implementações concretas dos repositórios
    llm/                             # OpenAIProvider, ClaudeProvider
    whatsapp/                        # EvolutionAPIProvider
    notifications/                   # FCMProvider
```

## Padrão de Controller (código real)

```typescript
// instancia UC no construtor, nunca acessa infra diretamente
export class AgentController {
  private agentRepo = new AgentSupabaseRepository();
  private configureAgentUC = new ConfigureAgentUC(this.agentRepo);

  async configureAgent(req: AuthRequest, res: Response): Promise<void> {
    const parsed = configureAgentDto.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }
    try {
      const agent = await this.configureAgentUC.execute({
        ...parsed.data,
        subscriberId: req.subscriberId!,
      });
      res.json(agent);
    } catch (err) {
      console.error('[configureAgent] Error:', err);
      res.status(500).json({ error: 'Erro ao salvar configurações do agente' });
    }
  }
}
```

## Padrão de Rota (código real)

```typescript
export const agentRoutes = Router();
const controller = new AgentController();

agentRoutes.use(authMiddleware);  // aplica para todas as rotas do router
agentRoutes.get('/', (req, res) => controller.getAgent(req as never, res));
agentRoutes.post('/', (req, res) => controller.configureAgent(req as never, res));
```

## AuthMiddleware — Como Funciona

1. Extrai Bearer token do header
2. Valida com `supabase.auth.getUser(token)`
3. Busca subscriber por email: `subscriptionRepo.findByEmail(data.user.email)`
4. Verifica status `active` ou `trial`
5. Injeta `req.subscriberId = subscriber.id`

## Rate Limiting Atual (INSUFICIENTE — precisa de limite por assinante)

```typescript
// global — todos os IPs compartilham
export const rateLimitMiddleware = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
// webhook — 300req/min global
export const webhookRateLimit = rateLimit({ windowMs: 60 * 1000, max: 300 });
// FALTA: rate limit por subscriberId (ver agente subscription.md)
```

## Supabase Client

```typescript
// usa SERVICE_ROLE_KEY — nunca expor no frontend
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

## Comandos Úteis

```bash
cd backend
npm run dev          # ts-node-dev --respawn src/server.ts
npm run build        # tsc
npm start            # node dist/server.js
```

## Gaps Críticos no Backend (ver agentes especializados)

- `security.md` — HMAC Kiwify, rate limit por assinante
- `subscription.md` — limites por plano, expiração de trial
- `whatsapp.md` — reconexão automática
- `email.md` — e-mail transacional com Resend
- `faq-builder.md` — endpoints CRUD de FAQ
