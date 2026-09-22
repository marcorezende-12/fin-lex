-- DropIndex
DROP INDEX "Transaction_userId_dueDate_idx";

-- DropIndex
DROP INDEX "Transaction_userId_idx";

-- DropIndex
DROP INDEX "Transaction_userId_type_status_idx";

-- CreateIndex
CREATE INDEX "Transaction_userId_deletedAt_dueDate_idx" ON "Transaction"("userId", "deletedAt", "dueDate");

-- CreateIndex
CREATE INDEX "Transaction_userId_deletedAt_type_status_idx" ON "Transaction"("userId", "deletedAt", "type", "status");

-- CreateIndex
CREATE INDEX "Transaction_clientId_deletedAt_idx" ON "Transaction"("clientId", "deletedAt");
