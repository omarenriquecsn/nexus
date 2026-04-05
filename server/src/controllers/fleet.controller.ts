import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getFleetSummary = async (req: Request, res: Response) => {
  const { ownerId } = req.params;
  const clientId = Array.isArray(ownerId) ? ownerId[0] : ownerId;

  if (!clientId) {
    return res.status(400).json({ error: 'ID del cliente requerido.' });
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { ownerId: clientId },
      select: {
        plate: true,
        diagnostics: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            faultCode: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    const summary = {
      totalVehicles: vehicles.length,
      counts: {
        RED: 0,
        YELLOW: 0,
        GREEN: 0,
      },
      groups: {
        RED: [] as Array<{ plate: string; issue: string; lastFailure?: string }> ,
        YELLOW: [] as Array<{ plate: string }>,
        GREEN: [] as Array<{ plate: string }>,
      },
    };

    vehicles.forEach((vehicle: { diagnostics: any[]; plate: any; }) => {
      const latest = vehicle.diagnostics[0];
      const isCritical = Boolean(latest?.faultCode);
      const hasDiagnosis = Boolean(latest);

      if (isCritical) {
        summary.counts.RED += 1;
        summary.groups.RED.push({
          plate: vehicle.plate,
          issue: latest?.description ?? 'Falla no reportada',
          lastFailure: latest?.createdAt.toLocaleString() ?? 'Sin registro',
        });
      } else if (!hasDiagnosis) {
        summary.counts.YELLOW += 1;
        summary.groups.YELLOW.push({ plate: vehicle.plate });
      } else {
        summary.counts.GREEN += 1;
        summary.groups.GREEN.push({ plate: vehicle.plate });
      }
    });

    return res.json(summary);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al generar el resumen de flota.' });
  }
};
