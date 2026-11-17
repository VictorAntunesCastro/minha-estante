import { prisma } from "../../../../lib/prisma";

export async function PUT(request) {
  try {
    const { orderedIds } = await request.json();
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return Response.json({ error: "Lista de IDs inválida" }, { status: 400 });
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.book.update({
          where: { id: Number(id) },
          data: { order: index },
        })
      )
    );

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Erro ao reordenar livros" }, { status: 500 });
  }
}
