-- Rol de administrador (panel de solo lectura en /admin, apps/web) — tabla
-- dedicada en vez de una columna en `profiles`: `profiles_update_own` (migración
-- 0001) deja que cada usuario edite su propia fila, así que un flag ahí sería
-- auto-otorgable. Acá no hay ninguna policy de insert/update/delete para
-- anon/authenticated a propósito (mismo criterio que `user_subscriptions`,
-- migración 0019) — el único alta es un INSERT manual desde el SQL Editor de
-- Supabase:
--
--   insert into public.admin_users (user_id) values ('<uuid-del-usuario>');

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Único fin: que un usuario pueda leer si SU PROPIA fila existe, para gatear
-- /admin (proxy.ts) sin pasar por el Gateway. No expone nada de otros
-- usuarios — la lectura cross-usuario para el panel en sí vive en
-- apps/gateway (service_role, ver adminRoutes.ts).
create policy "admin_users_read_own" on public.admin_users
  for select using (auth.uid() = user_id);
