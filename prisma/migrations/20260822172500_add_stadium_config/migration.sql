-- CreateTable
CREATE TABLE "StadiumConfig" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shape" TEXT NOT NULL,
    "fieldWidth" INTEGER NOT NULL,
    "fieldLength" INTEGER NOT NULL,
    "totalCapacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StadiumConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StadiumZoneConfig" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "shape" TEXT NOT NULL,
    "position" JSONB NOT NULL,
    "color" TEXT NOT NULL,
    "borderColor" TEXT,
    "rows" INTEGER NOT NULL,
    "seatsPerRow" INTEGER NOT NULL,
    "rowLabeling" TEXT NOT NULL,
    "entrance" TEXT,
    "gate" TEXT,
    "access" TEXT,
    "block" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StadiumZoneConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StadiumConfig_venueId_idx" ON "StadiumConfig"("venueId");

-- CreateIndex
CREATE INDEX "StadiumZoneConfig_configId_idx" ON "StadiumZoneConfig"("configId");

-- AddForeignKey
ALTER TABLE "StadiumConfig" ADD CONSTRAINT "StadiumConfig_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StadiumZoneConfig" ADD CONSTRAINT "StadiumZoneConfig_configId_fkey" FOREIGN KEY ("configId") REFERENCES "StadiumConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

