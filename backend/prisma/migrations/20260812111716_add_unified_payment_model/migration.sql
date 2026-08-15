-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "callbackData" TEXT;
ALTER TABLE "Payment" ADD COLUMN "merchantRequestId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "rawPayload" TEXT;
