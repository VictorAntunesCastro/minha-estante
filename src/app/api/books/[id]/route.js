import { prisma } from "../../../../lib/prisma";

function parseDateInput(val) {
  if (!val) return null;
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return new Date(`${val}T12:00:00.000Z`);
  }
  return new Date(val);
}

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
        ...(data.status      !== undefined && { status: data.status }),
        ...(data.rating      !== undefined && { rating: data.rating }),
        ...(data.isFavorite  !== undefined && { isFavorite: Boolean(data.isFavorite) }),
        ...(data.notes       !== undefined && { notes: data.notes }),
        ...(data.quote       !== undefined && { quote: data.quote }),
        ...(data.nickname    !== undefined && { nickname: data.nickname }),
        ...(data.currentPage !== undefined && { currentPage: data.currentPage !== null && data.currentPage !== "" ? Number(data.currentPage) : null }),
        ...(data.totalPages  !== undefined && { totalPages:  data.totalPages  !== null && data.totalPages  !== "" ? Number(data.totalPages)  : null }),
        ...(data.order       !== undefined && { order: data.order }),
        // Datas manuais têm prioridade; se não vieram, aplica lógica automática por status
        ...(data.startedAt  !== undefined
          ? { startedAt:  parseDateInput(data.startedAt) }
          : data.status === "lendo"    ? { startedAt: new Date() }
          : data.status === "wishlist" ? { startedAt: null }
          : {}),
        ...(data.finishedAt !== undefined
          ? { finishedAt: parseDateInput(data.finishedAt) }
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
