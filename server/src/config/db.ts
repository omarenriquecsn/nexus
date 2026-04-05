import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '@prisma/client';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:TU_PASSWORD@localhost:5432/nexus_core?schema=public';

const adapter = new PrismaPg({ 
    connectionString: DATABASE_URL});


export const prisma = new PrismaClient({ adapter });