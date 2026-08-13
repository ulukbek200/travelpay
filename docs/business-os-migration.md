# TravelPay Business OS migration

Business OS is an incremental evolution of the existing TravelPay admin/business area. It must not become a second product with separate bookings, payments, users, tours, or properties.

## Phase 1 — Foundation

- Sidebar and role-aware navigation.
- Design system tokens, typography, radius, shadows, status color discipline.
- Business dashboard command center.
- Schedule day/week/month with resource grouping.
- Booking drawer and create-booking drawer.
- API service layer and query keys.
- Shared components and domain component shells.

## Phase 2 — CRM, payments, booking state

- Clients CRM and client timeline from existing users + `tourBookings` + `stayBookings`.
- Payments/cashbox from existing booking payment fields, wallet reservations, `payment-requests`, and `booking-refunds`.
- Booking state machine with independent booking/payment statuses and status history.

## Phase 3 — Properties

- Property/unit management on top of existing accommodations.
- Availability calendar using existing `stay-bookings` availability endpoints.
- Check-in/check-out defaults and stay-specific date logic.
- Pricing calendar, block dates, occupancy metrics.

## Phase 4 — Tours

- Tour operations module on top of existing tours.
- Departures, capacity, waitlist, participants.
- Operations checklist for guide/driver/vehicle/reminders.

## Phase 5 — Team and work management

- Team roles and centralized permissions.
- Work schedule, specialization, tasks.
- Role-aware access for managers, guides, drivers, accountants.

## Phase 6 — Growth layer

- Analytics, notifications, automation rules.
- Onboarding and contextual help.
- Activity log and command palette extensions.

## Marketplace ↔ Business OS linkage

Marketplace bookings and manual business bookings must write into the same backend collections:

- Tours: `tourBookings`
- Cottages/houses/stays: `stayBookings`
- Payments/prepayments: booking payment fields, wallet reservations, `payment-requests`
- Refunds: `booking-refunds`

When a customer books a tour from the marketplace, that same booking must appear in:

- Business Schedule
- Bookings
- Client Card
- Tour Departure
- Payments
- Analytics

When a customer books a cottage/house from the marketplace, that same booking must appear in:

- Business Schedule
- Property Calendar
- Bookings
- Client Card
- Payments
- Analytics

`bookingSource` is the canonical source marker:

- `travelpay_marketplace` — customer marketplace flow
- `manual` — business manager flow
- `instagram`, `whatsapp`, `phone`, `walk_in`, `website`, `manager`, `partner`, `other` — tracked external/manual sources

Legacy `travelpay` remains accepted as an alias for `travelpay_marketplace`.

## Safety rules

- Cancellation is not delete.
- Refund is not delete payment.
- Reschedule is not delete-and-recreate booking.
- Financial history must stay append-only unless there is a dedicated backend audit endpoint.
- Do not invent frontend fake APIs. If an endpoint does not exist, add it to backend or create an explicit adapter/TODO.
- Do not use mock data in production flows.
- Public TravelPay marketplace routes must keep working while Business OS evolves.

Default business timezone: `Asia/Bishkek`.
