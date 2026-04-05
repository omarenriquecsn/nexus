-- CreateTable
CREATE TABLE "ToolLoan" (
    "id" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "borrowerName" TEXT NOT NULL,
    "loanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" TIMESTAMP(3),
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'BORROWED',

    CONSTRAINT "ToolLoan_pkey" PRIMARY KEY ("id")
);
