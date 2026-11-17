const TRADUCAO_GENEROS = {
  "fiction": "Ficção",
  "juvenile fiction": "Jovem Adulto",
  "young adult fiction": "Jovem Adulto",
  "young adult": "Jovem Adulto",
  "romance": "Romance",
  "fantasy": "Fantasia",
  "science fiction": "Ficção Científica",
  "thrillers": "Suspense",
  "thriller": "Suspense",
  "mystery": "Mistério",
  "detective and mystery stories": "Mistério",
  "horror": "Terror",
  "biography & autobiography": "Biografia",
  "biography": "Biografia",
  "self-help": "Autoajuda",
  "psychology": "Psicologia",
  "history": "História",
  "poetry": "Poesia",
  "philosophy": "Filosofia",
  "comics & graphic novels": "Quadrinhos",
  "literary collections": "Literatura",
  "literary criticism": "Crítica Literária",
  "classic literature": "Clássico",
  "drama": "Drama",
  "adventure stories": "Aventura",
  "social science": "Ciências Sociais",
  "business & economics": "Negócios",
  "religion": "Religião",
  "art": "Arte",
};

const TAGS_IGNORADAS = new Set([
  "accessible book",
  "protected daisy",
  "in library",
  "large type books",
  "lending library",
  "open library staff picks",
  "popular literature",
  "new york times bestseller",
  "translations into portuguese",
]);

function formatarGenero(raw) {
  if (!raw || typeof raw !== "string") return "";
  const limpo = raw.split("/")[0].split(",")[0].trim();
  const chave = limpo.toLowerCase();
  if (TAGS_IGNORADAS.has(chave)) return "";
  return TRADUCAO_GENEROS[chave] || limpo;
}

function normalizarCapaGoogle(imageLinks) {
  const url = imageLinks?.thumbnail || imageLinks?.smallThumbnail || "";
  if (!url) return "";
  return url
    .replace(/^http:\/\//i, "https://")
    .replace("&edge=curl", "");
}

async function buscarGoogleBooks(query, apenasPortugues = true) {
  const filtroIdioma = apenasPortugues ? "&langRestrict=pt&country=BR" : "&country=BR";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8&printType=books${filtroIdioma}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error("Google Books indisponível");
  const data = await res.json();

  return (data.items || [])
    .map((item) => {
      const info = item.volumeInfo || {};
      const categoriaBruta = (info.categories || [])[0] || "";
      return {
        title:      info.title || "",
        author:     (info.authors || []).join(", "),
        genre:      formatarGenero(categoriaBruta),
        coverUrl:   normalizarCapaGoogle(info.imageLinks),
        totalPages: info.pageCount || null,
      };
    })
    .filter((l) => l.title && l.author);
}

async function buscarOpenLibrary(query) {
  const fields = "title,author_name,subject,cover_i,number_of_pages_median,editions,editions.title,editions.cover_i,editions.language";
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&lang=pt&fields=${fields}&limit=6`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error("OpenLibrary indisponível");
  const data = await res.json();

  return (data.docs || [])
    .map((item) => {
      const edicaoPt = item.editions?.docs?.[0];
      const tituloFinal = edicaoPt?.title || item.title || "";
      const capaId = edicaoPt?.cover_i || item.cover_i;
      const generoValido = (item.subject || [])
        .map(formatarGenero)
        .find(Boolean) || "";
      return {
        title:      tituloFinal,
        author:     (item.author_name || []).join(", "),
        genre:      generoValido,
        coverUrl:   capaId ? `https://covers.openlibrary.org/b/id/${capaId}-L.jpg` : "",
        totalPages: item.number_of_pages_median || null,
      };
    })
    .filter((l) => l.title && l.author);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  if (!query) return Response.json([]);

  try {
    const livrosGooglePt = await buscarGoogleBooks(query, true);
    if (livrosGooglePt.length > 0) {
      return Response.json(livrosGooglePt.slice(0, 6));
    }
    const livrosGoogleGeral = await buscarGoogleBooks(query, false);
    if (livrosGoogleGeral.length > 0) {
      return Response.json(livrosGoogleGeral.slice(0, 6));
    }
  } catch {
    // Continua para o fallback na OpenLibrary
  }

  try {
    const livrosOpenLib = await buscarOpenLibrary(query);
    return Response.json(livrosOpenLib.slice(0, 6));
  } catch {
    return Response.json({ error: "Busca indisponível" }, { status: 503 });
  }
}
