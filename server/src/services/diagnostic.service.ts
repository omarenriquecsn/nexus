
import { prisma } from "../config/db.js";

type DiagnosticWithVehicle = Awaited<ReturnType<typeof prisma.diagnostic.findMany>>[number];

export const DiagnosticService = {
  async getAllDiagnostics() {
    return await prisma.diagnostic.findMany({
      include: {
        vehicle: { include: { owner: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return await prisma.diagnostic.findUnique({
      where: { id },
      include: {
        vehicle: { include: { owner: true } },
      },
    });
  },

  async getPublicDiagnostic(id: string) {
    return await prisma.diagnostic.findUnique({
      where: { id },
      select: {
        id: true,
        description: true,
        faultCode: true,
        technicalNotes: true,
        voltageReading: true,
        createdAt: true,
        deliveredAt: true,
        isAccepted: true,
        acceptedAt: true,
        vehicle: {
          select: {
            plate: true,
            brand: true,
            model: true,
            year: true,
          },
        },
      },
    });
  },

  async createDiagnostic(data: {
    vehicleId: string;
    description: string;
    faultCode?: string;
    technicalNotes?: string;
    voltageReading?: number;
  }) {
    return await prisma.diagnostic.create({
      data: {
        vehicleId: data.vehicleId,
        description: data.description,
        faultCode: data.faultCode ?? null,
        technicalNotes: data.technicalNotes ?? "",
        voltageReading: data.voltageReading ?? null,
      },
      include: {
        vehicle: { include: { owner: true } }, // Devolvemos el objeto completo para el frontend
      },
    });
  },

  async getPriorityDiagnostics() {
    const priorityDiagnostics: DiagnosticWithVehicle[] = await prisma.diagnostic.findMany({
      where: {
        AND: [
          { faultCode: { not: null } },
          { voltageReading: { lt: 12.5 } },
        ],
      },
      include: {
        vehicle: { include: { owner: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return priorityDiagnostics.map((diagnostic) => ({
      ...diagnostic,
      healthStatus: 'RED' as const,
    }));
  },

  async getCriticalDiagnostics() {
    // Derivamos healthStatus RED a partir de condiciones críticas del diagnóstico.
    const criticalDiagnostics: DiagnosticWithVehicle[] = await prisma.diagnostic.findMany({
      where: {
        OR: [
          { faultCode: { not: null } },
          { voltageReading: { lt: 12.5 } },
        ],
      },
      include: {
        vehicle: { include: { owner: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return criticalDiagnostics.map((diagnostic) => ({
      ...diagnostic,
      healthStatus: 'RED' as const,
    }));
  },

  async confirmDelivery(id: string, reportImageUrl?: string) {
    return await prisma.diagnostic.update({
      where: { id },
      data: {
        deliveredAt: new Date(),
        reportImageUrl: reportImageUrl ?? null
      },
      include: {
        vehicle: { include: { owner: true } },
      },
    });
  },

  async acceptDiagnostic(id: string) {
    return await prisma.diagnostic.update({
      where: { id },
      data: {
        isAccepted: true,
        acceptedAt: new Date(),
      },
      include: {
        vehicle: { include: { owner: true } },
      },
    });
  },
};
