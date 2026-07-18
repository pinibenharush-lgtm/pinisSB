-- Lets you attach a file (like a voucher PDF) to any Trip Info card.
-- Adds file_url/file_name columns to trip_info, and a public Storage
-- bucket the app uploads into using the same anon key as everything
-- else. Safe to run on an existing project: it only adds columns and
-- a new bucket, it does not touch any existing data.
alter table trip_info add column if not exists file_url text;
alter table trip_info add column if not exists file_name text;

insert into storage.buckets (id, name, public)
values ('trip-files', 'trip-files', true)
on conflict (id) do nothing;

drop policy if exists "trip-files read" on storage.objects;
create policy "trip-files read" on storage.objects
  for select using (bucket_id = 'trip-files');

drop policy if exists "trip-files insert" on storage.objects;
create policy "trip-files insert" on storage.objects
  for insert with check (bucket_id = 'trip-files');

drop policy if exists "trip-files delete" on storage.objects;
create policy "trip-files delete" on storage.objects
  for delete using (bucket_id = 'trip-files');
