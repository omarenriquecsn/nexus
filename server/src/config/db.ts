import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '@prisma/client';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:nexus_pass_2026@db:5432/nexus_db?schema=public";

const adapter = new PrismaPg({ 
    connectionString: DATABASE_URL});


export const prisma = new PrismaClient({ adapter });