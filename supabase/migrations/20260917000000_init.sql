-- ReverseTutor — Initial schema (Tahap 0, sesuai docs/SCHEMA.md)
-- Jalankan di Supabase SQL Editor, atau lewat `supabase db push` jika CLI sudah ter-link.
-- Script ini idempotent, aman dijalankan ulang.

-- ============================================================
-- TABEL
-- ============================================================

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  raw_material text not null,
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('ringkasan', 'kuis', 'reverse_bot', 'qa')),
  transcript jsonb not null default '[]'::jsonb,
  result_summary jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.understanding_map (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  sub_topic text not null,
  score integer not null check (score >= 0 and score <= 100),
  label text check (label is null or label in ('merah', 'kuning', 'hijau')),
  note text,
  updated_at timestamptz not null default now(),
  unique (topic_id, sub_topic)
);

create table if not exists public.score_history (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  sub_topic text not null,
  score integer not null check (score >= 0 and score <= 100),
  session_id uuid references public.sessions (id) on delete set null,
  recorded_at timestamptz not null default now()
);

create table if not exists public.learning_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  insights jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now()
);

-- ============================================================
-- INDEX
-- ============================================================

create index if not exists topics_user_last_accessed_idx
  on public.topics (user_id, last_accessed_at desc);

create index if not exists sessions_user_topic_idx
  on public.sessions (user_id, topic_id);

create index if not exists understanding_map_user_topic_idx
  on public.understanding_map (user_id, topic_id);

create index if not exists score_history_user_topic_sub_topic_idx
  on public.score_history (user_id, topic_id, sub_topic, recorded_at);

-- ============================================================
-- TRIGGER updated_at (understanding_map ditimpa via upsert;
-- pastikan updated_at selalu ikut berubah tanpa bergantung payload client)
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists understanding_map_set_updated_at on public.understanding_map;
create trigger understanding_map_set_updated_at
  before update on public.understanding_map
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — WAJIB. User hanya bisa akses baris miliknya.
-- ============================================================

alter table public.topics enable row level security;
alter table public.sessions enable row level security;
alter table public.understanding_map enable row level security;
alter table public.score_history enable row level security;
alter table public.learning_profile enable row level security;

drop policy if exists "Users manage own topics" on public.topics;
create policy "Users manage own topics" on public.topics
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own sessions" on public.sessions;
create policy "Users manage own sessions" on public.sessions
  for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.topics t
      where t.id = topic_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own understanding_map" on public.understanding_map;
create policy "Users manage own understanding_map" on public.understanding_map
  for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.topics t
      where t.id = topic_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own score_history" on public.score_history;
create policy "Users manage own score_history" on public.score_history
  for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.topics t
      where t.id = topic_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own learning_profile" on public.learning_profile;
create policy "Users manage own learning_profile" on public.learning_profile
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
