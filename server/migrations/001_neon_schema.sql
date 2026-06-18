create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  avatar_url text,
  goal text,
  current_gym text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leagues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  name text not null,
  description text,
  cover_url text,
  invite_code text not null unique,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists league_members (
  league_id uuid not null references leagues(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  score_cache integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (league_id, user_id)
);

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  workout_type text not null check (workout_type in ('peito', 'costas', 'perna', 'cardio', 'braco', 'full_body', 'mobilidade', 'outro')),
  note text,
  photo_url text,
  checked_in_at timestamptz not null default now(),
  checked_in_on date not null default current_date,
  verification_status text not null default 'self_reported' check (verification_status in ('self_reported', 'photo_pending', 'gps_pending', 'verified')),
  anti_cheat_meta jsonb not null default '{}'::jsonb,
  unique (league_id, user_id, checked_in_on)
);

create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues(id) on delete cascade,
  title text not null,
  description text not null,
  points integer not null default 30,
  challenge_type text not null check (challenge_type in ('weekly_count', 'streak', 'workout_type_count', 'weekday', 'monthly_count')),
  target_value integer not null default 1,
  workout_type text check (workout_type in ('peito', 'costas', 'perna', 'cardio', 'braco', 'full_body', 'mobilidade', 'outro')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists user_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  progress integer not null default 0,
  status text not null default 'active' check (status in ('active', 'completed', 'expired')),
  completed_at timestamptz,
  unique (challenge_id, user_id)
);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  icon text not null,
  points integer not null default 0
);

create table if not exists user_achievements (
  achievement_id uuid not null references achievements(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  league_id uuid references leagues(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (achievement_id, user_id, league_id)
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  checkin_id uuid references checkins(id) on delete set null,
  achievement_id uuid references achievements(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists post_likes (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists league_members_user_id_idx on league_members(user_id);
create index if not exists checkins_league_user_date_idx on checkins(league_id, user_id, checked_in_on desc);
create index if not exists posts_league_created_at_idx on posts(league_id, created_at desc);
create index if not exists challenges_league_period_idx on challenges(league_id, starts_at, ends_at);

insert into achievements (code, title, description, icon, points)
values
  ('first_checkin', 'Primeiro treino', 'Fez o primeiro check-in na Gym League.', 'spark', 0),
  ('three_day_streak', '3 dias seguidos', 'Manteve uma sequencia de tres dias.', 'flame', 0),
  ('ten_monthly_checkins', '10 treinos no mes', 'Completou dez treinos no mes.', 'medal', 0),
  ('weekly_legend', 'Lenda da semana', 'Terminou a semana no topo da liga.', 'crown', 0),
  ('consistency_king', 'Rei da constancia', 'Mostrou consistencia acima da media.', 'shield', 0),
  ('monday_never_miss', 'Nunca falta na segunda', 'Fez check-in na segunda-feira.', 'calendar', 0)
on conflict (code) do nothing;
