import type { Request, Response } from "express";
import { ClientService } from "../services/client.service.js";

export const createClient = async (req: Request, res: Response) => {
  try {
    const newClient = await ClientService.createClient(req.body);
    res.status(201).json(newClient);
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ error: "Error al crear el cliente. ¿Email duplicado?" });
  }
};

export const getClients = async (_req: Request, res: Response) => {
  try {
    const clients = await ClientService.getAllClients();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};

// En tu controlador de clientes (clients.controller.ts)
export const searchClients = async (req: Request, res: Response) => {
  const { query } = req.query; // Lo que escribes: "jose"

  try {
    const clients = await ClientService.getClientByName(query as string);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar clientes" });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  const clientId = Array.isArray(id) ? id[0] : id;
  if (!clientId) {
    return res.status(400).json({ error: "ID de cliente no proporcionado" });
  }

  try {
    const updatedClient = await ClientService.updateClient(clientId as string, {
      name,
      email,
      phone,
    });
    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el cliente" });
  }
};

export const getClientFleet = async (req: Request, res: Response) => {
  const { id } = req.params;
  const clientId = Array.isArray(id) ? id[0] : id;
  if (!clientId)
    return res.status(400).json({ error: "ID de cliente requerido" });
  try {
    // Buscar cliente con vehículos y el último diagnóstico de cada uno
    const client = await ClientService.getClientFleet(clientId as string);
    if (!client)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la flota del cliente" });
  }
};
