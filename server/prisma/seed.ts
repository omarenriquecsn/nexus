import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nexus_core?schema=public';

console.log(DATABASE_URL)

const pool = new pg.Pool({ connectionString: DATABASE_URL });

// SOLUCIÓN: Usamos 'as any' para ignorar el conflicto de versiones de @types/pg
const adapter = new PrismaPg(pool as any); 

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando el seeding de Nexus Core...');

  // 1. Crear un Cliente (Client)
  const cliente = await prisma.client.upsert({
    where: { email: 'cliente.taller@email.com' },
    update: {},
    create: {
      name: 'Omar Contreras (Prueba)',
      phone: '0412-1234567',
      email: 'cliente.taller@email.com',
    },
  });

  // 2. Crear un Vehículo (Vehicle)
  const vehiculo = await prisma.vehicle.upsert({
    where: { plate: 'ABC123DE' },
    update: {},
    create: {
      plate: 'ABC123DE',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2015,
      ownerId: cliente.id,
    },
  });

  // 3. Crear un Diagnóstico (Diagnostic)
  await prisma.diagnostic.create({
    data: {
      vehicleId: vehiculo.id,
      description: 'Falla en sistema GNV - No conmuta de gasolina a gas.',
      technicalNotes: 'Revisar solenoide de alta presión y sensor de presión de riel.',
      faultCode: 'P0171', // Mezcla pobre (común en GNV)
      voltageReading: 13.8,
      status: 'PENDING',
      priority: 'HIGH',
    },
  });

  console.log('✅ Seeding completado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });