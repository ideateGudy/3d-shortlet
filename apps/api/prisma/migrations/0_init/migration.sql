-- Enable btree_gist extension for combining scalar and range types in gist indexes
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
CREATE TYPE "SectionType" AS ENUM ('PANORAMA', 'PHOTO');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
CREATE TYPE "BlockReason" AS ENUM ('MAINTENANCE', 'OWNER_STAY', 'OTHER');

-- CreateTable User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable Property
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL DEFAULT 1,
    "bathrooms" INTEGER NOT NULL DEFAULT 1,
    "maxGuests" INTEGER NOT NULL DEFAULT 2,
    "pricePerNight" DOUBLE PRECISION NOT NULL,
    "cleaningFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minNights" INTEGER NOT NULL DEFAULT 1,
    "maxNights" INTEGER NOT NULL DEFAULT 30,
    "rules" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable Amenity
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable PropertySection
CREATE TABLE "PropertySection" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" "SectionType" NOT NULL DEFAULT 'PANORAMA',
    "imageUrl" TEXT NOT NULL,
    "initialYaw" DOUBLE PRECISION DEFAULT 0,
    "initialPitch" DOUBLE PRECISION DEFAULT 0,
    "hotspots" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable Booking
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestPhone" TEXT NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "checkIn" DATE NOT NULL,
    "checkOut" DATE NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "cleaningFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nights" INTEGER NOT NULL DEFAULT 1,
    "holdExpiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable BlockedDate
CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reason" "BlockReason" NOT NULL DEFAULT 'MAINTENANCE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
CREATE INDEX "PropertySection_propertyId_order_idx" ON "PropertySection"("propertyId", "order");
CREATE INDEX "Booking_propertyId_status_idx" ON "Booking"("propertyId", "status");
CREATE INDEX "BlockedDate_propertyId_idx" ON "BlockedDate"("propertyId");

-- AddForeignKey
ALTER TABLE "Amenity" ADD CONSTRAINT "Amenity_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertySection" ADD CONSTRAINT "PropertySection_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add Exclusion Constraint for Double Booking Prevention
-- Prevents overlapping [checkIn, checkOut) for the same propertyId on CONFIRMED or PENDING holds
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "no_overlapping_bookings";

ALTER TABLE "Booking" ADD CONSTRAINT "no_overlapping_bookings"
EXCLUDE USING gist (
  "propertyId" WITH =,
  daterange("checkIn", "checkOut", '[)') WITH &&
) WHERE ("status" IN ('CONFIRMED', 'PENDING'));

