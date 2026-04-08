// server/src/controllers/toolController.ts
import type { Request, Response } from "express";
import { ToolService } from "../services/tool.service.js";

export const createLoan = async (req: Request, res: Response) => {
  const { toolName, borrowerName, borrowerPhone } = req.body;
  try {
    const loan = await ToolService.cretaeLoan(
      toolName as string,
      borrowerName as string,
      borrowerPhone as string,
    );
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar préstamo" });
  }
};

export const returnTool = async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1. Extraemos el ID de forma segura: si es array, tomamos el primero; si es string, lo usamos.
  const idToUpdate = Array.isArray(id) ? id[0] : id;

  // 2. Verificación de existencia para que TS no se queje de 'undefined'
  if (!idToUpdate) {
    return res.status(400).json({ error: "ID de préstamo no proporcionado" });
  }

  try {
    const updated = await ToolService.returnTool(idToUpdate as string);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error al devolver herramienta" });
  }
};

export const getActiveLoans = async (_req: Request, res: Response) => {
  try {
    const loans = await ToolService.getActiveLoans();
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: "Error  al obtener préstamos activos" });
  }
};
