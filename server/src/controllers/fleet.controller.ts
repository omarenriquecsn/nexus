import type { Request, Response } from "express";
import { fleetService } from "@/services/fleet.service.js";

export const getFleetSummary = async (req: Request, res: Response) => {
  const { ownerId } = req.params;
  const clientId = Array.isArray(ownerId) ? ownerId[0] : ownerId;

  if (!clientId) {
    return res.status(400).json({ error: "ID del cliente requerido." });
  }

  try {
    const summary = await fleetService.getFleetSummary(clientId);

    return res.json(summary);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Error al generar el resumen de flota." });
  }
};
