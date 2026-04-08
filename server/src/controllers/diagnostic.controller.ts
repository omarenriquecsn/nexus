import type { Request, Response } from "express";
import { DiagnosticService } from "../services/diagnostic.service.js";

export const createDiagnostic = async (req: Request, res: Response) => {
  try {
    const { vehicleId, description } = req.body;

    if (!vehicleId || !description) {
      return res.status(400).json({
        error: "Faltan campos obligatorios: vehicleId y description.",
      });
    }

    const newDiagnostic = await DiagnosticService.createDiagnostic(req.body);
    res.status(201).json(newDiagnostic);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al registrar el diagnóstico técnico." });
  }
};

export const getDiagnostics = async (_req: Request, res: Response) => {
  try {
    const data = await DiagnosticService.getAllDiagnostics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener diagnósticos" });
  }
};

export const getPriorityDiagnostics = async (_req: Request, res: Response) => {
  try {
    const data = await DiagnosticService.getPriorityDiagnostics();
    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al obtener diagnósticos prioritarios" });
  }
};

export const getCriticalDiagnostics = async (_req: Request, res: Response) => {
  try {
    const data = await DiagnosticService.getCriticalDiagnostics();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener diagnósticos críticos" });
  }
};

export const confirmDiagnosticDelivery = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const body = req.body || {}

    const { reportImageUrl } = body;

    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ error: "ID de diagnóstico faltante o inválido." });
    }

      const updatedDiagnostic = await DiagnosticService.confirmDelivery(
        id,
        reportImageUrl,
      );
      res.json(updatedDiagnostic);
    
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al confirmar la entrega del diagnóstico." });
  }
};

export const getPublicDiagnostic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ error: "ID de diagnóstico faltante o inválido." });
    }

    const diagnostic = await DiagnosticService.getPublicDiagnostic(id);
    if (!diagnostic) {
      return res.status(404).json({ error: "Diagnóstico no encontrado." });
    }

    res.json(diagnostic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el reporte público." });
  }
};

export const acceptDiagnosticReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ error: "ID de diagnóstico faltante o inválido." });
    }

    const confirmed = await DiagnosticService.acceptDiagnostic(id);
    res.json(confirmed);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al confirmar la recepción del reporte." });
  }
};
