"use client";

import { useState, useEffect, useCallback } from "react";
import BookShelf from "./components/BookShelf";
import BookModal from "./components/BookModal";
import AddBookModal from "./components/AddBookModal";
import Toast from "./components/Toast";

const STATUS_LABELS = {
  wishlist: "Quero ler",
  lendo: "Lendo",
  lido: "Lido",
};

export default function Home() {
  const [livros, setLivros] = useState([]);
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [toast, setToast] = useState(null);

  function mostrarToast(mensagem, tipo = "sucesso") {
    setToast({ mensagem, tipo });
  }

  function buscarLivros() {
    setErro(null);
    fetch("/api/books")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar livros");
        return res.json();
      })
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
    const atualizado = await res.json();
    setLivros((prev) => prev.map((l) => (l.id === id ? atualizado : l)));
    setLivroSelecionado(atualizado);
  }

  async function deletarLivro(id) {
    await fetch(`/api/books/${id}`, { method: "DELETE" });
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

  function reordenarLivros(reordenado) {
    setLivros(reordenado);
  }

  const livrosFiltrados = filtro === "todos" ? livros : livros.filter((l) => l.status === filtro);

  const contadores = {
    todos: livros.length,
    wishlist: livros.filter((l) => l.status === "wishlist").length,
    lendo: livros.filter((l) => l.status === "lendo").length,
    lido: livros.filter((l) => l.status === "lido").length,
  };

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900">Minha Estante</h1>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
        >
          + Adicionar Livro
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 max-w-4xl mx-auto flex-wrap">
        {[["todos", "Todos"], ["wishlist", "Quero ler"], ["lendo", "Lendo"], ["lido", "Lido"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFiltro(val)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filtro === val ? "bg-amber-800 text-white" : "bg-amber-100 text-amber-800 hover:bg-amber-200"
            }`}
          >
            {label} ({contadores[val]})
          </button>
        ))}
      </div>

      {erro && <p className="text-center text-red-600 mb-4">{erro}</p>}
      {carregando && <p className="text-center text-amber-700">Carregando livros...</p>}

      {!carregando && livrosFiltrados.length === 0 && (
        <p className="text-center text-amber-700">
          {filtro === "todos"
            ? "Nenhum livro na estante ainda. Adicione o primeiro!"
            : `Nenhum livro com status "${STATUS_LABELS[filtro]}".`}
        </p>
      )}

      {!carregando && livrosFiltrados.length > 0 && (
        <BookShelf
          livros={livrosFiltrados}
          onSelect={setLivroSelecionado}
          onReorder={reordenarLivros}
        />
      )}

      {livroSelecionado && (
        <BookModal
          livro={livroSelecionado}
          onClose={() => setLivroSelecionado(null)}
          onUpdate={atualizarLivro}
          onDelete={deletarLivro}
        />
      )}

      {mostrarFormulario && (
        <AddBookModal
          onClose={() => setMostrarFormulario(false)}
          onSave={salvarLivro}
        />
      )}

      {toast && (
        <Toast
          mensagem={toast.mensagem}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
