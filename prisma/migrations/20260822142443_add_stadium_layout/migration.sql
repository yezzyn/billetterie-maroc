-- CreateTable
CREATE TABLE "StadiumSection" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "rows" INTEGER NOT NULL,
    "seatsPerRow" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "priceBase" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StadiumSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StadiumSeat" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "seatNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "StadiumSeat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StadiumSection_venueId_idx" ON "StadiumSection"("venueId");

-- CreateIndex
CREATE INDEX "StadiumSeat_sectionId_idx" ON "StadiumSeat"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "StadiumSeat_sectionId_rowNumber_seatNumber_key" ON "StadiumSeat"("sectionId", "rowNumber", "seatNumber");

-- AddForeignKey
ALTER TABLE "StadiumSection" ADD CONSTRAINT "StadiumSection_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StadiumSeat" ADD CONSTRAINT "StadiumSeat_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "StadiumSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
