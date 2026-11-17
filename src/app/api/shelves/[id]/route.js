import { prisma } from "../../../../lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const shelfId = Number(id);

    const estante = await prisma.shelf.findUnique({ where: { id: shelfId } });
    if (!estante || estante.isDefault || shelfId === 1) {
      return Response.json({ error: "Não é possível remover a estante principal" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.book.updateMany({
        where: { shelfId },
        data: { shelfId: 1 },
      }),
      prisma.shelf.delete({
        where: { id: shelfId },
      }),
    ]);

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Erro ao remover estante" }, { status: 500 });
  }
}
