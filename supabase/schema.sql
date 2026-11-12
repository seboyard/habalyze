-- Habalyze. Ejecuta este archivo entero en el SQL Editor del proyecto ya creado.
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


create table if not exists public.achievements (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists achievements_owner_idx on public.achievements (owner_id);
create index if not exists achievements_created_by_idx on public.achievements ((data->>'created_by'));
create index if not exists achievements_user_email_idx on public.achievements ((data->>'user_email'));
alter table public.achievements enable row level security;
drop trigger if exists achievements_touch on public.achievements;
create trigger achievements_touch
  before insert or update on public.achievements
  for each row execute function private.touch_entity();


create table if not exists public.activity_comments (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists activity_comments_owner_idx on public.activity_comments (owner_id);
create index if not exists activity_comments_created_by_idx on public.activity_comments ((data->>'created_by'));
create index if not exists activity_comments_user_email_idx on public.activity_comments ((data->>'user_email'));
alter table public.activity_comments enable row level security;
drop trigger if exists activity_comments_touch on public.activity_comments;
create trigger activity_comments_touch
  before insert or update on public.activity_comments
  for each row execute function private.touch_entity();


create table if not exists public.activity_reactions (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists activity_reactions_owner_idx on public.activity_reactions (owner_id);
create index if not exists activity_reactions_created_by_idx on public.activity_reactions ((data->>'created_by'));
create index if not exists activity_reactions_user_email_idx on public.activity_reactions ((data->>'user_email'));
alter table public.activity_reactions enable row level security;
drop trigger if exists activity_reactions_touch on public.activity_reactions;
create trigger activity_reactions_touch
  before insert or update on public.activity_reactions
  for each row execute function private.touch_entity();


create table if not exists public.badges (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists badges_owner_idx on public.badges (owner_id);
create index if not exists badges_created_by_idx on public.badges ((data->>'created_by'));
create index if not exists badges_user_email_idx on public.badges ((data->>'user_email'));
alter table public.badges enable row level security;
drop trigger if exists badges_touch on public.badges;
create trigger badges_touch
  before insert or update on public.badges
  for each row execute function private.touch_entity();


create table if not exists public.beta_testers (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists beta_testers_owner_idx on public.beta_testers (owner_id);
create index if not exists beta_testers_created_by_idx on public.beta_testers ((data->>'created_by'));
create index if not exists beta_testers_user_email_idx on public.beta_testers ((data->>'user_email'));
alter table public.beta_testers enable row level security;
drop trigger if exists beta_testers_touch on public.beta_testers;
create trigger beta_testers_touch
  before insert or update on public.beta_testers
  for each row execute function private.touch_entity();


create table if not exists public.blog_posts (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blog_posts_owner_idx on public.blog_posts (owner_id);
create index if not exists blog_posts_created_by_idx on public.blog_posts ((data->>'created_by'));
create index if not exists blog_posts_user_email_idx on public.blog_posts ((data->>'user_email'));
alter table public.blog_posts enable row level security;
drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch
  before insert or update on public.blog_posts
  for each row execute function private.touch_entity();


create table if not exists public.brand_assets (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists brand_assets_owner_idx on public.brand_assets (owner_id);
create index if not exists brand_assets_created_by_idx on public.brand_assets ((data->>'created_by'));
create index if not exists brand_assets_user_email_idx on public.brand_assets ((data->>'user_email'));
alter table public.brand_assets enable row level security;
drop trigger if exists brand_assets_touch on public.brand_assets;
create trigger brand_assets_touch
  before insert or update on public.brand_assets
  for each row execute function private.touch_entity();


create table if not exists public.challenges (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists challenges_owner_idx on public.challenges (owner_id);
create index if not exists challenges_created_by_idx on public.challenges ((data->>'created_by'));
create index if not exists challenges_user_email_idx on public.challenges ((data->>'user_email'));
alter table public.challenges enable row level security;
drop trigger if exists challenges_touch on public.challenges;
create trigger challenges_touch
  before insert or update on public.challenges
  for each row execute function private.touch_entity();


create table if not exists public.challenge_participants (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists challenge_participants_owner_idx on public.challenge_participants (owner_id);
create index if not exists challenge_participants_created_by_idx on public.challenge_participants ((data->>'created_by'));
create index if not exists challenge_participants_user_email_idx on public.challenge_participants ((data->>'user_email'));
alter table public.challenge_participants enable row level security;
drop trigger if exists challenge_participants_touch on public.challenge_participants;
create trigger challenge_participants_touch
  before insert or update on public.challenge_participants
  for each row execute function private.touch_entity();


create table if not exists public.chat_messages (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists chat_messages_owner_idx on public.chat_messages (owner_id);
create index if not exists chat_messages_created_by_idx on public.chat_messages ((data->>'created_by'));
create index if not exists chat_messages_user_email_idx on public.chat_messages ((data->>'user_email'));
alter table public.chat_messages enable row level security;
drop trigger if exists chat_messages_touch on public.chat_messages;
create trigger chat_messages_touch
  before insert or update on public.chat_messages
  for each row execute function private.touch_entity();


create table if not exists public.friend_activities (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists friend_activities_owner_idx on public.friend_activities (owner_id);
create index if not exists friend_activities_created_by_idx on public.friend_activities ((data->>'created_by'));
create index if not exists friend_activities_user_email_idx on public.friend_activities ((data->>'user_email'));
alter table public.friend_activities enable row level security;
drop trigger if exists friend_activities_touch on public.friend_activities;
create trigger friend_activities_touch
  before insert or update on public.friend_activities
  for each row execute function private.touch_entity();


create table if not exists public.friend_requests (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists friend_requests_owner_idx on public.friend_requests (owner_id);
create index if not exists friend_requests_created_by_idx on public.friend_requests ((data->>'created_by'));
create index if not exists friend_requests_user_email_idx on public.friend_requests ((data->>'user_email'));
alter table public.friend_requests enable row level security;
drop trigger if exists friend_requests_touch on public.friend_requests;
create trigger friend_requests_touch
  before insert or update on public.friend_requests
  for each row execute function private.touch_entity();


create table if not exists public.friendships (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists friendships_owner_idx on public.friendships (owner_id);
create index if not exists friendships_created_by_idx on public.friendships ((data->>'created_by'));
create index if not exists friendships_user_email_idx on public.friendships ((data->>'user_email'));
alter table public.friendships enable row level security;
drop trigger if exists friendships_touch on public.friendships;
create trigger friendships_touch
  before insert or update on public.friendships
  for each row execute function private.touch_entity();


create table if not exists public.gifts (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists gifts_owner_idx on public.gifts (owner_id);
create index if not exists gifts_created_by_idx on public.gifts ((data->>'created_by'));
create index if not exists gifts_user_email_idx on public.gifts ((data->>'user_email'));
alter table public.gifts enable row level security;
drop trigger if exists gifts_touch on public.gifts;
create trigger gifts_touch
  before insert or update on public.gifts
  for each row execute function private.touch_entity();


create table if not exists public.goals (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists goals_owner_idx on public.goals (owner_id);
create index if not exists goals_created_by_idx on public.goals ((data->>'created_by'));
create index if not exists goals_user_email_idx on public.goals ((data->>'user_email'));
alter table public.goals enable row level security;
drop trigger if exists goals_touch on public.goals;
create trigger goals_touch
  before insert or update on public.goals
  for each row execute function private.touch_entity();


create table if not exists public.guilds (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists guilds_owner_idx on public.guilds (owner_id);
create index if not exists guilds_created_by_idx on public.guilds ((data->>'created_by'));
create index if not exists guilds_user_email_idx on public.guilds ((data->>'user_email'));
alter table public.guilds enable row level security;
drop trigger if exists guilds_touch on public.guilds;
create trigger guilds_touch
  before insert or update on public.guilds
  for each row execute function private.touch_entity();


create table if not exists public.guild_members (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists guild_members_owner_idx on public.guild_members (owner_id);
create index if not exists guild_members_created_by_idx on public.guild_members ((data->>'created_by'));
create index if not exists guild_members_user_email_idx on public.guild_members ((data->>'user_email'));
alter table public.guild_members enable row level security;
drop trigger if exists guild_members_touch on public.guild_members;
create trigger guild_members_touch
  before insert or update on public.guild_members
  for each row execute function private.touch_entity();


create table if not exists public.guild_posts (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists guild_posts_owner_idx on public.guild_posts (owner_id);
create index if not exists guild_posts_created_by_idx on public.guild_posts ((data->>'created_by'));
create index if not exists guild_posts_user_email_idx on public.guild_posts ((data->>'user_email'));
alter table public.guild_posts enable row level security;
drop trigger if exists guild_posts_touch on public.guild_posts;
create trigger guild_posts_touch
  before insert or update on public.guild_posts
  for each row execute function private.touch_entity();


create table if not exists public.guild_post_comments (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists guild_post_comments_owner_idx on public.guild_post_comments (owner_id);
create index if not exists guild_post_comments_created_by_idx on public.guild_post_comments ((data->>'created_by'));
create index if not exists guild_post_comments_user_email_idx on public.guild_post_comments ((data->>'user_email'));
alter table public.guild_post_comments enable row level security;
drop trigger if exists guild_post_comments_touch on public.guild_post_comments;
create trigger guild_post_comments_touch
  before insert or update on public.guild_post_comments
  for each row execute function private.touch_entity();


create table if not exists public.habits (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists habits_owner_idx on public.habits (owner_id);
create index if not exists habits_created_by_idx on public.habits ((data->>'created_by'));
create index if not exists habits_user_email_idx on public.habits ((data->>'user_email'));
alter table public.habits enable row level security;
drop trigger if exists habits_touch on public.habits;
create trigger habits_touch
  before insert or update on public.habits
  for each row execute function private.touch_entity();


create table if not exists public.habit_logs (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists habit_logs_owner_idx on public.habit_logs (owner_id);
create index if not exists habit_logs_created_by_idx on public.habit_logs ((data->>'created_by'));
create index if not exists habit_logs_user_email_idx on public.habit_logs ((data->>'user_email'));
alter table public.habit_logs enable row level security;
drop trigger if exists habit_logs_touch on public.habit_logs;
create trigger habit_logs_touch
  before insert or update on public.habit_logs
  for each row execute function private.touch_entity();


create table if not exists public.invitations (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invitations_owner_idx on public.invitations (owner_id);
create index if not exists invitations_created_by_idx on public.invitations ((data->>'created_by'));
create index if not exists invitations_user_email_idx on public.invitations ((data->>'user_email'));
alter table public.invitations enable row level security;
drop trigger if exists invitations_touch on public.invitations;
create trigger invitations_touch
  before insert or update on public.invitations
  for each row execute function private.touch_entity();


create table if not exists public.loot_boxes (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists loot_boxes_owner_idx on public.loot_boxes (owner_id);
create index if not exists loot_boxes_created_by_idx on public.loot_boxes ((data->>'created_by'));
create index if not exists loot_boxes_user_email_idx on public.loot_boxes ((data->>'user_email'));
alter table public.loot_boxes enable row level security;
drop trigger if exists loot_boxes_touch on public.loot_boxes;
create trigger loot_boxes_touch
  before insert or update on public.loot_boxes
  for each row execute function private.touch_entity();


create table if not exists public.missions (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists missions_owner_idx on public.missions (owner_id);
create index if not exists missions_created_by_idx on public.missions ((data->>'created_by'));
create index if not exists missions_user_email_idx on public.missions ((data->>'user_email'));
alter table public.missions enable row level security;
drop trigger if exists missions_touch on public.missions;
create trigger missions_touch
  before insert or update on public.missions
  for each row execute function private.touch_entity();


create table if not exists public.notifications (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notifications_owner_idx on public.notifications (owner_id);
create index if not exists notifications_created_by_idx on public.notifications ((data->>'created_by'));
create index if not exists notifications_user_email_idx on public.notifications ((data->>'user_email'));
alter table public.notifications enable row level security;
drop trigger if exists notifications_touch on public.notifications;
create trigger notifications_touch
  before insert or update on public.notifications
  for each row execute function private.touch_entity();


create table if not exists public.perks (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists perks_owner_idx on public.perks (owner_id);
create index if not exists perks_created_by_idx on public.perks ((data->>'created_by'));
create index if not exists perks_user_email_idx on public.perks ((data->>'user_email'));
alter table public.perks enable row level security;
drop trigger if exists perks_touch on public.perks;
create trigger perks_touch
  before insert or update on public.perks
  for each row execute function private.touch_entity();


create table if not exists public.profile_comments (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profile_comments_owner_idx on public.profile_comments (owner_id);
create index if not exists profile_comments_created_by_idx on public.profile_comments ((data->>'created_by'));
create index if not exists profile_comments_user_email_idx on public.profile_comments ((data->>'user_email'));
alter table public.profile_comments enable row level security;
drop trigger if exists profile_comments_touch on public.profile_comments;
create trigger profile_comments_touch
  before insert or update on public.profile_comments
  for each row execute function private.touch_entity();


create table if not exists public.projects (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_owner_idx on public.projects (owner_id);
create index if not exists projects_created_by_idx on public.projects ((data->>'created_by'));
create index if not exists projects_user_email_idx on public.projects ((data->>'user_email'));
alter table public.projects enable row level security;
drop trigger if exists projects_touch on public.projects;
create trigger projects_touch
  before insert or update on public.projects
  for each row execute function private.touch_entity();


create table if not exists public.project_collaborators (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists project_collaborators_owner_idx on public.project_collaborators (owner_id);
create index if not exists project_collaborators_created_by_idx on public.project_collaborators ((data->>'created_by'));
create index if not exists project_collaborators_user_email_idx on public.project_collaborators ((data->>'user_email'));
alter table public.project_collaborators enable row level security;
drop trigger if exists project_collaborators_touch on public.project_collaborators;
create trigger project_collaborators_touch
  before insert or update on public.project_collaborators
  for each row execute function private.touch_entity();


create table if not exists public.project_tasks (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists project_tasks_owner_idx on public.project_tasks (owner_id);
create index if not exists project_tasks_created_by_idx on public.project_tasks ((data->>'created_by'));
create index if not exists project_tasks_user_email_idx on public.project_tasks ((data->>'user_email'));
alter table public.project_tasks enable row level security;
drop trigger if exists project_tasks_touch on public.project_tasks;
create trigger project_tasks_touch
  before insert or update on public.project_tasks
  for each row execute function private.touch_entity();


create table if not exists public.project_week_statuses (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists project_week_statuses_owner_idx on public.project_week_statuses (owner_id);
create index if not exists project_week_statuses_created_by_idx on public.project_week_statuses ((data->>'created_by'));
create index if not exists project_week_statuses_user_email_idx on public.project_week_statuses ((data->>'user_email'));
alter table public.project_week_statuses enable row level security;
drop trigger if exists project_week_statuses_touch on public.project_week_statuses;
create trigger project_week_statuses_touch
  before insert or update on public.project_week_statuses
  for each row execute function private.touch_entity();


create table if not exists public.shop_items (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shop_items_owner_idx on public.shop_items (owner_id);
create index if not exists shop_items_created_by_idx on public.shop_items ((data->>'created_by'));
create index if not exists shop_items_user_email_idx on public.shop_items ((data->>'user_email'));
alter table public.shop_items enable row level security;
drop trigger if exists shop_items_touch on public.shop_items;
create trigger shop_items_touch
  before insert or update on public.shop_items
  for each row execute function private.touch_entity();


create table if not exists public.shop_packs (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shop_packs_owner_idx on public.shop_packs (owner_id);
create index if not exists shop_packs_created_by_idx on public.shop_packs ((data->>'created_by'));
create index if not exists shop_packs_user_email_idx on public.shop_packs ((data->>'user_email'));
alter table public.shop_packs enable row level security;
drop trigger if exists shop_packs_touch on public.shop_packs;
create trigger shop_packs_touch
  before insert or update on public.shop_packs
  for each row execute function private.touch_entity();


create table if not exists public.stat_views (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists stat_views_owner_idx on public.stat_views (owner_id);
create index if not exists stat_views_created_by_idx on public.stat_views ((data->>'created_by'));
create index if not exists stat_views_user_email_idx on public.stat_views ((data->>'user_email'));
alter table public.stat_views enable row level security;
drop trigger if exists stat_views_touch on public.stat_views;
create trigger stat_views_touch
  before insert or update on public.stat_views
  for each row execute function private.touch_entity();


create table if not exists public.templates (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists templates_owner_idx on public.templates (owner_id);
create index if not exists templates_created_by_idx on public.templates ((data->>'created_by'));
create index if not exists templates_user_email_idx on public.templates ((data->>'user_email'));
alter table public.templates enable row level security;
drop trigger if exists templates_touch on public.templates;
create trigger templates_touch
  before insert or update on public.templates
  for each row execute function private.touch_entity();


create table if not exists public.user_achievements (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_achievements_owner_idx on public.user_achievements (owner_id);
create index if not exists user_achievements_created_by_idx on public.user_achievements ((data->>'created_by'));
create index if not exists user_achievements_user_email_idx on public.user_achievements ((data->>'user_email'));
alter table public.user_achievements enable row level security;
drop trigger if exists user_achievements_touch on public.user_achievements;
create trigger user_achievements_touch
  before insert or update on public.user_achievements
  for each row execute function private.touch_entity();


create table if not exists public.user_badges (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_badges_owner_idx on public.user_badges (owner_id);
create index if not exists user_badges_created_by_idx on public.user_badges ((data->>'created_by'));
create index if not exists user_badges_user_email_idx on public.user_badges ((data->>'user_email'));
alter table public.user_badges enable row level security;
drop trigger if exists user_badges_touch on public.user_badges;
create trigger user_badges_touch
  before insert or update on public.user_badges
  for each row execute function private.touch_entity();


create table if not exists public.user_missions (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_missions_owner_idx on public.user_missions (owner_id);
create index if not exists user_missions_created_by_idx on public.user_missions ((data->>'created_by'));
create index if not exists user_missions_user_email_idx on public.user_missions ((data->>'user_email'));
alter table public.user_missions enable row level security;
drop trigger if exists user_missions_touch on public.user_missions;
create trigger user_missions_touch
  before insert or update on public.user_missions
  for each row execute function private.touch_entity();


create table if not exists public.user_perks (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_perks_owner_idx on public.user_perks (owner_id);
create index if not exists user_perks_created_by_idx on public.user_perks ((data->>'created_by'));
create index if not exists user_perks_user_email_idx on public.user_perks ((data->>'user_email'));
alter table public.user_perks enable row level security;
drop trigger if exists user_perks_touch on public.user_perks;
create trigger user_perks_touch
  before insert or update on public.user_perks
  for each row execute function private.touch_entity();


create table if not exists public.user_preferences (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_preferences_owner_idx on public.user_preferences (owner_id);
create index if not exists user_preferences_created_by_idx on public.user_preferences ((data->>'created_by'));
create index if not exists user_preferences_user_email_idx on public.user_preferences ((data->>'user_email'));
alter table public.user_preferences enable row level security;
drop trigger if exists user_preferences_touch on public.user_preferences;
create trigger user_preferences_touch
  before insert or update on public.user_preferences
  for each row execute function private.touch_entity();


create table if not exists public.weekly_rankings (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists weekly_rankings_owner_idx on public.weekly_rankings (owner_id);
create index if not exists weekly_rankings_created_by_idx on public.weekly_rankings ((data->>'created_by'));
create index if not exists weekly_rankings_user_email_idx on public.weekly_rankings ((data->>'user_email'));
alter table public.weekly_rankings enable row level security;
drop trigger if exists weekly_rankings_touch on public.weekly_rankings;
create trigger weekly_rankings_touch
  before insert or update on public.weekly_rankings
  for each row execute function private.touch_entity();


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

grant select on public.achievements to anon, authenticated;
grant insert, update, delete on public.achievements to authenticated;
create policy achievements_read on public.achievements for select to anon, authenticated using (true);
create policy achievements_insert on public.achievements for insert to authenticated with check ((select private.is_admin()));
create policy achievements_update on public.achievements for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy achievements_delete on public.achievements for delete to authenticated using ((select private.is_admin()));

grant select, insert, update, delete on public.activity_comments to authenticated;
create policy activity_comments_read on public.activity_comments for select to authenticated using (true);
create policy activity_comments_insert on public.activity_comments for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy activity_comments_update on public.activity_comments for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy activity_comments_delete on public.activity_comments for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.activity_reactions to authenticated;
create policy activity_reactions_read on public.activity_reactions for select to authenticated using (true);
create policy activity_reactions_insert on public.activity_reactions for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy activity_reactions_update on public.activity_reactions for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy activity_reactions_delete on public.activity_reactions for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select on public.badges to anon, authenticated;
grant insert, update, delete on public.badges to authenticated;
create policy badges_read on public.badges for select to anon, authenticated using (true);
create policy badges_insert on public.badges for insert to authenticated with check ((select private.is_admin()));
create policy badges_update on public.badges for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy badges_delete on public.badges for delete to authenticated using ((select private.is_admin()));

grant select, insert, update, delete on public.beta_testers to authenticated;
create policy beta_testers_read on public.beta_testers for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy beta_testers_insert on public.beta_testers for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy beta_testers_update on public.beta_testers for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy beta_testers_delete on public.beta_testers for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
create policy blog_posts_read on public.blog_posts for select to anon, authenticated using (true);
create policy blog_posts_insert on public.blog_posts for insert to authenticated with check ((select private.is_admin()));
create policy blog_posts_update on public.blog_posts for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy blog_posts_delete on public.blog_posts for delete to authenticated using ((select private.is_admin()));

grant select, insert, update, delete on public.brand_assets to authenticated;
create policy brand_assets_read on public.brand_assets for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy brand_assets_insert on public.brand_assets for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy brand_assets_update on public.brand_assets for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy brand_assets_delete on public.brand_assets for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.challenges to authenticated;
create policy challenges_read on public.challenges for select to authenticated using (true);
create policy challenges_insert on public.challenges for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy challenges_update on public.challenges for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy challenges_delete on public.challenges for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.challenge_participants to authenticated;
create policy challenge_participants_read on public.challenge_participants for select to authenticated using (true);
create policy challenge_participants_insert on public.challenge_participants for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy challenge_participants_update on public.challenge_participants for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy challenge_participants_delete on public.challenge_participants for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.chat_messages to authenticated;
create policy chat_messages_read on public.chat_messages for select to authenticated using (true);
create policy chat_messages_insert on public.chat_messages for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy chat_messages_update on public.chat_messages for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy chat_messages_delete on public.chat_messages for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.friend_activities to authenticated;
create policy friend_activities_read on public.friend_activities for select to authenticated using (true);
create policy friend_activities_insert on public.friend_activities for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy friend_activities_update on public.friend_activities for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy friend_activities_delete on public.friend_activities for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.friend_requests to authenticated;
create policy friend_requests_read on public.friend_requests for select to authenticated using (
    owner_id = (select auth.uid())
    or data->>'user_email' = (select auth.jwt() ->> 'email')
    or data->>'friend_email' = (select auth.jwt() ->> 'email')
    or data->>'from_user_email' = (select auth.jwt() ->> 'email')
    or data->>'to_user_email' = (select auth.jwt() ->> 'email')
    or data->>'sender_email' = (select auth.jwt() ->> 'email')
    or data->>'receiver_email' = (select auth.jwt() ->> 'email')
    or (select private.is_admin())
  );
create policy friend_requests_insert on public.friend_requests for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy friend_requests_update on public.friend_requests for update to authenticated using (
    owner_id = (select auth.uid())
    or data->>'user_email' = (select auth.jwt() ->> 'email')
    or data->>'friend_email' = (select auth.jwt() ->> 'email')
    or data->>'from_user_email' = (select auth.jwt() ->> 'email')
    or data->>'to_user_email' = (select auth.jwt() ->> 'email')
    or data->>'sender_email' = (select auth.jwt() ->> 'email')
    or data->>'receiver_email' = (select auth.jwt() ->> 'email')
    or (select private.is_admin())
  ) with check (
    owner_id = (select auth.uid())
    or data->>'user_email' = (select auth.jwt() ->> 'email')
    or data->>'friend_email' = (select auth.jwt() ->> 'email')
    or data->>'from_user_email' = (select auth.jwt() ->> 'email')
    or data->>'to_user_email' = (select auth.jwt() ->> 'email')
    or data->>'sender_email' = (select auth.jwt() ->> 'email')
    or data->>'receiver_email' = (select auth.jwt() ->> 'email')
    or (select private.is_admin())
  );
create policy friend_requests_delete on public.friend_requests for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.friendships to authenticated;
create policy friendships_read on public.friendships for select to authenticated using (
    owner_id = (select auth.uid())
    or data->>'user_email' = (select auth.jwt() ->> 'email')
    or data->>'friend_email' = (select auth.jwt() ->> 'email')
    or data->>'from_user_email' = (select auth.jwt() ->> 'email')
    or data->>'to_user_email' = (select auth.jwt() ->> 'email')
    or data->>'sender_email' = (select auth.jwt() ->> 'email')
    or data->>'receiver_email' = (select auth.jwt() ->> 'email')
    or (select private.is_admin())
  );
create policy friendships_insert on public.friendships for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy friendships_update on public.friendships for update to authenticated using (
    owner_id = (select auth.uid())
    or data->>'user_email' = (select auth.jwt() ->> 'email')
    or data->>'friend_email' = (select auth.jwt() ->> 'email')
    or data->>'from_user_email' = (select auth.jwt() ->> 'email')
    or data->>'to_user_email' = (select auth.jwt() ->> 'email')
    or data->>'sender_email' = (select auth.jwt() ->> 'email')
    or data->>'receiver_email' = (select auth.jwt() ->> 'email')
    or (select private.is_admin())
  ) with check (
    owner_id = (select auth.uid())
    or data->>'user_email' = (select auth.jwt() ->> 'email')
    or data->>'friend_email' = (select auth.jwt() ->> 'email')
    or data->>'from_user_email' = (select auth.jwt() ->> 'email')
    or data->>'to_user_email' = (select auth.jwt() ->> 'email')
    or data->>'sender_email' = (select auth.jwt() ->> 'email')
    or data->>'receiver_email' = (select auth.jwt() ->> 'email')
    or (select private.is_admin())
  );
create policy friendships_delete on public.friendships for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.gifts to authenticated;
create policy gifts_read on public.gifts for select to authenticated using (
    owner_id = (select auth.uid())
    or data->>'user_email' = (select auth.jwt() ->> 'email')
    or data->>'friend_email' = (select auth.jwt() ->> 'email')
    or data->>'from_user_email' = (select auth.jwt() ->> 'email')
    or data->>'to_user_email' = (select auth.jwt() ->> 'email')
    or data->>'sender_email' = (select auth.jwt() ->> 'email')
    or data->>'receiver_email' = (select auth.jwt() ->> 'email')
    or (select private.is_admin())
  );
create policy gifts_insert on public.gifts for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy gifts_update on public.gifts for update to authenticated using (
    owner_id = (select auth.uid())
    or data->>'user_email' = (select auth.jwt() ->> 'email')
    or data->>'friend_email' = (select auth.jwt() ->> 'email')
    or data->>'from_user_email' = (select auth.jwt() ->> 'email')
    or data->>'to_user_email' = (select auth.jwt() ->> 'email')
    or data->>'sender_email' = (select auth.jwt() ->> 'email')
    or data->>'receiver_email' = (select auth.jwt() ->> 'email')
    or (select private.is_admin())
  ) with check (
    owner_id = (select auth.uid())
    or data->>'user_email' = (select auth.jwt() ->> 'email')
    or data->>'friend_email' = (select auth.jwt() ->> 'email')
    or data->>'from_user_email' = (select auth.jwt() ->> 'email')
    or data->>'to_user_email' = (select auth.jwt() ->> 'email')
    or data->>'sender_email' = (select auth.jwt() ->> 'email')
    or data->>'receiver_email' = (select auth.jwt() ->> 'email')
    or (select private.is_admin())
  );
create policy gifts_delete on public.gifts for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.goals to authenticated;
create policy goals_read on public.goals for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy goals_insert on public.goals for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy goals_update on public.goals for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy goals_delete on public.goals for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.guilds to authenticated;
create policy guilds_read on public.guilds for select to authenticated using (true);
create policy guilds_insert on public.guilds for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy guilds_update on public.guilds for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy guilds_delete on public.guilds for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.guild_members to authenticated;
create policy guild_members_read on public.guild_members for select to authenticated using (true);
create policy guild_members_insert on public.guild_members for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy guild_members_update on public.guild_members for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy guild_members_delete on public.guild_members for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.guild_posts to authenticated;
create policy guild_posts_read on public.guild_posts for select to authenticated using (true);
create policy guild_posts_insert on public.guild_posts for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy guild_posts_update on public.guild_posts for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy guild_posts_delete on public.guild_posts for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.guild_post_comments to authenticated;
create policy guild_post_comments_read on public.guild_post_comments for select to authenticated using (true);
create policy guild_post_comments_insert on public.guild_post_comments for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy guild_post_comments_update on public.guild_post_comments for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy guild_post_comments_delete on public.guild_post_comments for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.habits to authenticated;
create policy habits_read on public.habits for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()) or (select private.is_friend_email(data->>'created_by')));
create policy habits_insert on public.habits for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy habits_update on public.habits for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy habits_delete on public.habits for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.habit_logs to authenticated;
create policy habit_logs_read on public.habit_logs for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy habit_logs_insert on public.habit_logs for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy habit_logs_update on public.habit_logs for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy habit_logs_delete on public.habit_logs for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.invitations to authenticated;
create policy invitations_read on public.invitations for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy invitations_insert on public.invitations for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy invitations_update on public.invitations for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy invitations_delete on public.invitations for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select on public.loot_boxes to anon, authenticated;
grant insert, update, delete on public.loot_boxes to authenticated;
create policy loot_boxes_read on public.loot_boxes for select to anon, authenticated using (true);
create policy loot_boxes_insert on public.loot_boxes for insert to authenticated with check ((select private.is_admin()));
create policy loot_boxes_update on public.loot_boxes for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy loot_boxes_delete on public.loot_boxes for delete to authenticated using ((select private.is_admin()));

grant select on public.missions to anon, authenticated;
grant insert, update, delete on public.missions to authenticated;
create policy missions_read on public.missions for select to anon, authenticated using (true);
create policy missions_insert on public.missions for insert to authenticated with check ((select private.is_admin()));
create policy missions_update on public.missions for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy missions_delete on public.missions for delete to authenticated using ((select private.is_admin()));

grant select, insert, update, delete on public.notifications to authenticated;
create policy notifications_read on public.notifications for select to authenticated using (owner_id = (select auth.uid()) or data->>'user_email' = (select auth.jwt() ->> 'email') or (select private.is_admin()));
create policy notifications_insert on public.notifications for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy notifications_update on public.notifications for update to authenticated using (owner_id = (select auth.uid()) or data->>'user_email' = (select auth.jwt() ->> 'email') or (select private.is_admin())) with check (owner_id = (select auth.uid()) or data->>'user_email' = (select auth.jwt() ->> 'email') or (select private.is_admin()));
create policy notifications_delete on public.notifications for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select on public.perks to anon, authenticated;
grant insert, update, delete on public.perks to authenticated;
create policy perks_read on public.perks for select to anon, authenticated using (true);
create policy perks_insert on public.perks for insert to authenticated with check ((select private.is_admin()));
create policy perks_update on public.perks for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy perks_delete on public.perks for delete to authenticated using ((select private.is_admin()));

grant select, insert, update, delete on public.profile_comments to authenticated;
create policy profile_comments_read on public.profile_comments for select to authenticated using (true);
create policy profile_comments_insert on public.profile_comments for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy profile_comments_update on public.profile_comments for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy profile_comments_delete on public.profile_comments for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.projects to authenticated;
create policy projects_read on public.projects for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()) or id in (select c.data->>'project_id' from public.project_collaborators c where c.data->>'user_email' = (select auth.jwt() ->> 'email')));
create policy projects_insert on public.projects for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy projects_update on public.projects for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy projects_delete on public.projects for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.project_collaborators to authenticated;
create policy project_collaborators_read on public.project_collaborators for select to authenticated using (
    owner_id = (select auth.uid())
    or data->>'user_email' = (select auth.jwt() ->> 'email')
    or data->>'friend_email' = (select auth.jwt() ->> 'email')
    or data->>'from_user_email' = (select auth.jwt() ->> 'email')
    or data->>'to_user_email' = (select auth.jwt() ->> 'email')
    or data->>'sender_email' = (select auth.jwt() ->> 'email')
    or data->>'receiver_email' = (select auth.jwt() ->> 'email')
    or (select private.is_admin())
  );
create policy project_collaborators_insert on public.project_collaborators for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy project_collaborators_update on public.project_collaborators for update to authenticated using (
    owner_id = (select auth.uid())
    or data->>'user_email' = (select auth.jwt() ->> 'email')
    or data->>'friend_email' = (select auth.jwt() ->> 'email')
    or data->>'from_user_email' = (select auth.jwt() ->> 'email')
    or data->>'to_user_email' = (select auth.jwt() ->> 'email')
    or data->>'sender_email' = (select auth.jwt() ->> 'email')
    or data->>'receiver_email' = (select auth.jwt() ->> 'email')
    or (select private.is_admin())
  ) with check (
    owner_id = (select auth.uid())
    or data->>'user_email' = (select auth.jwt() ->> 'email')
    or data->>'friend_email' = (select auth.jwt() ->> 'email')
    or data->>'from_user_email' = (select auth.jwt() ->> 'email')
    or data->>'to_user_email' = (select auth.jwt() ->> 'email')
    or data->>'sender_email' = (select auth.jwt() ->> 'email')
    or data->>'receiver_email' = (select auth.jwt() ->> 'email')
    or (select private.is_admin())
  );
create policy project_collaborators_delete on public.project_collaborators for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.project_tasks to authenticated;
create policy project_tasks_read on public.project_tasks for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()) or (select private.can_read_project(data->>'project_id')));
create policy project_tasks_insert on public.project_tasks for insert to authenticated with check ((owner_id = (select auth.uid()) or (select private.is_admin())) and ((select private.is_admin()) or (select private.can_read_project(data->>'project_id')) or owner_id = (select auth.uid())));
create policy project_tasks_update on public.project_tasks for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy project_tasks_delete on public.project_tasks for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.project_week_statuses to authenticated;
create policy project_week_statuses_read on public.project_week_statuses for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy project_week_statuses_insert on public.project_week_statuses for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy project_week_statuses_update on public.project_week_statuses for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy project_week_statuses_delete on public.project_week_statuses for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select on public.shop_items to anon, authenticated;
grant insert, update, delete on public.shop_items to authenticated;
create policy shop_items_read on public.shop_items for select to anon, authenticated using (true);
create policy shop_items_insert on public.shop_items for insert to authenticated with check ((select private.is_admin()));
create policy shop_items_update on public.shop_items for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy shop_items_delete on public.shop_items for delete to authenticated using ((select private.is_admin()));

grant select on public.shop_packs to anon, authenticated;
grant insert, update, delete on public.shop_packs to authenticated;
create policy shop_packs_read on public.shop_packs for select to anon, authenticated using (true);
create policy shop_packs_insert on public.shop_packs for insert to authenticated with check ((select private.is_admin()));
create policy shop_packs_update on public.shop_packs for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy shop_packs_delete on public.shop_packs for delete to authenticated using ((select private.is_admin()));

grant select, insert, update, delete on public.stat_views to authenticated;
create policy stat_views_read on public.stat_views for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy stat_views_insert on public.stat_views for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy stat_views_update on public.stat_views for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy stat_views_delete on public.stat_views for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select on public.templates to anon, authenticated;
grant insert, update, delete on public.templates to authenticated;
create policy templates_read on public.templates for select to anon, authenticated using (true);
create policy templates_insert on public.templates for insert to authenticated with check ((select private.is_admin()));
create policy templates_update on public.templates for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy templates_delete on public.templates for delete to authenticated using ((select private.is_admin()));

grant select, insert, update, delete on public.user_achievements to authenticated;
create policy user_achievements_read on public.user_achievements for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_achievements_insert on public.user_achievements for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_achievements_update on public.user_achievements for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_achievements_delete on public.user_achievements for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.user_badges to authenticated;
create policy user_badges_read on public.user_badges for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_badges_insert on public.user_badges for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_badges_update on public.user_badges for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_badges_delete on public.user_badges for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.user_missions to authenticated;
create policy user_missions_read on public.user_missions for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_missions_insert on public.user_missions for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_missions_update on public.user_missions for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_missions_delete on public.user_missions for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.user_perks to authenticated;
create policy user_perks_read on public.user_perks for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_perks_insert on public.user_perks for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_perks_update on public.user_perks for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_perks_delete on public.user_perks for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.user_preferences to authenticated;
create policy user_preferences_read on public.user_preferences for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_preferences_insert on public.user_preferences for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_preferences_update on public.user_preferences for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy user_preferences_delete on public.user_preferences for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

grant select, insert, update, delete on public.weekly_rankings to authenticated;
create policy weekly_rankings_read on public.weekly_rankings for select to authenticated using (true);
create policy weekly_rankings_insert on public.weekly_rankings for insert to authenticated with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy weekly_rankings_update on public.weekly_rankings for update to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin())) with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy weekly_rankings_delete on public.weekly_rankings for delete to authenticated using (owner_id = (select auth.uid()) or (select private.is_admin()));

create policy coach_conversations_all on public.coach_conversations
  for all to authenticated
  using (owner_id = (select auth.uid()) or (select private.is_admin()))
  with check (owner_id = (select auth.uid()) or (select private.is_admin()));


-- Catálogo. Lo inserta postgres, que no pasa por RLS.
insert into public.shop_items (id, data) values
  ('shop_hair_brown_bun', '{"id":"shop_hair_brown_bun","item_id":"hair_brown_bun","name":"Moño castaño","description":"Pieza inicial.","category":"hair","style_id":"hair_brown_bun","price":0,"gem_price":0,"rarity":"common","icon":"🎀","is_available":true,"is_new":true,"sort_order":0,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hair_white', '{"id":"shop_hair_white","item_id":"hair_white","name":"Melena blanca","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hair","style_id":"hair_white","price":70,"gem_price":0,"rarity":"rare","icon":"🤍","is_available":true,"is_new":true,"sort_order":1,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hair_dark', '{"id":"shop_hair_dark","item_id":"hair_dark","name":"Pelo oscuro","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hair","style_id":"hair_dark","price":40,"gem_price":0,"rarity":"common","icon":"🖤","is_available":true,"is_new":true,"sort_order":2,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hair_blonde', '{"id":"shop_hair_blonde","item_id":"hair_blonde","name":"Rubio corto","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hair","style_id":"hair_blonde","price":40,"gem_price":0,"rarity":"common","icon":"💛","is_available":true,"is_new":true,"sort_order":3,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hair_teal', '{"id":"shop_hair_teal","item_id":"hair_teal","name":"Flequillo menta","description":"Pieza inicial.","category":"hair","style_id":"hair_teal","price":0,"gem_price":0,"rarity":"common","icon":"💚","is_available":true,"is_new":true,"sort_order":4,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hair_pink', '{"id":"shop_hair_pink","item_id":"hair_pink","name":"Coletas rosas","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hair","style_id":"hair_pink","price":80,"gem_price":0,"rarity":"rare","icon":"💗","is_available":true,"is_new":true,"sort_order":5,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hair_violet', '{"id":"shop_hair_violet","item_id":"hair_violet","name":"Ondas violetas","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hair","style_id":"hair_violet","price":90,"gem_price":0,"rarity":"rare","icon":"💜","is_available":true,"is_new":true,"sort_order":6,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hair_blue', '{"id":"shop_hair_blue","item_id":"hair_blue","name":"Colas azules","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hair","style_id":"hair_blue","price":90,"gem_price":0,"rarity":"rare","icon":"💙","is_available":true,"is_new":true,"sort_order":7,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hair_cat', '{"id":"shop_hair_cat","item_id":"hair_cat","name":"Pelo con orejas","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hair","style_id":"hair_cat","price":120,"gem_price":0,"rarity":"epic","icon":"🐱","is_available":true,"is_new":false,"sort_order":8,"unlock_requirement":{"type":"level","value":2},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hair_brasa', '{"id":"shop_hair_brasa","item_id":"hair_brasa","name":"Mechones de brasa","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hair","style_id":"hair_brasa","price":110,"gem_price":0,"rarity":"epic","icon":"🔥","is_available":true,"is_new":false,"sort_order":9,"unlock_requirement":{"type":"level","value":2},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_horns_curl', '{"id":"shop_horns_curl","item_id":"horns_curl","name":"Cuernos curvos","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hat","style_id":"horns_curl","price":100,"gem_price":0,"rarity":"epic","icon":"🌙","is_available":true,"is_new":false,"sort_order":10,"unlock_requirement":{"type":"level","value":2},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_horns_gold', '{"id":"shop_horns_gold","item_id":"horns_gold","name":"Cuernos dorados","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hat","style_id":"horns_gold","price":0,"gem_price":0,"rarity":"legendary","icon":"✨","is_available":true,"is_new":false,"sort_order":11,"unlock_requirement":{"type":"streak","value":7},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_antenna_lila', '{"id":"shop_antenna_lila","item_id":"antenna_lila","name":"Antena lila","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hat","style_id":"antenna_lila","price":60,"gem_price":0,"rarity":"rare","icon":"📡","is_available":true,"is_new":false,"sort_order":12,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_top_cream', '{"id":"shop_top_cream","item_id":"top_cream","name":"Suéter crema","description":"Pieza inicial.","category":"shirt","style_id":"top_cream","price":0,"gem_price":0,"rarity":"common","icon":"🤍","is_available":true,"is_new":false,"sort_order":13,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_top_moon', '{"id":"shop_top_moon","item_id":"top_moon","name":"Top luna","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shirt","style_id":"top_moon","price":70,"gem_price":0,"rarity":"rare","icon":"🌙","is_available":true,"is_new":false,"sort_order":14,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_top_star', '{"id":"shop_top_star","item_id":"top_star","name":"Top estrella","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shirt","style_id":"top_star","price":70,"gem_price":0,"rarity":"rare","icon":"⭐","is_available":true,"is_new":false,"sort_order":15,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_top_hoodie_blue', '{"id":"shop_top_hoodie_blue","item_id":"top_hoodie_blue","name":"Sudadera alien","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shirt","style_id":"top_hoodie_blue","price":90,"gem_price":0,"rarity":"rare","icon":"👽","is_available":true,"is_new":false,"sort_order":16,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_top_fire', '{"id":"shop_top_fire","item_id":"top_fire","name":"Chaqueta de fuego","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shirt","style_id":"top_fire","price":130,"gem_price":0,"rarity":"epic","icon":"🔥","is_available":true,"is_new":false,"sort_order":17,"unlock_requirement":{"type":"level","value":2},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_top_hoodie_yellow', '{"id":"shop_top_hoodie_yellow","item_id":"top_hoodie_yellow","name":"Sudadera sol","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shirt","style_id":"top_hoodie_yellow","price":80,"gem_price":0,"rarity":"common","icon":"🌞","is_available":true,"is_new":false,"sort_order":18,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_top_hoodie_green', '{"id":"shop_top_hoodie_green","item_id":"top_hoodie_green","name":"Sudadera huerto","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shirt","style_id":"top_hoodie_green","price":80,"gem_price":0,"rarity":"common","icon":"🌿","is_available":true,"is_new":false,"sort_order":19,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_top_hoodie_pink', '{"id":"shop_top_hoodie_pink","item_id":"top_hoodie_pink","name":"Sudadera conejo","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shirt","style_id":"top_hoodie_pink","price":80,"gem_price":0,"rarity":"rare","icon":"🐰","is_available":true,"is_new":false,"sort_order":20,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_top_hoodie_purple', '{"id":"shop_top_hoodie_purple","item_id":"top_hoodie_purple","name":"Sudadera violeta","description":"Pieza inicial.","category":"shirt","style_id":"top_hoodie_purple","price":0,"gem_price":0,"rarity":"common","icon":"💜","is_available":true,"is_new":false,"sort_order":21,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_top_jacket', '{"id":"shop_top_jacket","item_id":"top_jacket","name":"Chaqueta varsity","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shirt","style_id":"top_jacket","price":120,"gem_price":0,"rarity":"epic","icon":"🧥","is_available":true,"is_new":false,"sort_order":22,"unlock_requirement":{"type":"level","value":2},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_shorts_rose', '{"id":"shop_shorts_rose","item_id":"shorts_rose","name":"Shorts rosados","description":"Cosmético con precio fijo en monedas de hábitos.","category":"pants","style_id":"shorts_rose","price":50,"gem_price":0,"rarity":"common","icon":"🩳","is_available":true,"is_new":false,"sort_order":23,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_shorts_green', '{"id":"shop_shorts_green","item_id":"shorts_green","name":"Shorts de huerto","description":"Cosmético con precio fijo en monedas de hábitos.","category":"pants","style_id":"shorts_green","price":50,"gem_price":0,"rarity":"common","icon":"🌿","is_available":true,"is_new":false,"sort_order":24,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_jeans', '{"id":"shop_jeans","item_id":"jeans","name":"Vaqueros","description":"Pieza inicial.","category":"pants","style_id":"jeans","price":0,"gem_price":0,"rarity":"common","icon":"👖","is_available":true,"is_new":false,"sort_order":25,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_pants_moon', '{"id":"shop_pants_moon","item_id":"pants_moon","name":"Pantalón luna","description":"Cosmético con precio fijo en monedas de hábitos.","category":"pants","style_id":"pants_moon","price":80,"gem_price":0,"rarity":"rare","icon":"🌙","is_available":true,"is_new":false,"sort_order":26,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_pants_cargo', '{"id":"shop_pants_cargo","item_id":"pants_cargo","name":"Cargo violeta","description":"Cosmético con precio fijo en monedas de hábitos.","category":"pants","style_id":"pants_cargo","price":70,"gem_price":0,"rarity":"common","icon":"👖","is_available":true,"is_new":false,"sort_order":27,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_skirt_gold', '{"id":"shop_skirt_gold","item_id":"skirt_gold","name":"Falda dorada","description":"Cosmético con precio fijo en monedas de hábitos.","category":"pants","style_id":"skirt_gold","price":90,"gem_price":0,"rarity":"rare","icon":"✨","is_available":true,"is_new":false,"sort_order":28,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_skirt_purple', '{"id":"shop_skirt_purple","item_id":"skirt_purple","name":"Falda violeta","description":"Pieza inicial.","category":"pants","style_id":"skirt_purple","price":0,"gem_price":0,"rarity":"common","icon":"💜","is_available":true,"is_new":false,"sort_order":29,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_shoes_pink', '{"id":"shop_shoes_pink","item_id":"shoes_pink","name":"Botitas rosas","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shoes","style_id":"shoes_pink","price":40,"gem_price":0,"rarity":"common","icon":"👟","is_available":true,"is_new":false,"sort_order":30,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_shoes_red', '{"id":"shop_shoes_red","item_id":"shoes_red","name":"Zapatillas rojas","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shoes","style_id":"shoes_red","price":50,"gem_price":0,"rarity":"common","icon":"👟","is_available":true,"is_new":false,"sort_order":31,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_shoes_yellow', '{"id":"shop_shoes_yellow","item_id":"shoes_yellow","name":"Zapatillas sol","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shoes","style_id":"shoes_yellow","price":50,"gem_price":0,"rarity":"common","icon":"👟","is_available":true,"is_new":false,"sort_order":32,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_shoes_mint', '{"id":"shop_shoes_mint","item_id":"shoes_mint","name":"Zapatillas menta","description":"Pieza inicial.","category":"shoes","style_id":"shoes_mint","price":0,"gem_price":0,"rarity":"common","icon":"👟","is_available":true,"is_new":false,"sort_order":33,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_shoes_brown', '{"id":"shop_shoes_brown","item_id":"shoes_brown","name":"Botas de campo","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shoes","style_id":"shoes_brown","price":60,"gem_price":0,"rarity":"common","icon":"🥾","is_available":true,"is_new":false,"sort_order":34,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_shoes_white', '{"id":"shop_shoes_white","item_id":"shoes_white","name":"Botas blancas","description":"Pieza inicial.","category":"shoes","style_id":"shoes_white","price":0,"gem_price":0,"rarity":"common","icon":"🥾","is_available":true,"is_new":false,"sort_order":35,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_shoes_purple', '{"id":"shop_shoes_purple","item_id":"shoes_purple","name":"Botas violetas","description":"Cosmético con precio fijo en monedas de hábitos.","category":"shoes","style_id":"shoes_purple","price":70,"gem_price":0,"rarity":"rare","icon":"🥾","is_available":true,"is_new":false,"sort_order":36,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hat_witch', '{"id":"shop_hat_witch","item_id":"hat_witch","name":"Sombrero de bruja","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hat","style_id":"hat_witch","price":100,"gem_price":0,"rarity":"epic","icon":"🧙","is_available":true,"is_new":false,"sort_order":37,"unlock_requirement":{"type":"level","value":2},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hat_moon', '{"id":"shop_hat_moon","item_id":"hat_moon","name":"Sombrero luna","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hat","style_id":"hat_moon","price":110,"gem_price":0,"rarity":"epic","icon":"🌙","is_available":true,"is_new":false,"sort_order":38,"unlock_requirement":{"type":"level","value":2},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hat_flower', '{"id":"shop_hat_flower","item_id":"hat_flower","name":"Sombrero floral","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hat","style_id":"hat_flower","price":90,"gem_price":0,"rarity":"rare","icon":"🌸","is_available":true,"is_new":false,"sort_order":39,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hat_star', '{"id":"shop_hat_star","item_id":"hat_star","name":"Sombrero estrella","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hat","style_id":"hat_star","price":90,"gem_price":0,"rarity":"rare","icon":"⭐","is_available":true,"is_new":false,"sort_order":40,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hat_bow', '{"id":"shop_hat_bow","item_id":"hat_bow","name":"Gorro con lazo","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hat","style_id":"hat_bow","price":60,"gem_price":0,"rarity":"common","icon":"🎀","is_available":true,"is_new":false,"sort_order":41,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_wings_fairy', '{"id":"shop_wings_fairy","item_id":"wings_fairy","name":"Alas hada","description":"Cosmético con precio fijo en monedas de hábitos.","category":"backpack","style_id":"wings_fairy","price":0,"gem_price":0,"rarity":"epic","icon":"🦋","is_available":true,"is_new":false,"sort_order":42,"unlock_requirement":{"type":"streak","value":7},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_wings_bat', '{"id":"shop_wings_bat","item_id":"wings_bat","name":"Alas murciélago","description":"Cosmético con precio fijo en monedas de hábitos.","category":"backpack","style_id":"wings_bat","price":140,"gem_price":0,"rarity":"epic","icon":"🦇","is_available":true,"is_new":false,"sort_order":43,"unlock_requirement":{"type":"level","value":2},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_wings_angel', '{"id":"shop_wings_angel","item_id":"wings_angel","name":"Alas claras","description":"Cosmético con precio fijo en monedas de hábitos.","category":"backpack","style_id":"wings_angel","price":140,"gem_price":0,"rarity":"epic","icon":"🕊️","is_available":true,"is_new":false,"sort_order":44,"unlock_requirement":{"type":"level","value":2},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_cape_moon', '{"id":"shop_cape_moon","item_id":"cape_moon","name":"Capa luna","description":"Cosmético con precio fijo en monedas de hábitos.","category":"backpack","style_id":"cape_moon","price":120,"gem_price":0,"rarity":"rare","icon":"🌙","is_available":true,"is_new":false,"sort_order":45,"unlock_requirement":{"type":"level","value":2},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_bag_moon', '{"id":"shop_bag_moon","item_id":"bag_moon","name":"Mochila luna","description":"Cosmético con precio fijo en monedas de hábitos.","category":"backpack","style_id":"bag_moon","price":80,"gem_price":0,"rarity":"common","icon":"🎒","is_available":true,"is_new":false,"sort_order":46,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_bag_bat', '{"id":"shop_bag_bat","item_id":"bag_bat","name":"Mochila murciélago","description":"Cosmético con precio fijo en monedas de hábitos.","category":"backpack","style_id":"bag_bat","price":90,"gem_price":0,"rarity":"rare","icon":"🎒","is_available":true,"is_new":false,"sort_order":47,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_prop_book', '{"id":"shop_prop_book","item_id":"prop_book","name":"Libro de hechizos","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hand","style_id":"prop_book","price":70,"gem_price":0,"rarity":"rare","icon":"📖","is_available":true,"is_new":false,"sort_order":48,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_prop_potion', '{"id":"shop_prop_potion","item_id":"prop_potion","name":"Poción rosa","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hand","style_id":"prop_potion","price":40,"gem_price":0,"rarity":"common","icon":"🧪","is_available":true,"is_new":false,"sort_order":49,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_prop_lantern', '{"id":"shop_prop_lantern","item_id":"prop_lantern","name":"Farol","description":"Cosmético con precio fijo en monedas de hábitos.","category":"hand","style_id":"prop_lantern","price":50,"gem_price":0,"rarity":"common","icon":"🏮","is_available":true,"is_new":false,"sort_order":50,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_pet_shiba', '{"id":"shop_pet_shiba","item_id":"pet_shiba","name":"Shiba","description":"Pieza inicial.","category":"pet","style_id":"pet_shiba","price":0,"gem_price":0,"rarity":"common","icon":"🐶","is_available":true,"is_new":false,"sort_order":51,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_pet_bunny', '{"id":"shop_pet_bunny","item_id":"pet_bunny","name":"Conejo","description":"Cosmético con precio fijo en monedas de hábitos.","category":"pet","style_id":"pet_bunny","price":80,"gem_price":0,"rarity":"rare","icon":"🐰","is_available":true,"is_new":false,"sort_order":52,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_pet_owl', '{"id":"shop_pet_owl","item_id":"pet_owl","name":"Búho","description":"Cosmético con precio fijo en monedas de hábitos.","category":"pet","style_id":"pet_owl","price":90,"gem_price":0,"rarity":"rare","icon":"🦉","is_available":true,"is_new":false,"sort_order":53,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_pet_frog', '{"id":"shop_pet_frog","item_id":"pet_frog","name":"Rana","description":"Cosmético con precio fijo en monedas de hábitos.","category":"pet","style_id":"pet_frog","price":70,"gem_price":0,"rarity":"common","icon":"🐸","is_available":true,"is_new":false,"sort_order":54,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_pet_dragon', '{"id":"shop_pet_dragon","item_id":"pet_dragon","name":"Dragón pequeño","description":"Cosmético con precio fijo en monedas de hábitos.","category":"pet","style_id":"pet_dragon","price":0,"gem_price":0,"rarity":"legendary","icon":"🐉","is_available":true,"is_new":false,"sort_order":55,"unlock_requirement":{"type":"streak","value":7},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_pet_robot', '{"id":"shop_pet_robot","item_id":"pet_robot","name":"Robot mascota","description":"Cosmético con precio fijo en monedas de hábitos.","category":"pet","style_id":"pet_robot","price":140,"gem_price":0,"rarity":"epic","icon":"🤖","is_available":true,"is_new":false,"sort_order":56,"unlock_requirement":{"type":"level","value":2},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_pet_cat', '{"id":"shop_pet_cat","item_id":"pet_cat","name":"Gato brujo","description":"Cosmético con precio fijo en monedas de hábitos.","category":"pet","style_id":"pet_cat","price":100,"gem_price":0,"rarity":"rare","icon":"🐱","is_available":true,"is_new":false,"sort_order":57,"unlock_requirement":{"type":"level","value":2},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_pet_hedgehog', '{"id":"shop_pet_hedgehog","item_id":"pet_hedgehog","name":"Erizo","description":"Cosmético con precio fijo en monedas de hábitos.","category":"pet","style_id":"pet_hedgehog","price":80,"gem_price":0,"rarity":"rare","icon":"🦔","is_available":true,"is_new":false,"sort_order":58,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_sparkles', '{"id":"shop_sparkles","item_id":"sparkles","name":"Chispas","description":"Cosmético con precio fijo en monedas de hábitos.","category":"effect","style_id":"sparkles","price":40,"gem_price":0,"rarity":"rare","icon":"✨","is_available":true,"is_new":false,"sort_order":59,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_hearts', '{"id":"shop_hearts","item_id":"hearts","name":"Corazones","description":"Cosmético con precio fijo en monedas de hábitos.","category":"effect","style_id":"hearts","price":40,"gem_price":0,"rarity":"rare","icon":"✨","is_available":true,"is_new":false,"sort_order":60,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb),
  ('shop_ring', '{"id":"shop_ring","item_id":"ring","name":"Anillo","description":"Cosmético con precio fijo en monedas de hábitos.","category":"effect","style_id":"ring","price":30,"gem_price":0,"rarity":"rare","icon":"✨","is_available":true,"is_new":false,"sort_order":61,"unlock_requirement":{"type":"none"},"created_date":"2026-11-12T05:47:31.600Z"}'::jsonb)
on conflict (id) do nothing;

insert into public.loot_boxes (id, data) values
  ('box_constancia', '{"box_id":"constancia","name":"Cofre de constancia","description":"Entrega la siguiente pieza de la colección, siempre en el mismo orden. No es una caja aleatoria.","price":0,"gem_price":0,"is_available":true,"possible_rarities":["common","rare","epic","legendary","exclusive"],"item_count":1,"guaranteed_legendary":false,"sort_order":1,"icon":"🎁"}'::jsonb)
on conflict (id) do nothing;

insert into public.shop_packs (id, data) values
  ('pack_huerto', '{"pack_id":"huerto","name":"Pack huerto","description":"Sudadera, shorts y botas. Precio fijo, sin azar.","price":190,"discount_price":120,"discountPrice":120,"item_ids":["top_hoodie_green","shorts_green","shoes_brown"],"is_available":true,"sort_order":1,"icon":"🌿"}'::jsonb)
on conflict (id) do nothing;

insert into public.badges (id, data) values
  ('badge_atleta', '{"badge_id":"atleta","name":"Atleta","icon":"🏃","levels":[{"level":1,"requirement_value":1},{"level":2,"requirement_value":5}]}'::jsonb),
  ('badge_lector', '{"badge_id":"lector","name":"Lector","icon":"📚","levels":[{"level":1,"requirement_value":1},{"level":2,"requirement_value":5}]}'::jsonb)
on conflict (id) do nothing;

insert into public.achievements (id, data) values
  ('ach_agua', '{"achievement_id":"agua_7","name":"Manantial","description":"Siete días seguidos bebiendo agua.","icon":"💧","xp_reward":50}'::jsonb)
on conflict (id) do nothing;

insert into public.missions (id, data) values
  ('mission_hoy', '{"title":"Cierra dos hábitos hoy","description":"Marca dos hábitos antes de la noche.","type":"daily","xp_reward":40,"coin_reward":20,"target":2,"is_active":true}'::jsonb)
on conflict (id) do nothing;

insert into public.blog_posts (id, data) values
  ('post_bienvenida', '{"slug":"bienvenida-neo-pixel","title":"Neo Pixel Cozy ya vive en el vestidor","excerpt":"Un estilo pixel, cálido y modular para el avatar de Habalyze.","content":"Los cosméticos se desbloquean con constancia. Esta entrada es pública.","is_published":true,"published_date":"2026-11-12","author":"Habalyze"}'::jsonb)
on conflict (id) do nothing;

insert into public.templates (id, data) values
  ('tpl_manana', '{"name":"Mañana tranquila","description":"Agua, una página y la cama hecha.","type":"habit","is_public":true,"icon":"sunrise","use_count":0,"payload":{"name":"Hacer la cama","icon":"smile","color":"yellow","frequency":"daily"}}'::jsonb)
on conflict (id) do nothing;



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
