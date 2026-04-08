import { prisma } from "../config/db.js";

export const StatsService = {
  async totalDiagnostics() {
    const totalDiagnostics = await prisma.diagnostic.count();

    // Diagnósticos de este mes
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const monthDiagnostics = await prisma.diagnostic.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    // Conteo de GNV (especialidad)
    const gnvCount = await prisma.diagnostic.count({
      where: { gnvPressure: { not: null } },
    });
    return {
      totalDiagnostics,
      monthDiagnostics,
      gnvRatio: totalDiagnostics > 0 ? (gnvCount / totalDiagnostics) * 100 : 0,
      monthlyGoal: 600, // Tu meta de 600$
    };
  },
};
