import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

    let shelves = await prisma.shelf.findMany({
      where: { userId: user.id },
      orderBy: { id: "asc" },
    });
    if (shelves.length === 0) {
      const padrao = await prisma.shelf.create({
        data: { userId: user.id, name: "Principal", isDefault: true },
      });
      shelves = [padrao];
    }
    return Response.json(shelves);
  } catch {
    return Response.json({ error: "Erro ao buscar estantes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const data = await request.json();
    const nome = data.name?.trim();
    if (!nome) {
      return Response.json({ error: "Nome da estante é obrigatório" }, { status: 400 });
    }
    const nova = await prisma.shelf.create({
      data: { userId: user.id, name: nome, isDefault: false },
    });
    return Response.json(nova);
  } catch {
    return Response.json({ error: "Erro ao criar estante" }, { status: 500 });
  }
}
