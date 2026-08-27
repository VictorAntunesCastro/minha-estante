export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  if (!query) return Response.json([]);

  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error("upstream error");
    const data = await res.json();
    const livros = (data.docs || []).map((item) => ({
      title:    item.title || "",
      author:   (item.author_name || []).join(", "),
      genre:    (item.subject || [])[0] || "",
      coverUrl: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : "",
    }));
    return Response.json(livros);
  } catch {
    return Response.json({ error: "Busca indisponível" }, { status: 503 });
  }
}
