-- Re-adds manual photo uploads for places (previously added in migration
-- 007, then removed in migration 008). Adds a photo_url column to places,
-- and a public Storage bucket the app uploads into using the same anon
-- key as everything else. Safe to run on an existing project: it only
-- adds a column and a new bucket, it does not touch any existing data.
alter table places add column if not exists photo_url text;

insert into storage.buckets (id, name, public)
values ('place-photos', 'place-photos', true)
on conflict (id) do nothing;

drop policy if exists "place-photos read" on storage.objects;
create policy "place-photos read" on storage.objects
  for select using (bucket_id = 'place-photos');

drop policy if exists "place-photos insert" on storage.objects;
create policy "place-photos insert" on storage.objects
  for insert with check (bucket_id = 'place-photos');

drop policy if exists "place-photos delete" on storage.objects;
create policy "place-photos delete" on storage.objects
  for delete using (bucket_id = 'place-photos');
