-- Adds the shared "Trip info" board (flight/hotel details + anything you
-- add manually) and seeds it with your actual flight and hotel booking
-- details. Safe to run on an existing project: it only adds a new table,
-- it does not touch any existing data. Run this once — running it twice
-- will duplicate the seeded cards below.
create table if not exists trip_info (
  id uuid primary key default gen_random_uuid(),
  icon text not null default '📌',
  title text not null,
  details text not null,
  created_by text references people(id),
  created_at timestamptz not null default now()
);

alter table trip_info enable row level security;

drop policy if exists "allow all - trip_info" on trip_info;
create policy "allow all - trip_info" on trip_info for all using (true) with check (true);

alter publication supabase_realtime add table trip_info;

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
('🏖️', 'Pilot Beach Resort access', $$We can use the facilities at the neighboring Pilot Beach Resort. Our hotel rate also includes a one-time 20% discount voucher for spa treatments and for the resort's restaurants.$$, 'pini');
