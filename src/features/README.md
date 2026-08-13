# TravelPay Business OS feature modules

This folder is the migration target for Business OS domains. New business logic should live here first, then pages can compose it.

Current domains:

- `bookings` — booking state machine, drawers, availability, debt/refund UI.
- `schedule` — day/week/month/resource calendar, mobile agenda.
- `clients` — Travel CRM, client card, wallet/timeline/tags.
- `properties` — properties, units, pricing, occupancy, block dates.
- `tours` — tours, departures, capacity, waitlist, participants, operations checklist.
- `payments` — cashbox, QR/manual/card/wallet payments, refunds.
- `analytics` — KPIs, charts, business performance.
- `team` — roles, schedules, specializations.
- `tasks` — kanban/list, automation tasks.

Rule of thumb: `pages/ActualToursAdmin.js` should increasingly become an orchestration shell, not a home for new domain behavior.
