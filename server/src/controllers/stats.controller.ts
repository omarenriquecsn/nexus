import type { Request, Response } from "express";
import { StatsService } from "../services/stats.service.js";

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const dasboardStats = await StatsService.totalDiagnostics();

    res.json({
      dasboardStats,
    });
  } catch (error) {
    res.status(500).json({ error: "Error calculando estadísticas" });
  }
};
