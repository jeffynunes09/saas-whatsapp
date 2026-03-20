# ZapBot SaaS — Contexto Global

Plataforma SaaS de atendimento automático via WhatsApp com IA. Assinantes configuram um bot que responde clientes no WhatsApp usando GPT-4o mini ou Claude Haiku. Vendido por assinatura via Kiwify (R$97/197/397). Status atual: ~61% pronto para lançamento.

## Apps e Serviços

| Diretório | Stack | Responsabilidade |
|-----------|-------|-----------------|
| `backend/` | Node.js + Express + TypeScript | API REST, webhooks Kiwify/Evolution, lógica de negócio |
| `web/` | Next.js 15 + Tailwind CSS | Dashboard do assinante (mobile-first PWA) |
| `docker-compose.yml` | Docker | Evolution API (WhatsApp) self-hosted |

## Arquitetura Global

Backend segue Clean Architecture em 4 camadas:
1. **Presentation** — Controllers, Routes, DTOs Zod, Middlewares
2. **Application** — Use Cases (orquestram tudo), Ports (interfaces DIP)
3. **Domain** — Entities (Agent, Conversation, Subscriber, WhatsAppInstance)
4. **Infrastructure** — Supabase, OpenAI/Claude, EvolutionAPI, FCM

## Regras Globais

- **Use Cases orquestram tudo** — controllers só recebem/respondem HTTP
- **Repositórios sempre via interface** (IAgentRepository, não AgentSupabaseRepository diretamente)
- **Validação na borda** com Zod (DTOs no backend, zodResolver no frontend)
- **`AuthRequest`** estende `Request` com `subscriberId?: string` — sempre usar após authMiddleware
- Token JWT via Supabase Auth — authMiddleware verifica e injeta subscriberId
- Sem testes automatizados ainda — todo código novo deve ser testável manualmente primeiro

## Variáveis de Ambiente Necessárias

```
# backend/.env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
KIWIFY_SECRET=           # para validação HMAC — ainda não implementado
RESEND_API_KEY=          # e-mail transacional — ainda não implementado
PORT=3000

# web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Estado do Projeto (Março 2026)

**Implementado:** Backend API (80%), Banco Supabase (85%), Auth (75%), WhatsApp básico (70%), Agente IA (65%), Web dashboard (60%)

**Faltando para lançar:** FAQ builder, reconexão automática WhatsApp, onboarding guiado, limites por plano, HMAC Kiwify, e-mail transacional, upgrade button, SSL/HTTPS, política de privacidade

## Referências

- `.claude/agents/` — definições de agentes especializados por feature
- `memory/` — contexto detalhado por camada
- `memory/active-tasks.md` — tasks em andamento
