ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "no_overlapping_bookings";

ALTER TABLE "Booking" ADD CONSTRAINT "no_overlapping_bookings"
EXCLUDE USING gist (
  "propertyId" WITH =,
  daterange("checkIn", "checkOut", '[)') WITH &&
) WHERE ("status" IN ('CONFIRMED', 'PENDING'));
