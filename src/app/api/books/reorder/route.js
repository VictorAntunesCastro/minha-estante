import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const { orderedIds } = await request.json();
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return Response.json({ error: "Lista de IDs inválida" }, { status: 400 });
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.book.updateMany({
          where: { id: Number(id), userId: user.id },
          data: { order: index },
        })
      )
    );

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Erro ao reordenar livros" }, { status: 500 });
  }
}
