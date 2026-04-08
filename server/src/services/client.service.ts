import { prisma } from "../config/db.js";

export const ClientService = {
  async createClient(data: { name: string; email?: string; phone?: string }) {
    return await prisma.client.create({
      data: {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      },
    });
  },

  async getAllClients() {
    return await prisma.client.findMany({
      include: { vehicles: true }, // Ver qué carros tiene cada cliente
      orderBy: { name: "asc" },
    });
  },

  async getClientByName(name: string) {
    return await prisma.client.findMany({
      where: {
        name: {
          contains: String(name),
          mode: "insensitive",
        },
      },
      take: 5,
    });
  },

  async updateClient(
    id: string,
    data: { name: string; email?: string; phone?: string },
  ) {
    return await prisma.client.update({
      where: { id },
      data: {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      },
    });
  },

  async getClientFleet(id: string) {
    return await prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        vehicles: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
            diagnostics: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                description: true,
                createdAt: true,
                faultCode: true,
                technicalNotes: true,
                voltageReading: true,
                deliveredAt: true,
                isAccepted: true,
                gnvPressure: true,
                gnvLeakTest: true,
                gnvSolenoid: true,
              },
            },
          },
        },
      },
    });
  },
};
