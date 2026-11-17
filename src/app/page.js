"use client";

import { useState, useEffect } from "react";
import BookShelf from "./components/BookShelf";
import BookModal from "./components/BookModal";
import AddBookModal from "./components/AddBookModal";
import WishlistView from "./components/WishlistView";
import Toast from "./components/Toast";

const TABS = [
  { id: "estante",  label: "📚 Estante"  },
  { id: "wishlist", label: "🌟 Desejos"  },
  { id: "stats",    label: "📊 Stats"    },
];

export default function Home() {
  const [livros, setLivros]                   = useState([]);
  const [estantes, setEstantes]               = useState([]);
  const [estanteAtiva, setEstanteAtiva]       = useState("todas");
  const [criandoEstante, setCriandoEstante]   = useState(false);
  const [nomeNovaEstante, setNomeNovaEstante] = useState("");
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [carregando, setCarregando]           = useState(true);
  const [erro, setErro]                       = useState(null);
  const [filtroStatus, setFiltroStatus]       = useState("todos");
  const [filtroGenero, setFiltroGenero]       = useState("todos");
  const [filtroAutor, setFiltroAutor]         = useState("todos");
  const [filtroAvaliacao, setFiltroAvaliacao] = useState(0);
  const [buscaEstante, setBuscaEstante]       = useState("");
  const [mostrarFiltros, setMostrarFiltros]   = useState(false);
  const [aba, setAba]                         = useState("estante");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarDedicatoria, setMostrarDedicatoria] = useState(false);
  const [toast, setToast]                     = useState(null);

  function mostrarToast(mensagem, tipo = "sucesso") {
    setToast({ mensagem, tipo });
  }

  function buscarLivros(limparErro = false) {
    if (limparErro) setErro(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch("/api/books", { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error("Erro ao carregar livros"); return res.json(); })
      .then((data) => { setLivros(data); setCarregando(false); })
      .catch((e) => { setErro(e.name === "AbortError" ? "Tempo esgotado. Verifique sua conexão." : e.message); setCarregando(false); })
      .finally(() => clearTimeout(timeout));
    fetch("/api/shelves")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setEstantes(data))
      .catch(() => {});
  }

  useEffect(() => { buscarLivros(false); }, []);

  async function atualizarLivro(id, dados) {
    const res = await fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) { mostrarToast("Erro ao atualizar", "erro"); return null; }
    const atualizado = await res.json();
    setLivros((prev) => prev.map((l) => (l.id === id ? atualizado : l)));
    setLivroSelecionado((prev) => (prev?.id === id ? atualizado : prev));
    return atualizado;
  }

  async function deletarLivro(id) {
    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (!res.ok) { mostrarToast("Erro ao remover", "erro"); return; }
    setLivros((prev) => prev.filter((l) => l.id !== id));
    setLivroSelecionado(null);
    mostrarToast("Livro removido");
  }

  async function salvarLivro(novoLivro) {
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoLivro),
    });
    if (!res.ok) { mostrarToast("Erro ao salvar livro", "erro"); return; }
    const criado = await res.json();
    setLivros((prev) => [...prev, criado]);
    setMostrarFormulario(false);
    mostrarToast("Livro adicionado! 📚");
  }

  async function moverParaLendo(id) {
    await atualizarLivro(id, { status: "lendo" });
    setLivroSelecionado(null);
    mostrarToast("Boa leitura! 📖");
    setAba("estante");
  }

  async function criarEstante(e) {
    e.preventDefault();
    if (!nomeNovaEstante.trim()) return;
    const res = await fetch("/api/shelves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nomeNovaEstante.trim() }),
    });
    if (!res.ok) { mostrarToast("Erro ao criar estante", "erro"); return; }
    const nova = await res.json();
    setEstantes((prev) => [...prev, nova]);
    setEstanteAtiva(nova.id);
    setNomeNovaEstante("");
    setCriandoEstante(false);
    mostrarToast(`Estante "${nova.name}" criada! 🏛️`);
  }

  async function removerEstante(id) {
    if (!confirm("Remover esta estante? Os livros dela voltarão para a estante Principal.")) return;
    const res = await fetch(`/api/shelves/${id}`, { method: "DELETE" });
    if (!res.ok) { mostrarToast("Erro ao remover estante", "erro"); return; }
    setEstantes((prev) => prev.filter((e) => e.id !== id));
    setLivros((prev) => prev.map((l) => (l.shelfId === id ? { ...l, shelfId: 1 } : l)));
    setEstanteAtiva("todas");
    mostrarToast("Estante removida");
  }

  async function salvarOrdemNoBanco(listaOrdenada) {
    const orderedIds = listaOrdenada.map((l) => l?.id).filter(Boolean);
    if (orderedIds.length === 0) return;
    const res = await fetch("/api/books/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) {
      mostrarToast("Erro ao salvar nova ordem", "erro");
    }
  }

  async function reordenarLivros(reordenado) {
    const idsReordenados = new Set(reordenado.map((r) => r.id));
    let idx = 0;
    const novaEstante = livrosEstanteGeral.map((livro) =>
      idsReordenados.has(livro.id) ? reordenado[idx++] : livro
    );
    setLivros([...novaEstante, ...livrosWishlist]);
    await salvarOrdemNoBanco(novaEstante);
  }

  async function reordenarWishlist(reordenado) {
    setLivros([...livrosEstanteGeral, ...reordenado]);
    await salvarOrdemNoBanco(reordenado);
  }

  const livrosEstanteGeral = livros.filter((l) => l.status !== "wishlist");
  const livrosEstante = livrosEstanteGeral.filter(
    (l) => estanteAtiva === "todas" || (l.shelfId || 1) === estanteAtiva
  );
  const livrosWishlist = livros.filter((l) => l.status === "wishlist");
  const livrosLendo    = livrosEstante.filter((l) => l.status === "lendo");

  /* Gêneros e autores disponíveis na estante */
  const generos = [...new Set(livrosEstante.map((l) => l.genre).filter(Boolean))].sort();
  const autores = [...new Set(livrosEstante.map((l) => l.author).filter(Boolean))].sort();

  const filtrosAtivos = (filtroGenero !== "todos" ? 1 : 0) + (filtroAutor !== "todos" ? 1 : 0) + (filtroAvaliacao > 0 ? 1 : 0);

  const termoBusca = buscaEstante.trim().toLowerCase();

  const livrosFiltrados = livrosEstante
    .filter((l) =>
      filtroStatus === "todos"
        ? true
        : filtroStatus === "favoritos"
        ? Boolean(l.isFavorite)
        : l.status === filtroStatus
    )
    .filter((l) => filtroGenero === "todos" || l.genre === filtroGenero)
    .filter((l) => filtroAutor === "todos" || l.author === filtroAutor)
    .filter((l) => filtroAvaliacao === 0 || (l.rating ?? 0) >= filtroAvaliacao)
    .filter((l) =>
      !termoBusca ||
      l.title.toLowerCase().includes(termoBusca) ||
      l.author.toLowerCase().includes(termoBusca) ||
      (l.nickname && l.nickname.toLowerCase().includes(termoBusca))
    );

  const contadores = {
    todos:     livrosEstante.length,
    lendo:     livrosEstante.filter((l) => l.status === "lendo").length,
    lido:      livrosEstante.filter((l) => l.status === "lido").length,
    favoritos: livrosEstante.filter((l) => l.isFavorite).length,
  };

  return (
    <main className="min-h-screen" style={{ background: "#f5ede0", backgroundImage: "radial-gradient(#c8956033 1px, transparent 1px)", backgroundSize: "22px 22px" }}>

      {/* ── Header ── */}
      <div className="shadow-2xl" style={{ background: "linear-gradient(160deg, #1e0c02 0%, #5c2d0a 50%, #1e0c02 100%)" }}>
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #92400e, #fbbf24, #d97706, #fbbf24, #92400e)" }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-4xl drop-shadow-lg">📚</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-50 tracking-tight leading-none" style={{ fontFamily: "Georgia, serif", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                Minha Estante
              </h1>
              <p className="text-amber-400/80 text-xs mt-1">
                {livros.length} livro{livros.length !== 1 ? "s" : ""} · {contadores.lido} lido{contadores.lido !== 1 ? "s" : ""} · {contadores.lendo} lendo
              </p>
            </div>
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-amber-400/30 hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #fbbf24, #d97706)", color: "#1c0a00" }}
          >
            + Adicionar
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-1 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAba(tab.id)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all ${
                aba === tab.id
                  ? "bg-[#f5ede0] text-amber-900 shadow-md"
                  : "text-amber-400/70 hover:text-amber-200 hover:bg-white/10"
              }`}
            >
              {tab.label}
              {tab.id === "wishlist" && livrosWishlist.length > 0 && (
                <span className="ml-1.5 bg-amber-400 text-amber-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {livrosWishlist.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {erro && (
          <div className="text-center text-red-700 mb-4 bg-red-50 border border-red-200 rounded-xl py-3 px-4 flex items-center justify-center gap-2">
            <span>⚠️</span> {erro}
            <button onClick={() => buscarLivros(true)} className="ml-2 text-xs underline hover:no-underline">Tentar novamente</button>
          </div>
        )}

        {carregando && (
          <div className="flex flex-col items-center justify-center py-24 text-amber-700/50">
            <div className="text-5xl mb-4 animate-bounce">📚</div>
            <p style={{ fontFamily: "Georgia, serif" }}>Carregando sua estante...</p>
          </div>
        )}

        {/* ── Aba Estante ── */}
        {!carregando && aba === "estante" && (
          <div className="animate-slide-up">
            {/* Seletor de Estantes / Coleções */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-900/10 flex-wrap">
              <span className="text-xs font-bold text-amber-800/70 uppercase tracking-wide mr-1">🏛️ Coleção:</span>
              <button
                onClick={() => setEstanteAtiva("todas")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                  estanteAtiva === "todas"
                    ? "bg-amber-900 text-amber-50 border-amber-900 shadow-sm"
                    : "bg-amber-50/80 text-amber-800 border-amber-200 hover:border-amber-400"
                }`}
              >
                Todas ({livrosEstanteGeral.length})
              </button>

              {estantes.map((est) => {
                const qtd = livrosEstanteGeral.filter((l) => (l.shelfId || 1) === est.id).length;
                const ativa = estanteAtiva === est.id;
                return (
                  <div key={est.id} className="inline-flex items-center gap-1">
                    <button
                      onClick={() => setEstanteAtiva(est.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                        ativa
                          ? "bg-amber-900 text-amber-50 border-amber-900 shadow-sm"
                          : "bg-amber-50/80 text-amber-800 border-amber-200 hover:border-amber-400"
                      }`}
                    >
                      📚 {est.name} ({qtd})
                    </button>
                    {ativa && !est.isDefault && est.id !== 1 && (
                      <button
                        onClick={() => removerEstante(est.id)}
                        title="Excluir esta estante"
                        className="text-xs text-red-500 hover:text-red-700 px-1.5 py-0.5 rounded-full hover:bg-red-50 transition"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                );
              })}

              {!criandoEstante ? (
                <button
                  onClick={() => setCriandoEstante(true)}
                  className="px-3 py-1 rounded-full text-xs font-semibold text-amber-700 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200/70 border border-dashed border-amber-300 transition"
                >
                  + Nova coleção
                </button>
              ) : (
                <form onSubmit={criarEstante} className="inline-flex items-center gap-1.5">
                  <input
                    value={nomeNovaEstante}
                    onChange={(e) => setNomeNovaEstante(e.target.value)}
                    placeholder="Ex: Favoritos, Emprestados..."
                    className="bg-white border border-amber-300 rounded-full px-3 py-1 text-xs text-amber-950 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 w-44"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-amber-800 text-white rounded-full text-xs font-semibold hover:bg-amber-900 transition"
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCriandoEstante(false); setNomeNovaEstante(""); }}
                    className="text-xs text-amber-500 hover:text-amber-800 px-1"
                  >
                    ✕
                  </button>
                </form>
              )}
            </div>

            {/* Filtros de status + botão filtros */}
            <div className="flex gap-2 mb-3 flex-wrap items-center">
              {[["todos", "Todos", "📚"], ["lendo", "Lendo", "📖"], ["lido", "Lido", "✅"], ["favoritos", "Favoritos", "❤️"]].map(([val, label, icon]) => (
                <button
                  key={val}
                  onClick={() => setFiltroStatus(val)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                    filtroStatus === val
                      ? "bg-amber-800 text-white shadow-amber-800/25 shadow-md scale-105"
                      : "bg-white text-amber-800 border border-amber-200 hover:border-amber-400 hover:shadow-md"
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filtroStatus === val ? "bg-amber-700 text-amber-200" : "bg-amber-100 text-amber-600"}`}>
                    {contadores[val]}
                  </span>
                </button>
              ))}

              {/* Busca rápida na estante */}
              <div className="relative flex-1 min-w-44 sm:max-w-xs ml-auto">
                <input
                  value={buscaEstante}
                  onChange={(e) => setBuscaEstante(e.target.value)}
                  placeholder="🔍 Buscar na estante..."
                  className="w-full bg-white border border-amber-200 focus:border-amber-400 rounded-full px-3.5 py-2 text-xs sm:text-sm text-amber-950 placeholder-amber-400 focus:outline-none shadow-sm transition"
                />
                {buscaEstante && (
                  <button
                    onClick={() => setBuscaEstante("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-700 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Botão filtros */}
              <button
                onClick={() => setMostrarFiltros((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  mostrarFiltros || filtrosAtivos > 0
                    ? "bg-amber-700 text-white border-amber-700 shadow-md"
                    : "bg-white text-amber-700 border-amber-200 hover:border-amber-400"
                }`}
              >
                🎛️ Filtros
                {filtrosAtivos > 0 && (
                  <span className="bg-amber-400 text-amber-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {filtrosAtivos}
                  </span>
                )}
              </button>
            </div>

            {/* Painel de filtros */}
            {mostrarFiltros && (
              <div className="paper-card border border-amber-200 rounded-2xl p-4 mb-5 animate-slide-up flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Filtros avançados</p>
                  {filtrosAtivos > 0 && (
                    <button
                      onClick={() => { setFiltroGenero("todos"); setFiltroAutor("todos"); setFiltroAvaliacao(0); }}
                      className="text-xs text-amber-600 hover:text-amber-900 underline"
                    >
                      Limpar tudo
                    </button>
                  )}
                </div>

                {/* Gênero */}
                {generos.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-amber-700 mb-2">🏷️ Gênero</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setFiltroGenero("todos")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                          filtroGenero === "todos" ? "bg-amber-700 text-white border-amber-700" : "bg-white text-amber-700 border-amber-200 hover:border-amber-400"
                        }`}
                      >
                        Todos
                      </button>
                      {generos.map((g) => (
                        <button
                          key={g}
                          onClick={() => setFiltroGenero(g)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                            filtroGenero === g ? "bg-amber-700 text-white border-amber-700" : "bg-white text-amber-700 border-amber-200 hover:border-amber-400"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Autor */}
                {autores.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-amber-700 mb-2">✍️ Autor</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setFiltroAutor("todos")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                          filtroAutor === "todos" ? "bg-amber-700 text-white border-amber-700" : "bg-white text-amber-700 border-amber-200 hover:border-amber-400"
                        }`}
                      >
                        Todos
                      </button>
                      {autores.map((a) => (
                        <button
                          key={a}
                          onClick={() => setFiltroAutor(a)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                            filtroAutor === a ? "bg-amber-700 text-white border-amber-700" : "bg-white text-amber-700 border-amber-200 hover:border-amber-400"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Avaliação mínima */}
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-2">⭐ Avaliação mínima</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFiltroAvaliacao(0)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                        filtroAvaliacao === 0 ? "bg-amber-700 text-white border-amber-700" : "bg-white text-amber-700 border-amber-200 hover:border-amber-400"
                      }`}
                    >
                      Todas
                    </button>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFiltroAvaliacao(s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border flex items-center gap-1 ${
                          filtroAvaliacao === s ? "bg-amber-700 text-white border-amber-700" : "bg-white text-amber-700 border-amber-200 hover:border-amber-400"
                        }`}
                      >
                        {s}⭐+
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Destaque: Lendo agora */}
            {livrosLendo.length > 0 && filtroStatus !== "lido" && !termoBusca && (
              <div className="mb-5">
                <p className="text-xs font-bold text-amber-800/80 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <span>📖</span> Lendo agora
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {livrosLendo.map((livro) => {
                    const pct = livro.totalPages > 0
                      ? Math.min(100, Math.round(((livro.currentPage || 0) / livro.totalPages) * 100))
                      : null;
                    return (
                      <div
                        key={livro.id}
                        onClick={() => setLivroSelecionado(livro)}
                        className="paper-card border border-amber-200/80 hover:border-amber-400 rounded-2xl p-3 flex items-center gap-3.5 shadow-sm hover:shadow-md cursor-pointer transition-all group"
                      >
                        {livro.coverUrl ? (
                          <img
                            src={livro.coverUrl}
                            alt={livro.title}
                            className="w-12 h-16 object-cover rounded-md shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gradient-to-br from-amber-200 to-amber-400 rounded-md shadow-sm flex-shrink-0 flex items-center justify-center p-1">
                            <span className="text-[8px] text-amber-900 font-semibold text-center leading-tight line-clamp-3">{livro.title}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-amber-950 truncate" style={{ fontFamily: "Georgia, serif" }}>
                            {livro.title}
                          </h4>
                          <p className="text-xs text-amber-700 truncate">{livro.author}</p>
                          {pct !== null ? (
                            <div className="mt-2">
                              <div className="flex justify-between text-[11px] font-semibold text-amber-800 mb-1">
                                <span>Pág. {livro.currentPage || 0} de {livro.totalPages}</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-700 rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-amber-500 mt-1.5 group-hover:text-amber-700 transition">
                              Clique para anotar a página atual →
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {livrosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-amber-700/50">
                <span className="text-6xl mb-4">📚</span>
                <p className="text-lg font-medium" style={{ fontFamily: "Georgia, serif" }}>
                  {filtroStatus === "todos" && filtroGenero === "todos" && filtroAutor === "todos" && filtroAvaliacao === 0 && !termoBusca
                    ? "Nenhum livro na estante ainda"
                    : "Nenhum livro encontrado com esse filtro"}
                </p>
                {filtroStatus === "todos" && filtroGenero === "todos" && filtroAutor === "todos" && filtroAvaliacao === 0 && !termoBusca && (
                  <p className="text-sm mt-1">Adicione o primeiro ou mova da lista de desejos!</p>
                )}
              </div>
            ) : (
              <BookShelf livros={livrosFiltrados} onSelect={setLivroSelecionado} onReorder={reordenarLivros} />
            )}
          </div>
        )}

        {/* ── Aba Wishlist ── */}
        {!carregando && aba === "wishlist" && (
          <WishlistView
            livros={livrosWishlist}
            onSelect={setLivroSelecionado}
            onMoveToReading={moverParaLendo}
            onReorder={reordenarWishlist}
          />
        )}

        {/* ── Aba Stats ── */}
        {!carregando && aba === "stats" && <StatsView livros={livros} />}

        {/* ── Rodapé discreto com dedicatória ── */}
        <footer className="mt-14 pt-6 border-t border-amber-900/10 text-center flex flex-col items-center gap-2">
          <button
            onClick={() => setMostrarDedicatoria((v) => !v)}
            className="text-xs text-amber-800/60 hover:text-amber-900 transition flex items-center gap-1.5 group"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <span>Feito com ❤️ especialmente para a Ju</span>
            <span className="group-hover:scale-125 transition-transform">💌</span>
          </button>

          {mostrarDedicatoria && (
            <div className="paper-card border border-amber-300/80 rounded-2xl px-5 py-3.5 max-w-sm text-xs text-amber-900 shadow-md animate-slide-up italic" style={{ fontFamily: "Georgia, serif" }}>
              “Ju, fiz esse cantinho para você guardar cada história que já viveu nas páginas e todas as próximas que ainda vai descobrir. Te amo! ❤️”
            </div>
          )}
        </footer>
      </div>

      {livroSelecionado && (
        <BookModal
          livro={livroSelecionado}
          estantes={estantes}
          onClose={() => setLivroSelecionado(null)}
          onUpdate={atualizarLivro}
          onDelete={deletarLivro}
        />
      )}
      {mostrarFormulario && (
        <AddBookModal
          estantes={estantes}
          estantePadrao={estanteAtiva === "todas" ? 1 : estanteAtiva}
          onClose={() => setMostrarFormulario(false)}
          onSave={salvarLivro}
        />
      )}
      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />}
    </main>
  );
}

/* ── Stats ── */
function StatsView({ livros }) {
  const anoAtual = new Date().getFullYear();
  const chaveStorage = `minha_estante_meta_${anoAtual}`;

  const [metaAnual, setMetaAnual] = useState(() => {
    if (typeof window === "undefined") return 12;
    const salvo = window.localStorage.getItem(chaveStorage);
    return salvo ? Math.max(1, Number(salvo)) : 12;
  });
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [inputMeta, setInputMeta]       = useState(String(metaAnual));

  function salvarMeta(e) {
    e.preventDefault();
    const valor = Math.max(1, Math.min(365, Number(inputMeta) || 12));
    setMetaAnual(valor);
    setInputMeta(String(valor));
    setEditandoMeta(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(chaveStorage, String(valor));
    }
  }

  const lidos     = livros.filter((l) => l.status === "lido");
  const lendo     = livros.filter((l) => l.status === "lendo");
  const wishlist  = livros.filter((l) => l.status === "wishlist");
  const favoritos = livros.filter((l) => l.isFavorite);

  const totalPaginasLidas = livros.reduce((acc, l) => {
    if (l.status === "lido") return acc + (l.totalPages || l.currentPage || 0);
    if (l.status === "lendo") return acc + (l.currentPage || 0);
    return acc;
  }, 0);

  const lidosNoAno = lidos.filter((l) => {
    const dataRef = l.finishedAt || l.createdAt;
    return dataRef ? new Date(dataRef).getFullYear() === anoAtual : true;
  }).length;

  const progressoMeta = Math.min(100, Math.round((lidosNoAno / metaAnual) * 100));
  const bateuMeta     = lidosNoAno >= metaAnual;

  const lidosComNota = lidos.filter((l) => l.rating);
  const mediaAvaliacao = lidosComNota.length > 0
    ? (lidosComNota.reduce((acc, l) => acc + l.rating, 0) / lidosComNota.length).toFixed(1)
    : null;

  const generos = livros.reduce((acc, l) => {
    if (!l.genre) return acc;
    acc[l.genre] = (acc[l.genre] || 0) + 1;
    return acc;
  }, {});
  const topGeneros = Object.entries(generos).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const lidosPorMes = [...lidos]
    .filter((l) => l.finishedAt)
    .sort((a, b) => new Date(a.finishedAt) - new Date(b.finishedAt))
    .reduce((acc, l) => {
      const mes = new Date(l.finishedAt).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {});
  const ultimosMeses = Object.entries(lidosPorMes).slice(-6);
  const maxMes = Math.max(...ultimosMeses.map(([, v]) => v), 1);

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Cards resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Total",         value: livros.length,                             icon: "📚", from: "from-amber-100",  to: "to-amber-50"  },
          { label: "Lidos",         value: lidos.length,                              icon: "✅", from: "from-green-100",  to: "to-green-50"  },
          { label: "Lendo",         value: lendo.length,                              icon: "📖", from: "from-blue-100",   to: "to-blue-50"   },
          { label: "Quero ler",     value: wishlist.length,                           icon: "🌟", from: "from-purple-100", to: "to-purple-50" },
          { label: "Favoritos",     value: favoritos.length,                          icon: "❤️", from: "from-rose-100",   to: "to-rose-50"   },
          { label: "Páginas lidas", value: totalPaginasLidas.toLocaleString("pt-BR"), icon: "📄", from: "from-orange-100", to: "to-amber-50"  },
        ].map(({ label, value, icon, from, to }) => (
          <div key={label} className={`bg-gradient-to-br ${from} ${to} rounded-2xl p-4 shadow-sm border border-white`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-950 truncate">{value}</div>
            <div className="text-xs text-amber-700 font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Desafio / Meta Anual de Leitura */}
      <div className="paper-card rounded-2xl p-5 shadow-sm border border-amber-200/80">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-1.5" style={{ fontFamily: "Georgia, serif" }}>
              <span>{bateuMeta ? "👑" : "🏆"}</span> Desafio de Leitura {anoAtual}
            </h3>
            <p className="text-xs text-amber-700/80 mt-0.5">
              {lidosNoAno === 0
                ? "Que tal começar o primeiro livro do ano? 📖"
                : bateuMeta
                ? "🎉 Parabéns!! Você alcançou sua meta de leitura do ano!"
                : progressoMeta >= 50
                ? `Mais da metade concluída! Faltam só ${metaAnual - lidosNoAno} livro${metaAnual - lidosNoAno !== 1 ? "s" : ""} 🔥`
                : `Bom ritmo! Faltam ${metaAnual - lidosNoAno} livro${metaAnual - lidosNoAno !== 1 ? "s" : ""} para a meta ✨`}
            </p>
          </div>

          {!editandoMeta ? (
            <button
              onClick={() => { setInputMeta(String(metaAnual)); setEditandoMeta(true); }}
              className="text-xs font-semibold text-amber-700 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200/80 px-3 py-1.5 rounded-full transition"
            >
              ✏️ Meta: {metaAnual} livros
            </button>
          ) : (
            <form onSubmit={salvarMeta} className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={365}
                value={inputMeta}
                onChange={(e) => setInputMeta(e.target.value)}
                className="w-16 bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-bold text-amber-950 text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-amber-800 text-white text-xs font-semibold rounded-lg hover:bg-amber-900 transition"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setEditandoMeta(false)}
                className="px-2 py-1 text-amber-600 hover:text-amber-900 text-xs"
              >
                ✕
              </button>
            </form>
          )}
        </div>

        <div className="flex items-end justify-between text-xs font-semibold text-amber-900 mb-1.5">
          <span>{lidosNoAno} de {metaAnual} lidos em {anoAtual}</span>
          <span className="text-amber-700 font-bold">{progressoMeta}%</span>
        </div>

        <div className="w-full h-3.5 bg-amber-100 rounded-full overflow-hidden shadow-inner p-0.5">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressoMeta}%`,
              background: bateuMeta
                ? "linear-gradient(90deg, #16a34a, #22c55e, #fbbf24)"
                : "linear-gradient(90deg, #b45309, #d97706, #fbbf24)",
            }}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Avaliação média */}
        <div className="paper-card rounded-2xl p-5 shadow-sm border border-amber-100">
          <h3 className="text-sm font-bold text-amber-900 mb-3" style={{ fontFamily: "Georgia, serif" }}>⭐ Avaliação média</h3>
          {mediaAvaliacao ? (
            <>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-amber-800">{mediaAvaliacao}</span>
                <span className="text-amber-400 text-2xl mb-1">/ 5</span>
              </div>
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-lg">{s <= Math.round(mediaAvaliacao) ? "⭐" : "☆"}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-amber-400 text-sm">Nenhum livro avaliado ainda</p>
          )}
        </div>

        {/* Top gêneros */}
        <div className="paper-card rounded-2xl p-5 shadow-sm border border-amber-100">
          <h3 className="text-sm font-bold text-amber-900 mb-3" style={{ fontFamily: "Georgia, serif" }}>🏷️ Gêneros favoritos</h3>
          {topGeneros.length === 0 ? (
            <p className="text-amber-400 text-sm">Nenhum gênero cadastrado ainda</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topGeneros.map(([genero, count]) => (
                <div key={genero} className="flex items-center gap-2">
                  <div className="flex-1 bg-amber-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-amber-700 rounded-full transition-all" style={{ width: `${(count / topGeneros[0][1]) * 100}%` }} />
                  </div>
                  <span className="text-xs text-amber-800 font-medium w-24 truncate">{genero}</span>
                  <span className="text-xs text-amber-500 w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lidos por mês */}
      <div className="paper-card rounded-2xl p-5 shadow-sm border border-amber-100">
        <h3 className="text-sm font-bold text-amber-900 mb-4" style={{ fontFamily: "Georgia, serif" }}>📅 Livros lidos por mês</h3>
        {ultimosMeses.length === 0 ? (
          <p className="text-amber-400 text-sm">Nenhum livro com data de conclusão ainda</p>
        ) : (
          <div className="flex items-end gap-2 h-24">
            {ultimosMeses.map(([mes, count]) => (
              <div key={mes} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-amber-800">{count}</span>
                <div className="w-full bg-amber-700 rounded-t-md transition-all" style={{ height: `${(count / maxMes) * 72}px` }} />
                <span className="text-[10px] text-amber-500 text-center leading-tight">{mes}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mural de Citações Favoritas */}
      {livros.some((l) => l.quote) && (
        <div className="paper-card rounded-2xl p-5 shadow-sm border border-amber-100">
          <h3 className="text-sm font-bold text-amber-900 mb-3" style={{ fontFamily: "Georgia, serif" }}>💬 Citações Favoritas</h3>
          <div className="flex flex-col gap-3">
            {livros
              .filter((l) => l.quote)
              .map((l) => (
                <blockquote
                  key={l.id}
                  className="bg-amber-50/70 border-l-4 border-amber-500 rounded-r-xl px-4 py-3 text-sm text-amber-950 italic"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  “{l.quote}”
                  <footer className="text-xs font-sans not-italic font-semibold text-amber-700 mt-1.5">
                    — {l.title} <span className="font-normal text-amber-500">({l.author})</span>
                  </footer>
                </blockquote>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
