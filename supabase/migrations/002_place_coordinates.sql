-- Adds map coordinates to places. Safe to run on an existing project:
-- it only adds columns, it does not touch or delete any existing rows.
alter table places add column if not exists lat double precision;
alter table places add column if not exists lng double precision;
