-- Registro de quién invitó a quién (sistema de referidos) — tabla dedicada
-- en vez de una columna en `profiles`: necesita `reward_status` propio
-- (pending/granted/failed, otorgado por ReferralRewardService en
-- apps/gateway) y permite contar "cuántos amigos invitó" con un COUNT simple.
-- `referred_id` es unique — un usuario solo puede haber sido referido una vez.

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users (id) on delete cascade,
  referred_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  reward_status text not null default 'pending' check (reward_status in ('pending', 'granted', 'failed'))
);

alter table public.referrals enable row level security;

-- El referrer puede ver sus propios referidos (para mostrar "cuántos amigos
-- invitaste" en /configuracion) — sin policy para el lado `referred_id`, no
-- hace falta que alguien vea quién lo invitó a él. Sin policies de
-- insert/update/delete para anon/authenticated a propósito (mismo criterio
-- que `user_subscriptions`/`admin_users`) — solo escribe el Gateway
-- (service_role) desde el webhook de Supabase Auth.
create policy "referrals_read_own_as_referrer" on public.referrals
  for select using (auth.uid() = referrer_id);
