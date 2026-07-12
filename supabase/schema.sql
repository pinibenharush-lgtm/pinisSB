-- Crete Trip App schema
-- Run this once in your Supabase project's SQL Editor (Supabase dashboard -> SQL Editor -> New query).
-- Safe to re-run: it drops and recreates the app's tables.

drop table if exists game_results cascade;
drop table if exists checklist_items cascade;
drop table if exists place_comments cascade;
drop table if exists place_ratings cascade;
drop table if exists places cascade;
drop table if exists expenses cascade;
drop table if exists people cascade;

create table people (
  id text primary key,
  name text not null
);

insert into people (id, name) values
  ('pini', 'Pini'),
  ('sean', 'Sean'),
  ('ori', 'Ori');

create table expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric(10, 2) not null check (amount > 0),
  currency text not null default 'EUR',
  paid_by text not null references people(id),
  participants text[] not null,
  split_mode text not null default 'three_way' check (split_mode in ('three_way', 'couple')),
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  link text,
  notes text,
  visited boolean not null default false,
  lat double precision,
  lng double precision,
  created_by text references people(id),
  created_at timestamptz not null default now()
);

create table place_ratings (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  person_id text not null references people(id),
  rating int not null check (rating between 1 and 5),
  unique (place_id, person_id)
);

create table place_comments (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  person_id text not null references people(id),
  comment text not null,
  created_at timestamptz not null default now()
);

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  done boolean not null default false,
  done_by text references people(id),
  created_by text references people(id),
  created_at timestamptz not null default now()
);

create table game_results (
  id uuid primary key default gen_random_uuid(),
  game_date date not null,
  person_id text not null references people(id),
  seconds int not null check (seconds > 0),
  created_at timestamptz not null default now(),
  unique (game_date, person_id)
);

-- Row Level Security
-- This app has no login system (the 3 of you just pick your name in the UI),
-- so access control relies on the Supabase URL + anon key not being shared publicly.
-- These policies allow anyone with that key to read/write all trip data.
alter table people enable row level security;
alter table expenses enable row level security;
alter table places enable row level security;
alter table place_ratings enable row level security;
alter table place_comments enable row level security;
alter table checklist_items enable row level security;
alter table game_results enable row level security;

create policy "allow all - people" on people for select using (true);

create policy "allow all - expenses" on expenses for all using (true) with check (true);
create policy "allow all - places" on places for all using (true) with check (true);
create policy "allow all - place_ratings" on place_ratings for all using (true) with check (true);
create policy "allow all - place_comments" on place_comments for all using (true) with check (true);
create policy "allow all - checklist_items" on checklist_items for all using (true) with check (true);
create policy "allow all - game_results" on game_results for all using (true) with check (true);

-- Realtime: let the app subscribe to live changes so all 3 phones stay in sync.
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table places;
alter publication supabase_realtime add table place_ratings;
alter publication supabase_realtime add table place_comments;
alter publication supabase_realtime add table checklist_items;
alter publication supabase_realtime add table game_results;
