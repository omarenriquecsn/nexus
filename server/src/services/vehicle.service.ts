import { prisma } from '../config/db.js';

export const VehicleService = {
  async createVehicle(data: { 
    plate: string; 
    brand: string; 
    model: string; 
    year: number; 
    ownerId: string 
  }) {
    return await prisma.vehicle.create({
      data: {
        plate: data.plate.toUpperCase(), // Siempre en mayúsculas para evitar duplicados "abc" vs "ABC"
        brand: data.brand,
        model: data.model,
        year: data.year,
        ownerId: data.ownerId,
      },
    });
  },

  async getByPlate(plate: string) {
    return await prisma.vehicle.findUnique({
      where: { plate: plate.toUpperCase() },
      include: {
        owner: {
          include: {
            _count: {
              select: { vehicles: true }
            }
          }
        },
        diagnostics: true
      }
    });
  },

  async getAllVehicles() {
    return await prisma.vehicle.findMany({
      include: { owner: true }
    });
  }
};