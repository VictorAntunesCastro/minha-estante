import { PrismaClient } from "../../../generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(books);
}
