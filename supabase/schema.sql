-- Crete Trip App schema
-- Run this once in your Supabase project's SQL Editor (Supabase dashboard -> SQL Editor -> New query).
-- Safe to re-run: it drops and recreates the app's tables.

drop table if exists trip_info_files cascade;
drop table if exists trip_info cascade;
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

create table trip_info (
  id uuid primary key default gen_random_uuid(),
  icon text not null default '📌',
  title text not null,
  details text not null,
  created_by text references people(id),
  created_at timestamptz not null default now()
);

create table trip_info_files (
  id uuid primary key default gen_random_uuid(),
  trip_info_id uuid not null references trip_info(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  created_by text references people(id),
  created_at timestamptz not null default now()
);

insert into trip_info (icon, title, details, created_by) values
('✈️', 'Flight to Crete', $$Thu 3 Sep 2026
Depart Tel Aviv (Terminal 1) 14:45 → Arrive Heraklion 16:35
ISRAIR Airlines 6H 501, Economy (Class Q)
Seat 1A (Pini)$$, 'pini'),
('✈️', 'Flight back to Israel', $$Wed 9 Sep 2026
Depart Heraklion 12:40 → Arrive Tel Aviv 14:25
ISRAIR Airlines 6H 502, Economy (Class Q)
Seat 1A (Pini)$$, 'pini'),
('🏨', 'Hotel — Pilot Amphora Boutique Hotel', $$Indulge Room, 28m² · Flexible Rate with breakfast
Check-in: Thu 3 Sep 2026, from 14:00
Check-out: Wed 9 Sep 2026, until 12:00
Free cancellation until 18:00 (property time) on 20 Aug 2026 — after that the full amount is charged
Georgioupoli, Chania, Crete · Booking #61662686$$, 'pini'),
('🏖️', 'Pilot Beach Resort access', $$We can use the facilities at the neighboring Pilot Beach Resort. Our hotel rate also includes a one-time 20% discount voucher for spa treatments and for the resort's restaurants.$$, 'pini'),
('🚗', 'Car Rental — Gomega (Skoda Kamiq or similar)', $$Pick-up: Thu 3 Sep 2026, 16:00 — Heraklion Airport (direct; free shuttle, look out for a WhatsApp message with the meeting point)
Drop-off: Wed 9 Sep 2026, 10:30 — Heraklion Airport
Compact Crossover, Automatic, A/C, 5 seats, Gasoline
Premium Full Insurance (0€ risk/excess) · + Additional driver
Total: €301.80 · 30% deposit paid · €211.26 due at pick-up
Confirmation #0SHB18 · Driver: Pinchas Ben Harush
Bring: physical credit/debit card, driver's license, passport/ID, and this voucher$$, 'pini');

-- Storage bucket for files attached to Trip Info cards (e.g. voucher PDFs).
insert into storage.buckets (id, name, public)
values ('trip-files', 'trip-files', true)
on conflict (id) do nothing;

create policy "trip-files read" on storage.objects
  for select using (bucket_id = 'trip-files');
create policy "trip-files insert" on storage.objects
  for insert with check (bucket_id = 'trip-files');
create policy "trip-files delete" on storage.objects
  for delete using (bucket_id = 'trip-files');

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
alter table trip_info enable row level security;
alter table trip_info_files enable row level security;

create policy "allow all - people" on people for select using (true);

create policy "allow all - expenses" on expenses for all using (true) with check (true);
create policy "allow all - places" on places for all using (true) with check (true);
create policy "allow all - place_ratings" on place_ratings for all using (true) with check (true);
create policy "allow all - place_comments" on place_comments for all using (true) with check (true);
create policy "allow all - checklist_items" on checklist_items for all using (true) with check (true);
create policy "allow all - game_results" on game_results for all using (true) with check (true);
create policy "allow all - trip_info" on trip_info for all using (true) with check (true);
create policy "allow all - trip_info_files" on trip_info_files for all using (true) with check (true);

-- Realtime: let the app subscribe to live changes so all 3 phones stay in sync.
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table places;
alter publication supabase_realtime add table place_ratings;
alter publication supabase_realtime add table place_comments;
alter publication supabase_realtime add table checklist_items;
alter publication supabase_realtime add table game_results;
alter publication supabase_realtime add table trip_info;
alter publication supabase_realtime add table trip_info_files;
