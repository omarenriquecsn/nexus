import { prisma } from "../config/db.js";

export const ToolService = {
  async cretaeLoan(
    toolName: string,
    borrowerName: string,
    borrowerPhone: string,
  ) {
    const loan = await prisma.toolLoan.create({
      data: { toolName, borrowerName, borrowerPhone, status: "BORROWED" },
    });
  },

  async returnTool(id: string) {
    const updated = await prisma.toolLoan.update({
      where: {
        id: id as string, // Aquí ya TS está tranquilo
      },
      data: {
        status: "RETURNED",
        returnDate: new Date(),
      },
    });
    return updated;
  },

  async getActiveLoans() {
    const loans = await prisma.toolLoan.findMany({
    where: { status: 'BORROWED' },
    orderBy: { loanDate: 'desc' }
  });
  return loans;
  }
};
