# Web Dashboard — Contexto Local

Next.js 15 App Router + Tailwind CSS. Mobile-first PWA. Token JWT no localStorage + cookie (para middleware Edge).

## Estrutura de Pastas

```
app/
  layout.tsx                    # root layout, metadata PWA
  globals.css                   # Tailwind base
  (auth)/                       # rotas públicas — layout centralizado
    login/page.tsx
    register/page.tsx
    forgot-password/page.tsx
  (app)/                        # rotas protegidas — layout com BottomNav + Sidebar
    layout.tsx
    page.tsx                    # dashboard (métricas + últimas conversas)
    agent/page.tsx              # configuração do agente IA
    conversations/
      page.tsx                  # lista de conversas
      [id]/page.tsx             # detalhe + avaliação
    whatsapp/page.tsx           # QR code + status de conexão
    subscription/page.tsx       # plano atual + logout
components/
  ui/
    Button.tsx                  # variant: primary | ghost | danger, prop loading
    Input.tsx                   # forwardRef, label, error
    Card.tsx                    # wrapper com shadow e border
    Badge.tsx                   # variant: green | red | yellow | gray | blue
  layout/
    BottomNav.tsx               # mobile (md:hidden) — 5 itens
    Header.tsx                  # título + subtitle + action slot
    Sidebar.tsx                 # desktop (hidden md:flex) — links + logout
hooks/
  useAuth.ts                    # login/register/logout + loading/error
  useAgent.ts                   # getAgent/save/togglePause
  useConversations.ts           # list/metrics/rate
  useWhatsApp.ts                # status/qrCode com polling 5s
services/
  api.ts                        # axios com interceptors (token + redirect 401)
  authService.ts                # login → localStorage + cookie
  agentService.ts
  conversationService.ts
  whatsappService.ts
middleware.ts                   # Edge: protege rotas via cookie access_token
```

## Padrão de Página (código real — agent/page.tsx)

```tsx
'use client';  // SEMPRE em páginas com hooks

export default function AgentPage() {
  const { agent, loading, save } = useAgent();  // hook de domínio
  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (loading) return <LoadingSkeleton />;  // skeleton com animate-pulse

  return (
    <div>
      <Header title="Agente IA" subtitle="..." />
      <div className="px-4 flex flex-col gap-4 pb-6">
        <Card>...</Card>
        <Button type="submit" loading={saving}>Salvar</Button>
      </div>
    </div>
  );
}
```

## Cores do Tailwind (tema real)

```
primary DEFAULT: #25D366  (verde WhatsApp)
primary-dark:   #128C7E
primary-light:  #DCF8C6
```

## Padrão de Autenticação

- Login: `authService.login()` → salva em `localStorage` + `document.cookie`
- Middleware Edge lê o cookie `access_token`
- `api.ts` lê do `localStorage` para Authorization header
- 401 da API → `localStorage.removeItem` + redirect `/login`

## Comandos Úteis

```bash
cd web
cp .env.local.example .env.local
npm install
npm run dev      # localhost:3000 (ou porta disponível)
npm run build
npm run lint
```

## Gaps Críticos no Frontend (ver agentes especializados)

- `faq-builder.md` — CRUD de FAQ na página do agente (CRÍTICO)
- `onboarding.md` — tela de 3 passos após cadastro (CRÍTICO)
- `subscription.md` — contador de mensagens, botão upgrade, tela pós-pagamento
- `frontend.md` — busca em conversas, gráfico de volume no dashboard
