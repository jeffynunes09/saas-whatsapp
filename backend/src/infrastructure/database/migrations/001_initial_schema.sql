-- Subscribers (assinantes da plataforma)
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null default '',
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'business')),
  status text not null default 'inactive' check (status in ('active', 'inactive', 'blocked', 'trial')),
  kiwify_customer_id text,
  kiwify_subscription_id text unique,
  renews_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Agents (configuração do agente de IA por assinante)
create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  name text not null default 'Assistente',
  tone text not null default 'informal' check (tone in ('formal', 'informal')),
  business_info jsonb not null default '{}',
  faq jsonb not null default '[]',
  context_file_url text,
  fallback_after_attempts integer not null default 5,
  is_paused boolean not null default false,
  system_prompt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(subscriber_id)
);

-- WhatsApp Instances
create table if not exists whatsapp_instances (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  instance_name text unique not null,
  phone_number text,
  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'connecting')),
  qr_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  whatsapp_instance_id text not null,
  contact_phone text not null,
  contact_name text,
  status text not null default 'open' check (status in ('open', 'resolved', 'escalated')),
  satisfaction_rating text check (satisfaction_rating in ('positive', 'negative')),
  attempt_count integer not null default 0,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  timestamp timestamptz not null default now()
);

-- FCM tokens para notificações push
create table if not exists fcm_tokens (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  token text not null,
  created_at timestamptz not null default now(),
  unique(subscriber_id, token)
);

-- Índices
create index if not exists idx_conversations_subscriber on conversations(subscriber_id);
create index if not exists idx_conversations_contact on conversations(subscriber_id, contact_phone);
create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_whatsapp_subscriber on whatsapp_instances(subscriber_id);
