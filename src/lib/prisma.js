import { PrismaClient } from "../generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis;

if (!globalForPrisma.prismaV2) {
  const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  globalForPrisma.prismaV2 = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prismaV2;
