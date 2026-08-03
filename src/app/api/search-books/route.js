export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return Response.json([]);
  }

  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`
  );
  const data = await res.json();

  const livros = (data.docs || []).map((item) => {
    return {
      title: item.title || "",
      author: (item.author_name || []).join(", "),
      genre: (item.subject || [])[0] || "",
      coverUrl: item.cover_i
        ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`
        : "",
    };
  });

  return Response.json(livros);
}
