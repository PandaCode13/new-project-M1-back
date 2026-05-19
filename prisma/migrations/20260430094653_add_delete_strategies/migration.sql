-- DropForeignKey
ALTER TABLE "roller_coasters" DROP CONSTRAINT "roller_coasters_parkId_fkey";

-- AddForeignKey
ALTER TABLE "roller_coasters" ADD CONSTRAINT "roller_coasters_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "parks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
