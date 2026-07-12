-- Adds the shared daily-game results table. Safe to run on an existing
-- project: it only adds a new table, it does not touch any existing data.
create table if not exists game_results (
  id uuid primary key default gen_random_uuid(),
  game_date date not null,
  person_id text not null references people(id),
  seconds int not null check (seconds > 0),
  created_at timestamptz not null default now(),
  unique (game_date, person_id)
);

alter table game_results enable row level security;

drop policy if exists "allow all - game_results" on game_results;
create policy "allow all - game_results" on game_results for all using (true) with check (true);

alter publication supabase_realtime add table game_results;
