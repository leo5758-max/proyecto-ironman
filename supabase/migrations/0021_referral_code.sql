-- Código de referido por usuario (sistema de referidos) — 8 hex chars
-- (`gen_random_bytes`, ya en uso vía `gen_random_uuid()` en migraciones
-- anteriores). 16^8 combinaciones alcanza de sobra para el volumen de
-- usuarios esperado; sin retry ante colisión (extremadamente improbable) por
-- simplicidad, mismo criterio "no sobre-diseñar" del resto del proyecto.

alter table public.profiles add column if not exists referral_code text unique;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, referral_code) values (new.id, upper(encode(gen_random_bytes(4), 'hex')));
  return new;
end;
$$;

-- Backfill de perfiles creados antes de esta migración.
update public.profiles
set referral_code = upper(encode(gen_random_bytes(4), 'hex'))
where referral_code is null;
