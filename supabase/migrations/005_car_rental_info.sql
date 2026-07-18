-- Adds the car rental details as a Trip Info card. Safe to run on an
-- existing project — it's just one more row in trip_info, like the ones
-- you can add from the app's "+ Add info" button. Run once (running it
-- twice will add the card twice).
insert into trip_info (icon, title, details, created_by) values
('🚗', 'Car Rental — Gomega (Skoda Kamiq or similar)', $$Pick-up: Thu 3 Sep 2026, 16:00 — Heraklion Airport (direct; free shuttle, look out for a WhatsApp message with the meeting point)
Drop-off: Wed 9 Sep 2026, 10:30 — Heraklion Airport
Compact Crossover, Automatic, A/C, 5 seats, Gasoline
Premium Full Insurance (0€ risk/excess) · + Additional driver
Total: €301.80 · 30% deposit paid · €211.26 due at pick-up
Confirmation #0SHB18 · Driver: Pinchas Ben Harush
Bring: physical credit/debit card, driver's license, passport/ID, and this voucher$$, 'pini');
