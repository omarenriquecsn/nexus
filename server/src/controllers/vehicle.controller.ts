import type { Request, Response } from "express";
import { VehicleService } from "../services/vehicle.service.js";

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const vehicle = await VehicleService.createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      res
        .status(400)
        .json({ error: "La placa ya está registrada en el sistema." });
    } else {
      res.status(500).json({ error: "Error al registrar el vehículo." });
    }
  }
};

export const getVehicleByPlate = async (req: Request, res: Response) => {
  try {
    const { plate } = req.params;

    // VALIDACIÓN: Si por alguna razón extraña plate no es un string único
    if (typeof plate !== "string") {
      return res.status(400).json({ error: "Formato de placa inválido." });
    }

    const vehicle = await VehicleService.getByPlate(plate);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no encontrado." });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar el vehículo." });
  }
};
