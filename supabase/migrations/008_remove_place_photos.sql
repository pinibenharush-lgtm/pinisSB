-- Removes the place-photo feature entirely: drops the photo_url column
-- from places, deletes any uploaded/auto-fetched photos, and removes the
-- place-photos storage bucket. Optional — the app no longer reads or
-- writes any of this either way, so you can skip this if you'd rather not
-- touch the database. Safe to run more than once.
alter table places drop column if exists photo_url;

delete from storage.objects where bucket_id = 'place-photos';
delete from storage.buckets where id = 'place-photos';

drop policy if exists "place-photos read" on storage.objects;
drop policy if exists "place-photos insert" on storage.objects;
drop policy if exists "place-photos delete" on storage.objects;
