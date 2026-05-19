-- CreateTable
CREATE TABLE "parks" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roller_coasters" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "heightRequirementCm" INTEGER NOT NULL,
    "maxSpeedKmh" DOUBLE PRECISION NOT NULL,
    "thrillLevel" INTEGER NOT NULL DEFAULT 1,
    "isOperational" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parkId" TEXT NOT NULL,

    CONSTRAINT "roller_coasters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "parkId" TEXT NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "roller_coasters" ADD CONSTRAINT "roller_coasters_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "parks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "parks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
