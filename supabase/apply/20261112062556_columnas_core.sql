-- Columnas reales para perfiles, hábitos, registros, metas, tienda y amistades.
-- Incremental: no borra tablas, no vacía datos y no sustituye a supabase/schema.sql.
-- El cliente sigue escribiendo el jsonb `data`. Estos triggers copian los campos core.
-- Las políticas RLS actuales se mantienen. Las monedas todavía se pueden cambiar
-- desde el cliente; el cierre está en supabase/next/ y no hay que aplicarlo aún.

create schema if not exists private;

create or replace function private.jsonb_int(value jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when value is null or jsonb_typeof(value) = 'null' then null
    when jsonb_typeof(value) = 'number' then trunc(value::text::numeric)::integer
    when jsonb_typeof(value) = 'string' and btrim(value #>> '{}') ~ '^-?[0-9]+$' then btrim(value #>> '{}')::integer
    else null
  end
$$;

create or replace function private.jsonb_num(value jsonb)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select case
    when value is null or jsonb_typeof(value) = 'null' then null
    when jsonb_typeof(value) = 'number' then value::text::numeric
    when jsonb_typeof(value) = 'string' and btrim(value #>> '{}') ~ '^-?[0-9]+(\.[0-9]+)?$' then btrim(value #>> '{}')::numeric
    else null
  end
$$;

revoke all on function private.jsonb_int(jsonb) from public, anon, authenticated;
revoke all on function private.jsonb_num(jsonb) from public, anon, authenticated;

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists display_name text,
  add column if not exists username text,
  add column if not exists level integer not null default 1,
  add column if not exists experience integer not null default 0,
  add column if not exists coins integer not null default 0,
  add column if not exists gems integer not null default 0,
  add column if not exists is_premium boolean not null default false,
  add column if not exists premium_until timestamptz,
  add column if not exists avatar_config jsonb not null default '{}'::jsonb,
  add column if not exists owned_shop_items jsonb not null default '[]'::jsonb;

alter table public.habits
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists frequency text,
  add column if not exists icon text,
  add column if not exists color text,
  add column if not exists is_active boolean,
  add column if not exists current_streak integer,
  add column if not exists best_streak integer,
  add column if not exists total_completions integer,
  add column if not exists last_completed date,
  add column if not exists created_by_email text;

alter table public.habit_logs
  add column if not exists habit_id text,
  add column if not exists completed_date date,
  add column if not exists created_by_email text;

alter table public.goals
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists status text,
  add column if not exists target_value numeric,
  add column if not exists current_value numeric,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists created_by_email text;

alter table public.shop_items
  add column if not exists item_id text,
  add column if not exists name text,
  add column if not exists category text,
  add column if not exists price integer,
  add column if not exists rarity text,
  add column if not exists is_available boolean,
  add column if not exists style_id text;

alter table public.friendships
  add column if not exists user_email text,
  add column if not exists friend_email text,
  add column if not exists status text;

create or replace function private.project_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.full_name := nullif(new.data ->> 'full_name', '');
  new.display_name := coalesce(nullif(new.data ->> 'display_name', ''), new.full_name);
  new.username := nullif(new.data ->> 'username', '');
  new.level := coalesce(private.jsonb_int(new.data -> 'level'), 1);
  new.experience := coalesce(private.jsonb_int(new.data -> 'experience'), 0);
  new.coins := coalesce(private.jsonb_int(new.data -> 'coins'), 0);
  new.gems := coalesce(private.jsonb_int(new.data -> 'gems'), 0);
  new.is_premium := case
    when new.data ->> 'is_premium' in ('true', 't', '1') then true
    when new.data ->> 'is_premium' in ('false', 'f', '0') then false
    else coalesce(new.is_premium, false)
  end;
  new.premium_until := case
    when coalesce(new.data ->> 'premium_until', '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
      then (new.data ->> 'premium_until')::timestamptz
    else null
  end;
  new.avatar_config := case
    when jsonb_typeof(new.data -> 'avatar_config') = 'object' then new.data -> 'avatar_config'
    else '{}'::jsonb
  end;
  new.owned_shop_items := case
    when jsonb_typeof(new.data -> 'owned_shop_items') = 'array' then new.data -> 'owned_shop_items'
    else '[]'::jsonb
  end;
  return new;
end;
$$;

create or replace function private.project_habit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.name := nullif(new.data ->> 'name', '');
  new.description := new.data ->> 'description';
  new.frequency := nullif(new.data ->> 'frequency', '');
  new.icon := nullif(new.data ->> 'icon', '');
  new.color := nullif(new.data ->> 'color', '');
  new.is_active := case
    when new.data ->> 'is_active' in ('true', 't', '1') then true
    when new.data ->> 'is_active' in ('false', 'f', '0') then false
    else null
  end;
  new.current_streak := private.jsonb_int(new.data -> 'current_streak');
  new.best_streak := private.jsonb_int(new.data -> 'best_streak');
  new.total_completions := private.jsonb_int(new.data -> 'total_completions');
  new.last_completed := case
    when coalesce(new.data ->> 'last_completed', '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
      then (new.data ->> 'last_completed')::date
    else null
  end;
  new.created_by_email := coalesce(nullif(new.data ->> 'created_by', ''), nullif(new.data ->> 'user_email', ''));
  return new;
end;
$$;

create or replace function private.project_habit_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.habit_id := nullif(new.data ->> 'habit_id', '');
  new.completed_date := case
    when coalesce(new.data ->> 'completed_date', '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
      then (new.data ->> 'completed_date')::date
    else null
  end;
  new.created_by_email := coalesce(nullif(new.data ->> 'created_by', ''), nullif(new.data ->> 'user_email', ''));
  return new;
end;
$$;

create or replace function private.project_goal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.title := nullif(new.data ->> 'title', '');
  new.description := new.data ->> 'description';
  new.status := nullif(new.data ->> 'status', '');
  new.target_value := private.jsonb_num(new.data -> 'target_value');
  new.current_value := coalesce(private.jsonb_num(new.data -> 'current_value'), private.jsonb_num(new.data -> 'current_progress'));
  new.start_date := case
    when coalesce(new.data ->> 'start_date', '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' then (new.data ->> 'start_date')::date
    else null
  end;
  new.end_date := case
    when coalesce(new.data ->> 'end_date', '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' then (new.data ->> 'end_date')::date
    else null
  end;
  new.created_by_email := coalesce(nullif(new.data ->> 'created_by', ''), nullif(new.data ->> 'user_email', ''));
  return new;
end;
$$;

create or replace function private.project_shop_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.item_id := nullif(new.data ->> 'item_id', '');
  new.name := nullif(new.data ->> 'name', '');
  new.category := nullif(new.data ->> 'category', '');
  new.price := private.jsonb_int(new.data -> 'price');
  new.rarity := nullif(new.data ->> 'rarity', '');
  new.is_available := case
    when new.data ->> 'is_available' in ('true', 't', '1') then true
    when new.data ->> 'is_available' in ('false', 'f', '0') then false
    else null
  end;
  new.style_id := nullif(new.data ->> 'style_id', '');
  return new;
end;
$$;

create or replace function private.project_friendship()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.user_email := coalesce(nullif(new.data ->> 'user_email', ''), nullif(new.data ->> 'from_user_email', ''));
  new.friend_email := coalesce(nullif(new.data ->> 'friend_email', ''), nullif(new.data ->> 'to_user_email', ''));
  new.status := coalesce(nullif(new.data ->> 'status', ''), 'accepted');
  return new;
end;
$$;

revoke all on function private.project_profile() from public, anon, authenticated;
revoke all on function private.project_habit() from public, anon, authenticated;
revoke all on function private.project_habit_log() from public, anon, authenticated;
revoke all on function private.project_goal() from public, anon, authenticated;
revoke all on function private.project_shop_item() from public, anon, authenticated;
revoke all on function private.project_friendship() from public, anon, authenticated;

drop trigger if exists profiles_project on public.profiles;
create trigger profiles_project
  before insert or update on public.profiles
  for each row execute function private.project_profile();

drop trigger if exists habits_project on public.habits;
create trigger habits_project
  before insert or update on public.habits
  for each row execute function private.project_habit();

drop trigger if exists habit_logs_project on public.habit_logs;
create trigger habit_logs_project
  before insert or update on public.habit_logs
  for each row execute function private.project_habit_log();

drop trigger if exists goals_project on public.goals;
create trigger goals_project
  before insert or update on public.goals
  for each row execute function private.project_goal();

drop trigger if exists shop_items_project on public.shop_items;
create trigger shop_items_project
  before insert or update on public.shop_items
  for each row execute function private.project_shop_item();

drop trigger if exists friendships_project on public.friendships;
create trigger friendships_project
  before insert or update on public.friendships
  for each row execute function private.project_friendship();

update public.profiles set data = data;
update public.habits set data = data;
update public.habit_logs set data = data;
update public.goals set data = data;
update public.shop_items set data = data;
update public.friendships set data = data;

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists habits_owner_active_idx on public.habits (owner_id, is_active);
create index if not exists habits_email_idx on public.habits (created_by_email);
create index if not exists habit_logs_habit_date_idx on public.habit_logs (habit_id, completed_date);
create index if not exists goals_owner_status_idx on public.goals (owner_id, status);
create index if not exists shop_items_item_id_idx on public.shop_items (item_id);
create index if not exists friendships_emails_idx on public.friendships (user_email, friend_email);

create or replace function private.is_friend_email(other_email text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return other_email is not null and exists (
    select 1 from public.friendships f
    where coalesce(f.status, f.data ->> 'status', 'accepted') = 'accepted'
      and (
        (
          coalesce(f.user_email, f.data ->> 'user_email') = (select auth.jwt() ->> 'email')
          and coalesce(f.friend_email, f.data ->> 'friend_email') = other_email
        )
        or (
          coalesce(f.friend_email, f.data ->> 'friend_email') = (select auth.jwt() ->> 'email')
          and coalesce(f.user_email, f.data ->> 'user_email') = other_email
        )
      )
  );
end;
$$;

revoke all on function private.is_friend_email(text) from public, anon;
grant execute on function private.is_friend_email(text) to authenticated;

create table if not exists public.coin_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  delta integer not null,
  reason text not null,
  balance_after integer not null,
  created_at timestamptz not null default now(),
  constraint coin_ledger_reason_len check (char_length(reason) between 1 and 160)
);
alter table public.coin_ledger enable row level security;
grant select on public.coin_ledger to authenticated;
drop policy if exists coin_ledger_read on public.coin_ledger;
create policy coin_ledger_read on public.coin_ledger
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

create or replace function private.spend_coins(p_amount integer, p_reason text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  bal integer;
  nxt integer;
begin
  if auth.uid() is null then
    raise exception 'Necesitas entrar';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 100000 then
    raise exception 'Cantidad no valida';
  end if;
  if p_reason is null or char_length(p_reason) < 1 or char_length(p_reason) > 160 then
    raise exception 'Falta el motivo';
  end if;
  select coalesce(coins, 0) into bal
  from public.profiles
  where id = auth.uid()
  for update;
  if not found then
    raise exception 'No hay perfil';
  end if;
  if bal < p_amount then
    raise exception 'Fondos insuficientes';
  end if;
  nxt := bal - p_amount;
  update public.profiles
  set data = jsonb_set(coalesce(data, '{}'::jsonb), '{coins}', to_jsonb(nxt), true)
  where id = auth.uid();
  insert into public.coin_ledger (user_id, delta, reason, balance_after)
  values (auth.uid(), -p_amount, p_reason, nxt);
  return nxt;
end;
$$;

create or replace function private.grant_coins(p_user uuid, p_amount integer, p_reason text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  nxt integer;
begin
  if p_user is null or p_amount is null or p_amount <= 0 or p_amount > 100000 then
    raise exception 'Cantidad no valida';
  end if;
  if p_reason is null or char_length(p_reason) < 1 then
    raise exception 'Falta el motivo';
  end if;
  update public.profiles
  set data = jsonb_set(
    coalesce(data, '{}'::jsonb),
    '{coins}',
    to_jsonb(coalesce(coins, 0) + p_amount),
    true
  )
  where id = p_user
  returning coins into nxt;
  if nxt is null then
    raise exception 'No hay perfil';
  end if;
  insert into public.coin_ledger (user_id, delta, reason, balance_after)
  values (p_user, p_amount, p_reason, nxt);
  return nxt;
end;
$$;

revoke all on function private.spend_coins(integer, text) from public, anon, authenticated;
revoke all on function private.grant_coins(uuid, integer, text) from public, anon, authenticated;
grant execute on function private.spend_coins(integer, text) to authenticated;

-- Catálogo Neo Pixel Cozy. Inserta o actualiza. No borra filas viejas:
-- las que ya no tienen arte se marcan no disponibles más abajo.
insert into public.shop_items (id, data) values
  ('shop_hair_brown_bun', $npc${"id": "shop_hair_brown_bun", "item_id": "hair_brown_bun", "name": "Moño castaño", "description": "Pieza inicial. Se consigue sin gastar monedas.", "category": "hair", "style_id": "hair_brown_bun", "price": 0, "gem_price": 0, "rarity": "common", "icon": "🎀", "color": "#693CA1", "is_available": true, "is_new": true, "sort_order": 0, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_hair_white', $npc${"id": "shop_hair_white", "item_id": "hair_white", "name": "Trenzas canosas", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "hair", "style_id": "hair_white", "price": 70, "gem_price": 0, "rarity": "rare", "icon": "🤍", "color": "#693CA1", "is_available": true, "is_new": true, "sort_order": 1, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_hair_dark', $npc${"id": "shop_hair_dark", "item_id": "hair_dark", "name": "Pelo oscuro corto", "description": "Pieza inicial. Se consigue sin gastar monedas.", "category": "hair", "style_id": "hair_dark", "price": 0, "gem_price": 0, "rarity": "common", "icon": "🖤", "color": "#693CA1", "is_available": true, "is_new": true, "sort_order": 2, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_hair_blonde', $npc${"id": "shop_hair_blonde", "item_id": "hair_blonde", "name": "Rubio corto", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "hair", "style_id": "hair_blonde", "price": 40, "gem_price": 0, "rarity": "common", "icon": "💛", "color": "#693CA1", "is_available": true, "is_new": true, "sort_order": 3, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_hair_teal', $npc${"id": "shop_hair_teal", "item_id": "hair_teal", "name": "Flequillo menta", "description": "Pieza inicial. Se consigue sin gastar monedas.", "category": "hair", "style_id": "hair_teal", "price": 0, "gem_price": 0, "rarity": "common", "icon": "💚", "color": "#693CA1", "is_available": true, "is_new": true, "sort_order": 4, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_hair_pink', $npc${"id": "shop_hair_pink", "item_id": "hair_pink", "name": "Coletas rosas", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "hair", "style_id": "hair_pink", "price": 80, "gem_price": 0, "rarity": "rare", "icon": "💗", "color": "#693CA1", "is_available": true, "is_new": true, "sort_order": 5, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_hair_brasa', $npc${"id": "shop_hair_brasa", "item_id": "hair_brasa", "name": "Mechones de brasa", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "hair", "style_id": "hair_brasa", "price": 110, "gem_price": 0, "rarity": "epic", "icon": "🔥", "color": "#693CA1", "is_available": true, "is_new": true, "sort_order": 6, "unlock_requirement": {"type": "level", "value": 2}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_hair_bicolor', $npc${"id": "shop_hair_bicolor", "item_id": "hair_bicolor", "name": "Corto bicolor", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "hair", "style_id": "hair_bicolor", "price": 90, "gem_price": 0, "rarity": "rare", "icon": "🎧", "color": "#693CA1", "is_available": true, "is_new": true, "sort_order": 7, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_top_hoodie_green', $npc${"id": "shop_top_hoodie_green", "item_id": "top_hoodie_green", "name": "Sudadera huerto", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "shirt", "style_id": "top_hoodie_green", "price": 80, "gem_price": 0, "rarity": "common", "icon": "🌿", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 8, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_top_hoodie_purple', $npc${"id": "shop_top_hoodie_purple", "item_id": "top_hoodie_purple", "name": "Sudadera violeta", "description": "Pieza inicial. Se consigue sin gastar monedas.", "category": "shirt", "style_id": "top_hoodie_purple", "price": 0, "gem_price": 0, "rarity": "common", "icon": "💜", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 9, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_top_hoodie_blue', $npc${"id": "shop_top_hoodie_blue", "item_id": "top_hoodie_blue", "name": "Sudadera azul", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "shirt", "style_id": "top_hoodie_blue", "price": 80, "gem_price": 0, "rarity": "common", "icon": "👕", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 10, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_top_cream', $npc${"id": "shop_top_cream", "item_id": "top_cream", "name": "Suéter crema", "description": "Pieza inicial. Se consigue sin gastar monedas.", "category": "shirt", "style_id": "top_cream", "price": 0, "gem_price": 0, "rarity": "common", "icon": "🤍", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 11, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_top_fire', $npc${"id": "shop_top_fire", "item_id": "top_fire", "name": "Chaqueta burdeos", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "shirt", "style_id": "top_fire", "price": 130, "gem_price": 0, "rarity": "epic", "icon": "🔥", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 12, "unlock_requirement": {"type": "level", "value": 2}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_top_mint', $npc${"id": "shop_top_mint", "item_id": "top_mint", "name": "Chaqueta menta", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "shirt", "style_id": "top_mint", "price": 90, "gem_price": 0, "rarity": "rare", "icon": "🧥", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 13, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_top_overalls', $npc${"id": "shop_top_overalls", "item_id": "top_overalls", "name": "Peto de huerto", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "shirt", "style_id": "top_overalls", "price": 70, "gem_price": 0, "rarity": "common", "icon": "🪴", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 14, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_top_coat', $npc${"id": "shop_top_coat", "item_id": "top_coat", "name": "Abrigo de bruja", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "shirt", "style_id": "top_coat", "price": 120, "gem_price": 0, "rarity": "epic", "icon": "🧙", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 15, "unlock_requirement": {"type": "level", "value": 2}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_top_raincoat', $npc${"id": "shop_top_raincoat", "item_id": "top_raincoat", "name": "Chubasquero", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "shirt", "style_id": "top_raincoat", "price": 90, "gem_price": 0, "rarity": "rare", "icon": "👽", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 16, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_shorts_green', $npc${"id": "shop_shorts_green", "item_id": "shorts_green", "name": "Shorts de huerto", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "pants", "style_id": "shorts_green", "price": 50, "gem_price": 0, "rarity": "common", "icon": "🩳", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 17, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_shorts_rose', $npc${"id": "shop_shorts_rose", "item_id": "shorts_rose", "name": "Shorts rosados", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "pants", "style_id": "shorts_rose", "price": 50, "gem_price": 0, "rarity": "common", "icon": "🩳", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 18, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_jeans', $npc${"id": "shop_jeans", "item_id": "jeans", "name": "Vaqueros", "description": "Pieza inicial. Se consigue sin gastar monedas.", "category": "pants", "style_id": "jeans", "price": 0, "gem_price": 0, "rarity": "common", "icon": "👖", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 19, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_pants_cargo', $npc${"id": "shop_pants_cargo", "item_id": "pants_cargo", "name": "Cargo", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "pants", "style_id": "pants_cargo", "price": 70, "gem_price": 0, "rarity": "common", "icon": "👖", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 20, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_skirt_purple', $npc${"id": "shop_skirt_purple", "item_id": "skirt_purple", "name": "Falda violeta", "description": "Pieza inicial. Se consigue sin gastar monedas.", "category": "pants", "style_id": "skirt_purple", "price": 0, "gem_price": 0, "rarity": "common", "icon": "💜", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 21, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_skirt_gold', $npc${"id": "shop_skirt_gold", "item_id": "skirt_gold", "name": "Falda dorada", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "pants", "style_id": "skirt_gold", "price": 90, "gem_price": 0, "rarity": "rare", "icon": "✨", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 22, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_shoes_brown', $npc${"id": "shop_shoes_brown", "item_id": "shoes_brown", "name": "Botas de campo", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "shoes", "style_id": "shoes_brown", "price": 60, "gem_price": 0, "rarity": "common", "icon": "🥾", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 23, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_shoes_purple', $npc${"id": "shop_shoes_purple", "item_id": "shoes_purple", "name": "Botas violetas", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "shoes", "style_id": "shoes_purple", "price": 70, "gem_price": 0, "rarity": "rare", "icon": "🥾", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 24, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_shoes_red', $npc${"id": "shop_shoes_red", "item_id": "shoes_red", "name": "Zapatillas rojas", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "shoes", "style_id": "shoes_red", "price": 50, "gem_price": 0, "rarity": "common", "icon": "👟", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 25, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_shoes_mint', $npc${"id": "shop_shoes_mint", "item_id": "shoes_mint", "name": "Zapatillas menta", "description": "Pieza inicial. Se consigue sin gastar monedas.", "category": "shoes", "style_id": "shoes_mint", "price": 0, "gem_price": 0, "rarity": "common", "icon": "👟", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 26, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_shoes_white', $npc${"id": "shop_shoes_white", "item_id": "shoes_white", "name": "Zapatillas crema", "description": "Pieza inicial. Se consigue sin gastar monedas.", "category": "shoes", "style_id": "shoes_white", "price": 0, "gem_price": 0, "rarity": "common", "icon": "👟", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 27, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_horns_curl', $npc${"id": "shop_horns_curl", "item_id": "horns_curl", "name": "Cuernos asimétricos", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "horns", "style_id": "horns_curl", "price": 100, "gem_price": 0, "rarity": "epic", "icon": "🌙", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 28, "unlock_requirement": {"type": "level", "value": 2}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_antenna_lila', $npc${"id": "shop_antenna_lila", "item_id": "antenna_lila", "name": "Antenas", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "horns", "style_id": "antenna_lila", "price": 60, "gem_price": 0, "rarity": "rare", "icon": "📡", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 29, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_hat_witch', $npc${"id": "shop_hat_witch", "item_id": "hat_witch", "name": "Sombrero de estrella", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "hat", "style_id": "hat_witch", "price": 100, "gem_price": 0, "rarity": "epic", "icon": "🧙", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 30, "unlock_requirement": {"type": "level", "value": 2}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_hat_moon', $npc${"id": "shop_hat_moon", "item_id": "hat_moon", "name": "Boina luna", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "hat", "style_id": "hat_moon", "price": 60, "gem_price": 0, "rarity": "rare", "icon": "🌙", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 31, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_hat_flower', $npc${"id": "shop_hat_flower", "item_id": "hat_flower", "name": "Sombrero floral", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "hat", "style_id": "hat_flower", "price": 90, "gem_price": 0, "rarity": "rare", "icon": "🌸", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 32, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_hat_headphones', $npc${"id": "shop_hat_headphones", "item_id": "hat_headphones", "name": "Auriculares", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "hat", "style_id": "hat_headphones", "price": 80, "gem_price": 0, "rarity": "rare", "icon": "🎧", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 33, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_glasses_round', $npc${"id": "shop_glasses_round", "item_id": "glasses_round", "name": "Gafas redondas", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "glasses", "style_id": "glasses_round", "price": 50, "gem_price": 0, "rarity": "common", "icon": "👓", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 34, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_cape_moon', $npc${"id": "shop_cape_moon", "item_id": "cape_moon", "name": "Capa violeta", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "backpack", "style_id": "cape_moon", "price": 120, "gem_price": 0, "rarity": "rare", "icon": "🌙", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 35, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_bag_moon', $npc${"id": "shop_bag_moon", "item_id": "bag_moon", "name": "Mochila luna", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "backpack", "style_id": "bag_moon", "price": 80, "gem_price": 0, "rarity": "common", "icon": "🎒", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 36, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_bag_botanical', $npc${"id": "shop_bag_botanical", "item_id": "bag_botanical", "name": "Bolso botánico", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "backpack", "style_id": "bag_botanical", "price": 90, "gem_price": 0, "rarity": "rare", "icon": "🪴", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 37, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_prop_book', $npc${"id": "shop_prop_book", "item_id": "prop_book", "name": "Libreta", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "hand", "style_id": "prop_book", "price": 70, "gem_price": 0, "rarity": "rare", "icon": "📖", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 38, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_prop_watering', $npc${"id": "shop_prop_watering", "item_id": "prop_watering", "name": "Regadera", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "hand", "style_id": "prop_watering", "price": 60, "gem_price": 0, "rarity": "common", "icon": "💧", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 39, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_prop_bottle', $npc${"id": "shop_prop_bottle", "item_id": "prop_bottle", "name": "Botella de agua", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "hand", "style_id": "prop_bottle", "price": 40, "gem_price": 0, "rarity": "common", "icon": "🍼", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 40, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_pet_michi', $npc${"id": "shop_pet_michi", "item_id": "pet_michi", "name": "Michi", "description": "Pieza inicial. Se consigue sin gastar monedas.", "category": "pet", "style_id": "pet_michi", "price": 0, "gem_price": 0, "rarity": "common", "icon": "🐱", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 41, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_pet_miga', $npc${"id": "shop_pet_miga", "item_id": "pet_miga", "name": "Miga", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "pet", "style_id": "pet_miga", "price": 80, "gem_price": 0, "rarity": "rare", "icon": "🦫", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 42, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_pet_tinta', $npc${"id": "shop_pet_tinta", "item_id": "pet_tinta", "name": "Tinta", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "pet", "style_id": "pet_tinta", "price": 90, "gem_price": 0, "rarity": "rare", "icon": "🐦", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 43, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_pet_glu', $npc${"id": "shop_pet_glu", "item_id": "pet_glu", "name": "Glu", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "pet", "style_id": "pet_glu", "price": 70, "gem_price": 0, "rarity": "rare", "icon": "🫧", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 44, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_pet_chispa', $npc${"id": "shop_pet_chispa", "item_id": "pet_chispa", "name": "Chispa", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "pet", "style_id": "pet_chispa", "price": 0, "gem_price": 0, "rarity": "legendary", "icon": "🦎", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 45, "unlock_requirement": {"type": "streak", "value": 7}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_pet_bip', $npc${"id": "shop_pet_bip", "item_id": "pet_bip", "name": "Bip", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "pet", "style_id": "pet_bip", "price": 140, "gem_price": 0, "rarity": "epic", "icon": "🤖", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 46, "unlock_requirement": {"type": "level", "value": 2}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_sparkles', $npc${"id": "shop_sparkles", "item_id": "sparkles", "name": "Chispas", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "effect", "style_id": "sparkles", "price": 40, "gem_price": 0, "rarity": "rare", "icon": "✨", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 47, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_hearts', $npc${"id": "shop_hearts", "item_id": "hearts", "name": "Corazones", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "effect", "style_id": "hearts", "price": 40, "gem_price": 0, "rarity": "rare", "icon": "💗", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 48, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb),
  ('shop_ring', $npc${"id": "shop_ring", "item_id": "ring", "name": "Anillo", "description": "Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.", "category": "effect", "style_id": "ring", "price": 30, "gem_price": 0, "rarity": "rare", "icon": "⭕", "color": "#693CA1", "is_available": true, "is_new": false, "sort_order": 49, "unlock_requirement": {"type": "none"}, "created_date": "2026-11-12T00:00:00.000Z"}$npc$::jsonb)
on conflict (id) do update set data = excluded.data;

update public.shop_items
set data = jsonb_set(coalesce(data, '{}'::jsonb), '{is_available}', 'false'::jsonb, true)
where coalesce(data->>'item_id', '') <> ''
  and data->>'item_id' not in ('hair_brown_bun', 'hair_white', 'hair_dark', 'hair_blonde', 'hair_teal', 'hair_pink', 'hair_brasa', 'hair_bicolor', 'top_hoodie_green', 'top_hoodie_purple', 'top_hoodie_blue', 'top_cream', 'top_fire', 'top_mint', 'top_overalls', 'top_coat', 'top_raincoat', 'shorts_green', 'shorts_rose', 'jeans', 'pants_cargo', 'skirt_purple', 'skirt_gold', 'shoes_brown', 'shoes_purple', 'shoes_red', 'shoes_mint', 'shoes_white', 'horns_curl', 'antenna_lila', 'hat_witch', 'hat_moon', 'hat_flower', 'hat_headphones', 'glasses_round', 'cape_moon', 'bag_moon', 'bag_botanical', 'prop_book', 'prop_watering', 'prop_bottle', 'pet_michi', 'pet_miga', 'pet_tinta', 'pet_glu', 'pet_chispa', 'pet_bip', 'sparkles', 'hearts', 'ring');

insert into public.shop_packs (id, data) values
  ('pack_huerto', $npc${"pack_id": "huerto", "name": "Pack huerto", "description": "Peto, shorts y botas. Precio fijo, sin azar.", "price": 180, "discount_price": 120, "discountPrice": 120, "item_ids": ["top_overalls", "shorts_green", "shoes_brown"], "is_available": true, "sort_order": 1, "icon": "🌿"}$npc$::jsonb)
on conflict (id) do update set data = excluded.data;

