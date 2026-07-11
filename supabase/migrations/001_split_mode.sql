-- Adds the "split_mode" column used for the Pini vs Sean+Ori pocket split.
-- Safe to run on an existing project: it only adds a column, it does not
-- touch or delete any existing rows.
alter table expenses
  add column if not exists split_mode text not null default 'three_way'
    check (split_mode in ('three_way', 'couple'));
