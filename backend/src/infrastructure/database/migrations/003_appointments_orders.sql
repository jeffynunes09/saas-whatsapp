-- Agendamentos coletados pelo intent 'schedule'
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  contact_phone text not null,
  contact_name text,
  collected_data jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_subscriber on appointments(subscriber_id);
create index if not exists idx_appointments_status on appointments(subscriber_id, status);

-- Pedidos coletados pelo intent 'order'
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  contact_phone text not null,
  contact_name text,
  collected_data jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_subscriber on orders(subscriber_id);
create index if not exists idx_orders_status on orders(subscriber_id, status);
