/*
  Warnings:

  - A unique constraint covering the columns `[mpesaCheckoutRequestId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN "mpesaCheckoutRequestId" TEXT;
ALTER TABLE "Order" ADD COLUMN "mpesaReceiptNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN "mpesaResultDesc" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_mpesaCheckoutRequestId_key" ON "Order"("mpesaCheckoutRequestId");
