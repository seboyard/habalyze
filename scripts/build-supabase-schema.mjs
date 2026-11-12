import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync(new URL('../src/avatar/neoPixelManifest.json', import.meta.url), 'utf8'));

const tables = [
  ['achievements', 'catalog'],
  ['activity_comments', 'social'],
  ['activity_reactions', 'social'],
  ['badges', 'catalog'],
  ['beta_testers', 'owner'],
  ['blog_posts', 'public_catalog'],
  ['brand_assets', 'owner'],
  ['challenges', 'social'],
  ['challenge_participants', 'social'],
  ['chat_messages', 'social'],
  ['friend_activities', 'social'],
  ['friend_requests', 'pair'],
  ['friendships', 'pair'],
  ['gifts', 'pair'],
  ['goals', 'owner'],
  ['guilds', 'social'],
  ['guild_members', 'social'],
  ['guild_posts', 'social'],
  ['guild_post_comments', 'social'],
  ['habits', 'friends'],
  ['habit_logs', 'owner'],
  ['invitations', 'owner'],
  ['loot_boxes', 'catalog'],
  ['missions', 'catalog'],
  ['notifications', 'inbox'],
  ['perks', 'catalog'],
  ['profile_comments', 'social'],
  ['projects', 'project'],
  ['project_collaborators', 'pair'],
  ['project_tasks', 'project_child'],
  ['project_week_statuses', 'owner'],
  ['shop_items', 'catalog'],
  ['shop_packs', 'catalog'],
  ['stat_views', 'owner'],
  ['templates', 'catalog'],
  ['user_achievements', 'owner'],
  ['user_badges', 'owner'],
  ['user_missions', 'owner'],
  ['user_perks', 'owner'],
  ['user_preferences', 'owner'],
  ['weekly_rankings', 'social'],
];

const sqlJson = (value) => `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;

function policies(name, kind) {
  const own = `owner_id = (select auth.uid())`;
  const admin = `(select private.is_admin())`;
  const email = `(select auth.jwt() ->> 'email')`;
  const pair = `(
    ${own}
    or data->>'user_email' = ${email}
    or data->>'friend_email' = ${email}
    or data->>'from_user_email' = ${email}
    or data->>'to_user_email' = ${email}
    or data->>'sender_email' = ${email}
    or data->>'receiver_email' = ${email}
    or ${admin}
  )`;
  const lines = [];
  if (kind === 'catalog' || kind === 'public_catalog') {
    lines.push(`grant select on public.${name} to anon, authenticated;`);
    lines.push(`grant insert, update, delete on public.${name} to authenticated;`);
    lines.push(`create policy ${name}_read on public.${name} for select to anon, authenticated using (true);`);
    lines.push(`create policy ${name}_insert on public.${name} for insert to authenticated with check (${admin});`);
    lines.push(`create policy ${name}_update on public.${name} for update to authenticated using (${admin}) with check (${admin});`);
    lines.push(`create policy ${name}_delete on public.${name} for delete to authenticated using (${admin});`);
    return lines.join('\n');
  }
  lines.push(`grant select, insert, update, delete on public.${name} to authenticated;`);
  if (kind === 'social') {
    lines.push(`create policy ${name}_read on public.${name} for select to authenticated using (true);`);
    lines.push(`create policy ${name}_insert on public.${name} for insert to authenticated with check (${own} or ${admin});`);
    lines.push(`create policy ${name}_update on public.${name} for update to authenticated using (${own} or ${admin}) with check (${own} or ${admin});`);
    lines.push(`create policy ${name}_delete on public.${name} for delete to authenticated using (${own} or ${admin});`);
    return lines.join('\n');
  }
  if (kind === 'pair' || kind === 'inbox') {
    const read = kind === 'inbox'
      ? `(${own} or data->>'user_email' = ${email} or ${admin})`
      : pair;
    lines.push(`create policy ${name}_read on public.${name} for select to authenticated using ${read};`);
    lines.push(`create policy ${name}_insert on public.${name} for insert to authenticated with check (${own} or ${admin});`);
    lines.push(`create policy ${name}_update on public.${name} for update to authenticated using ${read} with check ${read};`);
    lines.push(`create policy ${name}_delete on public.${name} for delete to authenticated using (${own} or ${admin});`);
    return lines.join('\n');
  }
  if (kind === 'friends') {
    lines.push(`create policy ${name}_read on public.${name} for select to authenticated using (${own} or ${admin} or (select private.is_friend_email(data->>'created_by')));`);
    lines.push(`create policy ${name}_insert on public.${name} for insert to authenticated with check (${own} or ${admin});`);
    lines.push(`create policy ${name}_update on public.${name} for update to authenticated using (${own} or ${admin}) with check (${own} or ${admin});`);
    lines.push(`create policy ${name}_delete on public.${name} for delete to authenticated using (${own} or ${admin});`);
    return lines.join('\n');
  }
  if (kind === 'project') {
    const extra = `id in (select c.data->>'project_id' from public.project_collaborators c where c.data->>'user_email' = ${email})`;
    lines.push(`create policy ${name}_read on public.${name} for select to authenticated using (${own} or ${admin} or ${extra});`);
    lines.push(`create policy ${name}_insert on public.${name} for insert to authenticated with check (${own} or ${admin});`);
    lines.push(`create policy ${name}_update on public.${name} for update to authenticated using (${own} or ${admin}) with check (${own} or ${admin});`);
    lines.push(`create policy ${name}_delete on public.${name} for delete to authenticated using (${own} or ${admin});`);
    return lines.join('\n');
  }
  if (kind === 'project_child') {
    const extra = `(select private.can_read_project(data->>'project_id'))`;
    lines.push(`create policy ${name}_read on public.${name} for select to authenticated using (${own} or ${admin} or ${extra});`);
    lines.push(`create policy ${name}_insert on public.${name} for insert to authenticated with check ((${own} or ${admin}) and (${admin} or ${extra} or ${own}));`);
    lines.push(`create policy ${name}_update on public.${name} for update to authenticated using (${own} or ${admin}) with check (${own} or ${admin});`);
    lines.push(`create policy ${name}_delete on public.${name} for delete to authenticated using (${own} or ${admin});`);
    return lines.join('\n');
  }
  lines.push(`create policy ${name}_read on public.${name} for select to authenticated using (${own} or ${admin});`);
  lines.push(`create policy ${name}_insert on public.${name} for insert to authenticated with check (${own} or ${admin});`);
  lines.push(`create policy ${name}_update on public.${name} for update to authenticated using (${own} or ${admin}) with check (${own} or ${admin});`);
  lines.push(`create policy ${name}_delete on public.${name} for delete to authenticated using (${own} or ${admin});`);
  return lines.join('\n');
}

function tableSql(name) {
  return `
create table if not exists public.${name} (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ${name}_owner_idx on public.${name} (owner_id);
create index if not exists ${name}_created_by_idx on public.${name} ((data->>'created_by'));
create index if not exists ${name}_user_email_idx on public.${name} ((data->>'user_email'));
alter table public.${name} enable row level security;
drop trigger if exists ${name}_touch on public.${name};
create trigger ${name}_touch
  before insert or update on public.${name}
  for each row execute function private.touch_entity();
`;
}

const shopItems = [...(manifest.items || []), ...(manifest.auras || [])]
  .filter((item) => item.shopCategory)
  .map((item, index) => ({
    id: `shop_${item.id}`,
    item_id: item.id,
    name: item.name,
    description: item.free ? 'Pieza inicial.' : 'Cosmético con precio fijo en monedas de hábitos.',
    category: item.shopCategory,
    style_id: item.id,
    price: item.price || 0,
    gem_price: 0,
    rarity: item.rarity || 'common',
    icon: item.icon || '✨',
    is_available: true,
    is_new: index < 8,
    sort_order: index,
    unlock_requirement: item.unlock?.type && item.unlock.type !== 'none' ? item.unlock : { type: 'none' },
    created_date: new Date().toISOString(),
  }));

const catalogRows = [
  ['shop_items', shopItems.map((item) => [item.id, item])],
  ['loot_boxes', [[
    'box_constancia',
    {
      box_id: 'constancia',
      name: 'Cofre de constancia',
      description: 'Entrega la siguiente pieza de la colección, siempre en el mismo orden. No es una caja aleatoria.',
      price: 0,
      gem_price: 0,
      is_available: true,
      possible_rarities: ['common', 'rare', 'epic', 'legendary', 'exclusive'],
      item_count: 1,
      guaranteed_legendary: false,
      sort_order: 1,
      icon: '🎁',
    },
  ]]],
  ['shop_packs', [[
    'pack_huerto',
    {
      pack_id: 'huerto',
      name: 'Pack huerto',
      description: 'Sudadera, shorts y botas. Precio fijo, sin azar.',
      price: 190,
      discount_price: 120,
      discountPrice: 120,
      item_ids: ['top_hoodie_green', 'shorts_green', 'shoes_brown'],
      is_available: true,
      sort_order: 1,
      icon: '🌿',
    },
  ]]],
  ['badges', [
    ['badge_atleta', { badge_id: 'atleta', name: 'Atleta', icon: '🏃', levels: [{ level: 1, requirement_value: 1 }, { level: 2, requirement_value: 5 }] }],
    ['badge_lector', { badge_id: 'lector', name: 'Lector', icon: '📚', levels: [{ level: 1, requirement_value: 1 }, { level: 2, requirement_value: 5 }] }],
  ]],
  ['achievements', [[
    'ach_agua',
    { achievement_id: 'agua_7', name: 'Manantial', description: 'Siete días seguidos bebiendo agua.', icon: '💧', xp_reward: 50 },
  ]]],
  ['missions', [[
    'mission_hoy',
    { title: 'Cierra dos hábitos hoy', description: 'Marca dos hábitos antes de la noche.', type: 'daily', xp_reward: 40, coin_reward: 20, target: 2, is_active: true },
  ]]],
  ['blog_posts', [[
    'post_bienvenida',
    {
      slug: 'bienvenida-neo-pixel',
      title: 'Neo Pixel Cozy ya vive en el vestidor',
      excerpt: 'Un estilo pixel, cálido y modular para el avatar de Habalyze.',
      content: 'Los cosméticos se desbloquean con constancia. Esta entrada es pública.',
      is_published: true,
      published_date: new Date().toISOString().slice(0, 10),
      author: 'Habalyze',
    },
  ]]],
  ['templates', [[
    'tpl_manana',
    { name: 'Mañana tranquila', description: 'Agua, una página y la cama hecha.', type: 'habit', is_public: true, icon: 'sunrise', use_count: 0, payload: { name: 'Hacer la cama', icon: 'smile', color: 'yellow', frequency: 'daily' } },
  ]]],
];

let seed = '\n-- Catálogo. Lo inserta postgres, que no pasa por RLS.\n';
for (const [table, rows] of catalogRows) {
  const values = rows.map(([id, data]) => `  ('${id}', ${sqlJson(data)})`).join(',\n');
  seed += `insert into public.${table} (id, data) values\n${values}\non conflict (id) do nothing;\n\n`;
}

const sql = `-- Habalyze. Ejecuta este archivo entero en el SQL Editor del proyecto ya creado.
-- No contiene claves. Las funciones privilegiadas están en el esquema private,
-- fuera de la API. La autorización no lee user_metadata.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.touch_entity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' and new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  return new;
end;
$$;
revoke all on function private.touch_entity() from public, anon, authenticated;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin'))
);
alter table public.user_roles enable row level security;
grant select on public.user_roles to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists profiles_email_idx on public.profiles (email);
alter table public.profiles enable row level security;
grant select, update on public.profiles to authenticated;

${tables.map(([name]) => tableSql(name)).join('\n')}

create table if not exists public.coach_conversations (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid not null references auth.users (id) on delete cascade,
  agent_name text not null default 'habit_coach',
  metadata jsonb not null default '{}'::jsonb,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.coach_conversations enable row level security;
grant select, insert, update, delete on public.coach_conversations to authenticated;
create index if not exists coach_conversations_owner_idx on public.coach_conversations (owner_id);
drop trigger if exists coach_conversations_touch on public.coach_conversations;
create trigger coach_conversations_touch
  before insert or update on public.coach_conversations
  for each row execute function private.touch_entity();

create or replace function private.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = 'admin'
  );
end;
$$;

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
    where coalesce(f.data->>'status', 'accepted') = 'accepted'
      and (
        (f.data->>'user_email' = (select auth.jwt() ->> 'email') and f.data->>'friend_email' = other_email)
        or (f.data->>'friend_email' = (select auth.jwt() ->> 'email') and f.data->>'user_email' = other_email)
      )
  );
end;
$$;

create or replace function private.can_read_project(project_id text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return project_id is not null and (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from public.project_collaborators c
      where c.data->>'project_id' = project_id
        and coalesce(c.data->>'status', 'accepted') in ('accepted', 'pending')
        and (
          c.owner_id = (select auth.uid())
          or c.data->>'user_email' = (select auth.jwt() ->> 'email')
        )
    )
  );
end;
$$;

revoke all on function private.is_admin() from public, anon;
revoke all on function private.is_friend_email(text) from public, anon;
revoke all on function private.can_read_project(text) from public, anon;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_friend_email(text) to authenticated;
grant execute on function private.can_read_project(text) to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, data)
  values (
    new.id,
    new.email,
    jsonb_build_object(
      'email', new.email,
      'full_name', coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'persona'), '@', 1)),
      'display_name', coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'persona'), '@', 1)),
      'username', split_part(coalesce(new.email, 'persona'), '@', 1),
      'level', 1,
      'experience', 0,
      'coins', 80,
      'gems', 0,
      'is_premium', false,
      'owned_items', '[]'::jsonb,
      'owned_shop_items', '[]'::jsonb,
      'wishlist', '[]'::jsonb,
      'avatar_config', jsonb_build_object('engine', 'neo', 'preset', 'lumo'),
      'created_date', now()
    )
  );
  insert into public.user_roles (user_id, role) values (new.id, 'user')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace function private.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email,
      data = jsonb_set(coalesce(data, '{}'::jsonb), '{email}', to_jsonb(new.email), true)
  where id = new.id;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.sync_profile_email() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop trigger if exists on_auth_user_email on auth.users;
create trigger on_auth_user_email
  after update of email on auth.users
  for each row execute function private.sync_profile_email();

create policy user_roles_select on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy profiles_read on public.profiles
  for select to authenticated
  using (true);
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (
    (select private.is_admin())
    or (
      id = (select auth.uid())
      and email is not distinct from (select auth.jwt() ->> 'email')
    )
  );

${tables.map(([name, kind]) => policies(name, kind)).join('\n\n')}

create policy coach_conversations_all on public.coach_conversations
  for all to authenticated
  using (owner_id = (select auth.uid()) or (select private.is_admin()))
  with check (owner_id = (select auth.uid()) or (select private.is_admin()));

${seed}

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

drop policy if exists uploads_public_read on storage.objects;
create policy uploads_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'uploads');

drop policy if exists uploads_insert_own on storage.objects;
create policy uploads_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists uploads_update_own on storage.objects;
create policy uploads_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists uploads_delete_own on storage.objects;
create policy uploads_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

do $$
begin
  alter publication supabase_realtime add table public.coach_conversations;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- Admin de una cuenta ya creada. No uses user_metadata.
-- insert into public.user_roles (user_id, role)
-- values ('UUID-DEL-USUARIO', 'admin')
-- on conflict (user_id) do update set role = 'admin';
`;

const migration = fs.readdirSync(new URL('../supabase/migrations/', import.meta.url))
  .find((file) => file.endsWith('_habalyze_schema.sql'));
if (!migration) throw new Error('Falta la migración de supabase migration new');
fs.writeFileSync(new URL(`../supabase/migrations/${migration}`, import.meta.url), sql);
fs.writeFileSync(new URL('../supabase/schema.sql', import.meta.url), sql);
console.log(migration, sql.length);
