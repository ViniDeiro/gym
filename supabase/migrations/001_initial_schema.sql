create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  avatar_url text,
  goal text,
  current_gym text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leagues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  cover_url text,
  invite_code text not null unique,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.league_members (
  league_id uuid not null references public.leagues(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  score_cache integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (league_id, user_id)
);

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  workout_type text not null check (workout_type in ('peito', 'costas', 'perna', 'cardio', 'braco', 'full_body', 'mobilidade', 'outro')),
  note text,
  photo_url text,
  checked_in_at timestamptz not null default now(),
  checked_in_on date not null default current_date,
  verification_status text not null default 'self_reported' check (verification_status in ('self_reported', 'photo_pending', 'gps_pending', 'verified')),
  anti_cheat_meta jsonb not null default '{}'::jsonb,
  unique (league_id, user_id, checked_in_on)
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
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

create table public.user_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  progress integer not null default 0,
  status text not null default 'active' check (status in ('active', 'completed', 'expired')),
  completed_at timestamptz,
  unique (challenge_id, user_id)
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  icon text not null,
  points integer not null default 0
);

create table public.user_achievements (
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  league_id uuid references public.leagues(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (achievement_id, user_id, league_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  checkin_id uuid references public.checkins(id) on delete set null,
  achievement_id uuid references public.achievements(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index league_members_user_id_idx on public.league_members(user_id);
create index checkins_league_user_date_idx on public.checkins(league_id, user_id, checked_in_on desc);
create index posts_league_created_at_idx on public.posts(league_id, created_at desc);
create index challenges_league_period_idx on public.challenges(league_id, starts_at, ends_at);

create or replace function public.is_league_member(target_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.league_members
    where league_id = target_league_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.join_league_by_code(target_code text)
returns public.leagues
language plpgsql
security definer
set search_path = public
as $$
declare
  target_league public.leagues;
begin
  select *
  into target_league
  from public.leagues
  where invite_code = upper(trim(target_code));

  if target_league.id is null then
    raise exception 'Liga nao encontrada';
  end if;

  insert into public.league_members (league_id, user_id, role)
  values (target_league.id, auth.uid(), 'member')
  on conflict (league_id, user_id) do nothing;

  return target_league;
end;
$$;

insert into public.achievements (code, title, description, icon, points)
values
  ('first_checkin', 'Primeiro treino', 'Fez o primeiro check-in na Gym League.', 'spark', 0),
  ('three_day_streak', '3 dias seguidos', 'Manteve uma sequência de tres dias.', 'flame', 0),
  ('ten_monthly_checkins', '10 treinos no mês', 'Completou dez treinos no mês.', 'medal', 0),
  ('weekly_legend', 'Lenda da semana', 'Terminou a semana no topo da liga.', 'crown', 0),
  ('consistency_king', 'Rei da constância', 'Mostrou consistência acima da média.', 'shield', 0),
  ('monday_never_miss', 'Nunca falta na segunda', 'Fez check-in na segunda-feira.', 'calendar', 0)
on conflict (code) do nothing;

alter table public.users enable row level security;
alter table public.leagues enable row level security;
alter table public.league_members enable row level security;
alter table public.checkins enable row level security;
alter table public.challenges enable row level security;
alter table public.user_challenges enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_likes enable row level security;

create policy "users can view league profiles" on public.users
for select using (
  id = auth.uid()
  or exists (
    select 1
    from public.league_members lm_self
    join public.league_members lm_other on lm_other.league_id = lm_self.league_id
    where lm_self.user_id = auth.uid()
      and lm_other.user_id = users.id
  )
);

create policy "users can update own profile" on public.users
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "users can insert own profile" on public.users
for insert with check (id = auth.uid());

create policy "members can view leagues" on public.leagues
for select using (is_public or public.is_league_member(id));

create policy "authenticated users create leagues" on public.leagues
for insert with check (owner_id = auth.uid());

create policy "owners update leagues" on public.leagues
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "members can view memberships" on public.league_members
for select using (public.is_league_member(league_id));

create policy "users can join leagues" on public.league_members
for insert with check (user_id = auth.uid());

create policy "members can view checkins" on public.checkins
for select using (public.is_league_member(league_id));

create policy "users create own checkins" on public.checkins
for insert with check (user_id = auth.uid() and public.is_league_member(league_id));

create policy "members can view challenges" on public.challenges
for select using (public.is_league_member(league_id));

create policy "league admins create challenges" on public.challenges
for insert with check (
  exists (
    select 1 from public.league_members
    where league_id = challenges.league_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  )
);

create policy "members view league challenge progress" on public.user_challenges
for select using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.challenges
    where challenges.id = user_challenges.challenge_id
      and public.is_league_member(challenges.league_id)
  )
);

create policy "users manage own challenge progress" on public.user_challenges
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "achievements are public to auth users" on public.achievements
for select using (auth.role() = 'authenticated');

create policy "users view league achievements" on public.user_achievements
for select using (user_id = auth.uid() or public.is_league_member(league_id));

create policy "users unlock own achievements" on public.user_achievements
for insert with check (user_id = auth.uid());

create policy "members can view posts" on public.posts
for select using (public.is_league_member(league_id));

create policy "members create own posts" on public.posts
for insert with check (user_id = auth.uid() and public.is_league_member(league_id));

create policy "members can view comments" on public.post_comments
for select using (
  exists (
    select 1 from public.posts
    where posts.id = post_comments.post_id
      and public.is_league_member(posts.league_id)
  )
);

create policy "members create own comments" on public.post_comments
for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.posts
    where posts.id = post_comments.post_id
      and public.is_league_member(posts.league_id)
  )
);

create policy "members can view likes" on public.post_likes
for select using (
  exists (
    select 1 from public.posts
    where posts.id = post_likes.post_id
      and public.is_league_member(posts.league_id)
  )
);

create policy "members create own likes" on public.post_likes
for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.posts
    where posts.id = post_likes.post_id
      and public.is_league_member(posts.league_id)
  )
);
