-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'LUXURY_APARTMENT',
ADD COLUMN     "cautionDeposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "city" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "has247Power" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasChef" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasPool" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasSecurity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasWifi" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hostAvatar" TEXT,
ADD COLUMN     "hostIsSuperhost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hostName" TEXT,
ADD COLUMN     "hostResponseTime" TEXT,
ADD COLUMN     "neighborhood" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "neighborhoodHighlights" TEXT[],
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.9,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "serviceFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestAvatar" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "comment" TEXT NOT NULL,
    "stayDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_propertyId_idx" ON "Review"("propertyId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
