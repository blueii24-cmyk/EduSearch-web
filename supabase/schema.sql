create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  education text,
  year text,
  percentage numeric,
  location text,
  skills jsonb not null default '[]'::jsonb,
  interests jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  area text,
  latitude double precision,
  longitude double precision,
  description text,
  courses jsonb not null default '[]'::jsonb,
  study_levels jsonb not null default '[]'::jsonb,
  accepted_education jsonb not null default '[]'::jsonb,
  minimum_percentage numeric,
  entrance_required boolean not null default false,
  fees_per_year numeric,
  admission_status text,
  application_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text,
  area text,
  latitude double precision,
  longitude double precision,
  description text,
  category text,
  required_skills jsonb not null default '[]'::jsonb,
  preferred_skills jsonb not null default '[]'::jsonb,
  education_requirements jsonb not null default '[]'::jsonb,
  experience text,
  fresher_friendly boolean not null default false,
  job_type text,
  salary text,
  application_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text,
  area text,
  latitude double precision,
  longitude double precision,
  description text,
  category text,
  required_skills jsonb not null default '[]'::jsonb,
  preferred_skills jsonb not null default '[]'::jsonb,
  education_requirements jsonb not null default '[]'::jsonb,
  experience text,
  fresher_friendly boolean not null default true,
  internship_type text,
  stipend text,
  duration text,
  application_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('college', 'job', 'internship')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  student_id text,
  entity_type text,
  entity_id uuid,
  feedback_type text,
  rating text,
  reasons jsonb not null default '[]'::jsonb,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  student_id text,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.colleges enable row level security;
alter table public.jobs enable row level security;
alter table public.internships enable row level security;
alter table public.saved_items enable row level security;
alter table public.feedback enable row level security;
alter table public.interactions enable row level security;

drop policy if exists "Public can read colleges" on public.colleges;
drop policy if exists "Public can read jobs" on public.jobs;
drop policy if exists "Public can read internships" on public.internships;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can read own saved items" on public.saved_items;
drop policy if exists "Users can insert own saved items" on public.saved_items;
drop policy if exists "Users can delete own saved items" on public.saved_items;
drop policy if exists "Users can insert own feedback" on public.feedback;
drop policy if exists "Users can read own feedback" on public.feedback;
drop policy if exists "Users can insert own interactions" on public.interactions;
drop policy if exists "Users can read own interactions" on public.interactions;

create policy "Public can read colleges" on public.colleges for select to anon, authenticated using (true);
create policy "Public can read jobs" on public.jobs for select to anon, authenticated using (true);
create policy "Public can read internships" on public.internships for select to anon, authenticated using (true);

create policy "Users can read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can read own saved items" on public.saved_items for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own saved items" on public.saved_items for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete own saved items" on public.saved_items for delete to authenticated using (auth.uid() = user_id);
create policy "Users can insert own feedback" on public.feedback for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can read own feedback" on public.feedback for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own interactions" on public.interactions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can read own interactions" on public.interactions for select to authenticated using (auth.uid() = user_id);
