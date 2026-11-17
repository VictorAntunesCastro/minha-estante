import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const { id } = await params;
    const shelfId = Number(id);

    const estante = await prisma.shelf.findFirst({
      where: { id: shelfId, userId: user.id },
    });
    if (!estante || estante.isDefault) {
      return Response.json({ error: "Não é possível remover a estante principal" }, { status: 400 });
    }

    const estantePrincipal = await prisma.shelf.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    await prisma.$transaction([
      prisma.book.updateMany({
        where: { shelfId, userId: user.id },
        data: { shelfId: estantePrincipal?.id ?? 1 },
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
