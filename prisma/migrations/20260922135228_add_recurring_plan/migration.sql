-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'RECURRING';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "recurringPlanId" TEXT;

-- CreateTable
CREATE TABLE "RecurringPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amountInCents" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'PIX',
    "dayOfMonth" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastGeneratedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RecurringPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringPlan_userId_idx" ON "RecurringPlan"("userId");

-- CreateIndex
CREATE INDEX "RecurringPlan_active_idx" ON "RecurringPlan"("active");

-- CreateIndex
CREATE INDEX "RecurringPlan_deletedAt_idx" ON "RecurringPlan"("deletedAt");

-- CreateIndex
CREATE INDEX "Transaction_recurringPlanId_idx" ON "Transaction"("recurringPlanId");

-- AddForeignKey
ALTER TABLE "RecurringPlan" ADD CONSTRAINT "RecurringPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recurringPlanId_fkey" FOREIGN KEY ("recurringPlanId") REFERENCES "RecurringPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
