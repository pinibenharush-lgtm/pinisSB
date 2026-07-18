-- Adds the shared daily "Tut" (strawberry region-puzzle) game results
-- table. Safe to run on an existing project: it only adds a new table,
-- it does not touch any existing data.
create table if not exists tut_results (
  id uuid primary key default gen_random_uuid(),
  game_date date not null,
  person_id text not null references people(id),
  seconds int not null check (seconds > 0),
  created_at timestamptz not null default now(),
  unique (game_date, person_id)
);

alter table tut_results enable row level security;

drop policy if exists "allow all - tut_results" on tut_results;
create policy "allow all - tut_results" on tut_results for all using (true) with check (true);

alter publication supabase_realtime add table tut_results;
