"use client";

import { useState, useEffect } from "react";
import BookShelf from "./components/BookShelf";
import BookModal from "./components/BookModal";
import AddBookModal from "./components/AddBookModal";
import WishlistView from "./components/WishlistView";
import Toast from "./components/Toast";

const TABS = [
  { id: "estante", label: "📚 Estante" },
  { id: "wishlist", label: "🌟 Desejos" },
  { id: "stats", label: "📊 Stats" },
];

export default function Home() {
  const [livros, setLivros] = useState([]);
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [aba, setAba] = useState("estante");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [toast, setToast] = useState(null);

  function mostrarToast(mensagem, tipo = "sucesso") {
    setToast({ mensagem, tipo });
  }

  function buscarLivros() {
    setErro(null);
    fetch("/api/books")
      .then((res) => { if (!res.ok) throw new Error("Erro ao carregar livros"); return res.json(); })
      .then((data) => { setLivros(data); setCarregando(false); })
      .catch((e) => { setErro(e.message); setCarregando(false); });
  }

  useEffect(() => { buscarLivros(); }, []);

  async function atualizarLivro(id, dados) {
    const res = await fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) { mostrarToast("Erro ao atualizar", "erro"); return; }
    const atualizado = await res.json();
    setLivros((prev) => prev.map((l) => (l.id === id ? atualizado : l)));
    setLivroSelecionado(atualizado);
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
    setLivros((prev) => [criado, ...prev]);
    setMostrarFormulario(false);
    mostrarToast("Livro adicionado! 📚");
  }

  async function moverParaLendo(id) {
    await atualizarLivro(id, { status: "lendo" });
    setLivroSelecionado(null);
    mostrarToast("Boa leitura! 📖");
    setAba("estante");
  }

  async function reordenarLivros(reordenado) {
    // Atualiza localmente imediato
    const wishlist = livros.filter((l) => l.status === "wishlist");
    setLivros([...reordenado, ...wishlist]);
    // Persiste no banco em paralelo
    await Promise.all(
      reordenado.map((livro, index) =>
        fetch(`/api/books/${livro.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index }),
        })
      )
    );
  }

  const livrosEstante = livros.filter((l) => l.status !== "wishlist");
  const livrosFiltrados = filtro === "todos" ? livrosEstante : livrosEstante.filter((l) => l.status === filtro);
  const livrosWishlist = livros.filter((l) => l.status === "wishlist");

  const contadores = {
    todos: livrosEstante.length,
    lendo: livros.filter((l) => l.status === "lendo").length,
    lido: livros.filter((l) => l.status === "lido").length,
  };

  return (
    <main className="min-h-screen" style={{ background: "#fdf6ee", backgroundImage: "radial-gradient(#c8956044 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      {/* Header */}
      <div className="shadow-xl" style={{ background: "linear-gradient(135deg, #3d1f08 0%, #7c4a1e 50%, #3d1f08 100%)" }}>
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #d97706, #fbbf24, #d97706)" }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl sm:text-4xl">📚</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-50 tracking-tight leading-none" style={{ fontFamily: "Georgia, serif" }}>
                Minha Estante
              </h1>
              <p className="text-amber-400 text-xs mt-1">
                {livros.length} livro{livros.length !== 1 ? "s" : ""} · {contadores.lido} lido{contadores.lido !== 1 ? "s" : ""} · {contadores.lendo} lendo
              </p>
            </div>
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-amber-400 text-amber-950 rounded-full text-sm font-bold hover:bg-amber-300 transition-colors shadow-lg"
          >
            + Adicionar
          </button>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-1 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAba(tab.id)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all ${
                aba === tab.id ? "bg-[#fdf6ee] text-amber-900 shadow-md" : "text-amber-300 hover:text-amber-100 hover:bg-white/10"
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
        {erro && <p className="text-center text-red-600 mb-4 bg-red-50 border border-red-200 rounded-lg py-3">{erro}</p>}
        {carregando && (
          <div className="flex flex-col items-center justify-center py-20 text-amber-700/60">
            <div className="text-4xl mb-3 animate-bounce">📚</div>
            <p>Carregando sua estante...</p>
          </div>
        )}

        {/* Aba Estante */}
        {!carregando && aba === "estante" && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {[["todos", "Todos", "📚"], ["lendo", "Lendo", "📖"], ["lido", "Lido", "✅"]].map(([val, label, icon]) => (
                <button
                  key={val}
                  onClick={() => setFiltro(val)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                    filtro === val
                      ? "bg-amber-800 text-white shadow-amber-800/30 shadow-md scale-105"
                      : "bg-white text-amber-800 border border-amber-200 hover:border-amber-400 hover:shadow-md"
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filtro === val ? "bg-amber-700 text-amber-200" : "bg-amber-100 text-amber-600"}`}>
                    {contadores[val]}
                  </span>
                </button>
              ))}
            </div>

            {livrosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-amber-700/60">
                <span className="text-6xl mb-4">📚</span>
                <p className="text-lg font-medium">
                  {filtro === "todos" ? "Nenhum livro na estante ainda" : `Nenhum livro com status "${filtro}"`}
                </p>
                {filtro === "todos" && <p className="text-sm mt-1">Adicione o primeiro ou mova da lista de desejos!</p>}
              </div>
            ) : (
              <BookShelf livros={livrosFiltrados} onSelect={setLivroSelecionado} onReorder={reordenarLivros} />
            )}
          </>
        )}

        {/* Aba Wishlist */}
        {!carregando && aba === "wishlist" && (
          <WishlistView livros={livrosWishlist} onSelect={setLivroSelecionado} onMoveToReading={moverParaLendo} />
        )}

        {/* Aba Stats */}
        {!carregando && aba === "stats" && <StatsView livros={livros} />}
      </div>

      {livroSelecionado && (
        <BookModal
          livro={livroSelecionado}
          onClose={() => setLivroSelecionado(null)}
          onUpdate={atualizarLivro}
          onDelete={deletarLivro}
        />
      )}
      {mostrarFormulario && (
        <AddBookModal onClose={() => setMostrarFormulario(false)} onSave={salvarLivro} />
      )}
      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />}
    </main>
  );
}

function StatsView({ livros }) {
  const lidos = livros.filter((l) => l.status === "lido");
  const lendo = livros.filter((l) => l.status === "lendo");
  const wishlist = livros.filter((l) => l.status === "wishlist");

  const mediaAvaliacao = lidos.filter((l) => l.rating).length > 0
    ? (lidos.filter((l) => l.rating).reduce((acc, l) => acc + l.rating, 0) / lidos.filter((l) => l.rating).length).toFixed(1)
    : null;

  const generos = livros.reduce((acc, l) => {
    if (!l.genre) return acc;
    acc[l.genre] = (acc[l.genre] || 0) + 1;
    return acc;
  }, {});
  const topGeneros = Object.entries(generos).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const lidosPorMes = lidos.reduce((acc, l) => {
    if (!l.finishedAt) return acc;
    const mes = new Date(l.finishedAt).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {});
  const ultimosMeses = Object.entries(lidosPorMes).slice(-6);

  const maxMes = Math.max(...ultimosMeses.map(([, v]) => v), 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: livros.length, icon: "📚", color: "from-amber-100 to-amber-50" },
          { label: "Lidos", value: lidos.length, icon: "✅", color: "from-green-100 to-green-50" },
          { label: "Lendo", value: lendo.length, icon: "📖", color: "from-blue-100 to-blue-50" },
          { label: "Quero ler", value: wishlist.length, icon: "🌟", color: "from-purple-100 to-purple-50" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-4 shadow-sm border border-white`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-3xl font-bold text-amber-950">{value}</div>
            <div className="text-xs text-amber-700 font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Avaliação média */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h3 className="text-sm font-bold text-amber-900 mb-3">⭐ Avaliação média</h3>
          {mediaAvaliacao ? (
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-amber-800">{mediaAvaliacao}</span>
              <span className="text-amber-400 text-2xl mb-1">/ 5</span>
            </div>
          ) : (
            <p className="text-amber-400 text-sm">Nenhum livro avaliado ainda</p>
          )}
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="text-lg">{s <= Math.round(mediaAvaliacao || 0) ? "⭐" : "☆"}</span>
            ))}
          </div>
        </div>

        {/* Top gêneros */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h3 className="text-sm font-bold text-amber-900 mb-3">🏷️ Gêneros favoritos</h3>
          {topGeneros.length === 0 ? (
            <p className="text-amber-400 text-sm">Nenhum gênero cadastrado ainda</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topGeneros.map(([genero, count]) => (
                <div key={genero} className="flex items-center gap-2">
                  <div className="flex-1 bg-amber-50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all"
                      style={{ width: `${(count / topGeneros[0][1]) * 100}%` }}
                    />
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
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
        <h3 className="text-sm font-bold text-amber-900 mb-4">📅 Livros lidos por mês</h3>
        {ultimosMeses.length === 0 ? (
          <p className="text-amber-400 text-sm">Nenhum livro com data de conclusão ainda</p>
        ) : (
          <div className="flex items-end gap-2 h-24">
            {ultimosMeses.map(([mes, count]) => (
              <div key={mes} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-amber-800">{count}</span>
                <div
                  className="w-full bg-amber-600 rounded-t-md transition-all"
                  style={{ height: `${(count / maxMes) * 72}px` }}
                />
                <span className="text-[10px] text-amber-500 text-center leading-tight">{mes}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
