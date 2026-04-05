import type { Request, Response } from "express";
import { prisma } from "../config/db";

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
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

    res.json({
      totalDiagnostics,
      monthDiagnostics,
      gnvRatio: totalDiagnostics > 0 ? (gnvCount / totalDiagnostics) * 100 : 0,
      monthlyGoal: 600, // Tu meta de 600$
    });
  } catch (error) {
    res.status(500).json({ error: "Error calculando estadísticas" });
  }
};
