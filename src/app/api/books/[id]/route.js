import { PrismaClient } from "../../../../generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

export async function PATCH(request, { params }) {
  const { id } = await params;
  const data = await request.json();

  const updated = await prisma.book.update({
    where: { id: Number(id) },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.rating !== undefined && { rating: data.rating }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.nickname !== undefined && { nickname: data.nickname }),
      ...(data.startedAt !== undefined && { startedAt: data.startedAt ? new Date(data.startedAt) : null }),
      ...(data.status === "lido" && { finishedAt: new Date() }),
      ...(data.status === "lendo" && { startedAt: new Date() }),
    },
  });

  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  await prisma.book.delete({ where: { id: Number(id) } });

  return Response.json({ ok: true });
}
