create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  skin_type text,
  sensitivity text,
  goals text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  detected_conditions jsonb not null default '[]'::jsonb,
  confidence jsonb not null default '{}'::jsonb,
  raw_model_output text,
  created_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  morning_routine jsonb not null default '[]'::jsonb,
  evening_routine jsonb not null default '[]'::jsonb,
  caution_notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid references public.analyses(id) on delete set null,
  message text not null,
  response text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.analyses enable row level security;
alter table public.recommendations enable row level security;
alter table public.chat_messages enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_upsert_own" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "analyses_select_own" on public.analyses
for select using (auth.uid() = user_id);

create policy "analyses_insert_own" on public.analyses
for insert with check (auth.uid() = user_id);

create policy "recommendations_select_own" on public.recommendations
for select using (
  exists (
    select 1 from public.analyses a
    where a.id = recommendations.analysis_id and a.user_id = auth.uid()
  )
);

create policy "recommendations_insert_own" on public.recommendations
for insert with check (
  exists (
    select 1 from public.analyses a
    where a.id = recommendations.analysis_id and a.user_id = auth.uid()
  )
);

create policy "chat_messages_select_own" on public.chat_messages
for select using (auth.uid() = user_id);

create policy "chat_messages_insert_own" on public.chat_messages
for insert with check (auth.uid() = user_id);
