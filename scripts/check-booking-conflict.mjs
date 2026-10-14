import { findConflictingBooking } from "../src/lib/bookings.ts";

const booking = findConflictingBooking(
  1,
  "2026-10-20",
  "2026-10-23"
);

console.log("冲突订单：", booking);