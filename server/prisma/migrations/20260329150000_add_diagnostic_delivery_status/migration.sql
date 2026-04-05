-- Add deliveredAt and isAccepted to Diagnostic
ALTER TABLE "Diagnostic"
ADD COLUMN "deliveredAt" TIMESTAMP(3);

ALTER TABLE "Diagnostic"
ADD COLUMN "isAccepted" BOOLEAN NOT NULL DEFAULT false;
