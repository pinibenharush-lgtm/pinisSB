-- Lets you attach MULTIPLE files to a Trip Info card (previously only one
-- was supported, with no way to add a second once one existed). Moves
-- attachments into their own table and migrates any existing single
-- attachment into it. Run this once.
create table if not exists trip_info_files (
  id uuid primary key default gen_random_uuid(),
  trip_info_id uuid not null references trip_info(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  created_by text references people(id),
  created_at timestamptz not null default now()
);

alter table trip_info_files enable row level security;
drop policy if exists "allow all - trip_info_files" on trip_info_files;
create policy "allow all - trip_info_files" on trip_info_files for all using (true) with check (true);

alter publication supabase_realtime add table trip_info_files;

insert into trip_info_files (trip_info_id, file_url, file_name, created_by)
select id, file_url, file_name, created_by
from trip_info
where file_url is not null;

alter table trip_info drop column if exists file_url;
alter table trip_info drop column if exists file_name;
