# Frontend Web — Memória de Contexto

## Padrões Detectados no Código

### Página
- `'use client'` em todas as páginas com hooks ou interatividade
- Estrutura: `<Header>` + `<div className="px-4 flex flex-col gap-4 pb-6">`
- Loading state com skeleton: `<Card className="animate-pulse h-16 bg-gray-100" />`
- Empty state com mensagem dentro de `<Card className="text-center py-8">`

### Componentes UI
- `Button` — `variant`: primary/ghost/danger, prop `loading` (spinner automático)
- `Input` — forwardRef, props `label` e `error`, funciona com `{...register('campo')}`
- `Card` — div com `bg-white rounded-2xl shadow-sm border border-gray-100 p-4`
- `Badge` — span com variant green/red/yellow/gray/blue

### Hook
- Todos com `'use client'` no topo
- Estado: `loading`, `error`, dado principal
- Chamadas ao service no `useEffect` ou em funções assíncronas

### Service
- Axios via `api.ts` com interceptors
- Sempre `.then((r) => r.data)` — retorna só o dado, não o response completo
- Sem tratamento de erro nos services — tratado no hook ou na página

## Roteamento

```
/login              → (auth)/login/page.tsx
/register           → (auth)/register/page.tsx
/forgot-password    → (auth)/forgot-password/page.tsx
/                   → (app)/page.tsx  (dashboard)
/agent              → (app)/agent/page.tsx
/conversations      → (app)/conversations/page.tsx
/conversations/:id  → (app)/conversations/[id]/page.tsx
/whatsapp           → (app)/whatsapp/page.tsx
/subscription       → (app)/subscription/page.tsx
```

## Navegação Mobile (BottomNav)

5 itens fixos: Início (`/`), Conversas (`/conversations`), Agente (`/agent`), WhatsApp (`/whatsapp`), Plano (`/subscription`). Ativo detectado por `usePathname() === href`.

## Páginas Faltando (baseado no roadmap)

```
/onboarding         → 3 passos: WhatsApp → Agente → FAQ
/subscription/success → pós-pagamento com ativação visual
```

## Gaps nas Páginas Existentes

| Página | Gap |
|--------|-----|
| `/agent` | FAQ builder CRUD (add/edit/delete por item) |
| `/` (dashboard) | Contador msgs usadas/limite + gráfico de volume |
| `/subscription` | Botão upgrade → link Kiwify, histórico de pagamentos |
| `/whatsapp` | Alerta visual quando desconectado + reconexão manual |

## Cores e Tema

```
#25D366  primary (verde WhatsApp)
#128C7E  primary-dark
#DCF8C6  primary-light (balões do assistente)
gray-50  background
gray-100 borders leves
```

## Autenticação no Frontend

1. `authService.login()` → `localStorage.setItem('access_token')` + `document.cookie`
2. `api.ts` interceptor lê `localStorage.getItem('access_token')` → header `Authorization: Bearer`
3. `middleware.ts` (Edge) lê `request.cookies.get('access_token')` para proteger rotas SSR
4. 401 response → `localStorage.removeItem` + `window.location.href = '/login'`
