import { prisma } from "../../../../lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updated = await prisma.book.update({
      where: { id: Number(id) },
      data: {
        ...(data.title      !== undefined && { title: data.title }),
        ...(data.author     !== undefined && { author: data.author }),
        ...(data.genre      !== undefined && { genre: data.genre }),
        ...(data.coverUrl   !== undefined && { coverUrl: data.coverUrl }),
        ...(data.status     !== undefined && { status: data.status }),
        ...(data.rating     !== undefined && { rating: data.rating }),
        ...(data.notes      !== undefined && { notes: data.notes }),
        ...(data.nickname   !== undefined && { nickname: data.nickname }),
        ...(data.order      !== undefined && { order: data.order }),
        // Datas manuais têm prioridade; se não vieram, aplica lógica automática por status
        ...(data.startedAt  !== undefined
          ? { startedAt:  data.startedAt  ? new Date(data.startedAt)  : null }
          : data.status === "lendo"    ? { startedAt: new Date() }
          : data.status === "wishlist" ? { startedAt: null }
          : {}),
        ...(data.finishedAt !== undefined
          ? { finishedAt: data.finishedAt ? new Date(data.finishedAt) : null }
          : data.status === "lido"     ? { finishedAt: new Date() }
          : data.status === "lendo"    ? { finishedAt: null }
          : data.status === "wishlist" ? { finishedAt: null }
          : {}),
      },
    });
    return Response.json(updated);
  } catch {
    return Response.json({ error: "Erro ao atualizar livro" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.book.delete({ where: { id: Number(id) } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Erro ao deletar livro" }, { status: 500 });
  }
}
