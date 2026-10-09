-- Plan de suscripción por usuario, sincronizado desde el webhook de Stripe
-- (apps/gateway, service_role) — tabla dedicada, no un campo en
-- user_preferences: el webhook necesita buscar por stripe_customer_id
-- (columna unique, indexada), algo que una tabla jsonb sin índice por ese
-- campo no da gratis.

create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  plan text not null default 'maker' check (plan in ('maker', 'pro')),
  status text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;

create policy "user_subscriptions_read_own" on public.user_subscriptions
  for select using (auth.uid() = user_id);

-- Sin policy de insert/update/delete para anon/authenticated a propósito —
-- solo escribe el webhook de Stripe (service_role del Gateway), mismo
-- criterio que audit_entries (docs/16 P3, ADR-026): la fuente de verdad es
-- Stripe, el usuario nunca escribe su propio plan directo.
