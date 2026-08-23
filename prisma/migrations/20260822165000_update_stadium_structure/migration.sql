-- DropForeignKey
ALTER TABLE "StadiumSeat" DROP CONSTRAINT "StadiumSeat_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "StadiumSection" DROP CONSTRAINT "StadiumSection_venueId_fkey";

-- DropIndex
DROP INDEX "StadiumSeat_sectionId_idx";

-- DropIndex
DROP INDEX "StadiumSeat_sectionId_rowNumber_seatNumber_key";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "access" TEXT,
ADD COLUMN     "block" TEXT,
ADD COLUMN     "entrance" TEXT,
ADD COLUMN     "gate" TEXT,
ADD COLUMN     "rowLetter" TEXT,
ADD COLUMN     "seatLabel" TEXT;

-- AlterTable
ALTER TABLE "Seat" ADD COLUMN     "access" TEXT,
ADD COLUMN     "block" TEXT,
ADD COLUMN     "entrance" TEXT,
ADD COLUMN     "gate" TEXT,
ADD COLUMN     "rowLetter" TEXT;

-- AlterTable
ALTER TABLE "StadiumSeat" DROP COLUMN "rowNumber",
DROP COLUMN "sectionId",
ADD COLUMN     "rowLetter" TEXT NOT NULL,
ADD COLUMN     "zoneId" TEXT NOT NULL,
ALTER COLUMN "seatNumber" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "StadiumSection";

-- CreateTable
CREATE TABLE "StadiumZone" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entrance" TEXT NOT NULL,
    "gate" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "color" TEXT NOT NULL,
    "rows" INTEGER NOT NULL,
    "seatsPerRow" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StadiumZone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StadiumZone_venueId_idx" ON "StadiumZone"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "StadiumZone_venueId_block_key" ON "StadiumZone"("venueId", "block");

-- CreateIndex
CREATE INDEX "StadiumSeat_zoneId_idx" ON "StadiumSeat"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "StadiumSeat_zoneId_rowLetter_seatNumber_key" ON "StadiumSeat"("zoneId", "rowLetter", "seatNumber");

-- AddForeignKey
ALTER TABLE "StadiumZone" ADD CONSTRAINT "StadiumZone_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StadiumSeat" ADD CONSTRAINT "StadiumSeat_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "StadiumZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

