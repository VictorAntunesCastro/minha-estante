import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const books = await prisma.book.findMany({ orderBy: { order: "asc" } });
    return Response.json(books);
  } catch {
    return Response.json({ error: "Erro ao buscar livros" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.title?.trim() || !data.author?.trim())
      return Response.json({ error: "Título e autor são obrigatórios" }, { status: 400 });

    const maxOrder = await prisma.book.aggregate({ _max: { order: true } });
    const newBook = await prisma.book.create({
      data: {
        title: data.title.trim(),
        author: data.author.trim(),
        coverUrl: data.coverUrl || null,
        genre: data.genre || null,
        status: data.status || "wishlist",
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
    return Response.json(newBook);
  } catch {
    return Response.json({ error: "Erro ao criar livro" }, { status: 500 });
  }
}
