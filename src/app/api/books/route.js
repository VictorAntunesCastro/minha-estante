import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const books = await prisma.book.findMany({
      where: { userId: user.id },
      orderBy: { order: "asc" },
    });
    return Response.json(books);
  } catch {
    return Response.json({ error: "Erro ao buscar livros" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const data = await request.json();
    if (!data.title?.trim() || !data.author?.trim())
      return Response.json({ error: "Título e autor são obrigatórios" }, { status: 400 });

    const maxOrder = await prisma.book.aggregate({
      where: { userId: user.id },
      _max: { order: true },
    });

    const estantePadrao = await prisma.shelf.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    const newBook = await prisma.book.create({
      data: {
        userId: user.id,
        title: data.title.trim(),
        author: data.author.trim(),
        coverUrl: data.coverUrl || null,
        genre: data.genre || null,
        status: data.status || "wishlist",
        totalPages: data.totalPages ? Number(data.totalPages) : null,
        currentPage: data.currentPage ? Number(data.currentPage) : null,
        shelfId: data.shelfId ? Number(data.shelfId) : (estantePadrao?.id ?? 1),
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
    return Response.json(newBook);
  } catch {
    return Response.json({ error: "Erro ao criar livro" }, { status: 500 });
  }
}
