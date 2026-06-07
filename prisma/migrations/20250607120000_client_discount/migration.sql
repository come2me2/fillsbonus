-- AlterTable
ALTER TABLE "Order" ADD COLUMN "quoteAmount" DECIMAL(12,2),
ADD COLUMN "clientDiscountPercent" DECIMAL(5,2),
ADD COLUMN "clientDiscountAmount" DECIMAL(12,2);
