import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis;

if (!globalForPrisma.prismaPg) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  globalForPrisma.prismaPg = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prismaPg;
