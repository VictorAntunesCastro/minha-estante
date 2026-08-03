"use client";

import { useState, useEffect } from "react";

export default function AddBookModal({ onClose, onSave }) {
  const [novoLivro, setNovoLivro] = useState({ title: "", author: "", coverUrl: "", genre: "" });
  const [buscaTexto, setBuscaTexto] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (buscaTexto.trim().length < 3) { setResultadosBusca([]); return; }
    setBuscando(true);
    const timer = setTimeout(() => {
      fetch(`/api/search-books?q=${encodeURIComponent(buscaTexto)}`)
        .then((res) => res.json())
        .then((data) => { setResultadosBusca(data); setBuscando(false); });
    }, 500);
    return () => clearTimeout(timer);
  }, [buscaTexto]);

  function selecionarResultado(livro) {
    setNovoLivro({ title: livro.title, author: livro.author, coverUrl: livro.coverUrl, genre: livro.genre });
    setBuscaTexto("");
    setResultadosBusca([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    await onSave(novoLivro);
    setSalvando(false);
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-40"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-3">Adicionar Livro</h2>

        {/* Busca */}
        <div className="relative mb-3">
          <input
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
            placeholder="Buscar livro pelo título..."
            className="border rounded px-3 py-2 w-full"
          />
          {buscando && <p className="text-xs text-gray-400 mt-1">Buscando...</p>}
          {resultadosBusca.length > 0 && (
            <div className="absolute z-10 bg-white border rounded shadow-lg w-full max-h-60 overflow-y-auto mt-1">
              {resultadosBusca.map((resultado, index) => (
                <div
                  key={index}
                  onClick={() => selecionarResultado(resultado)}
                  className="flex items-center gap-2 p-2 hover:bg-amber-50 cursor-pointer border-b last:border-b-0"
                >
                  {resultado.coverUrl ? (
                    <img src={resultado.coverUrl} alt={resultado.title} className="w-8 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-8 h-12 bg-amber-200 rounded" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium">{resultado.title}</p>
                    <p className="text-gray-500 text-xs">{resultado.author}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mb-2">Ou preencha manualmente:</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="title" value={novoLivro.title} onChange={(e) => setNovoLivro({ ...novoLivro, title: e.target.value })} placeholder="Título" required className="border rounded px-3 py-2" />
          <input name="author" value={novoLivro.author} onChange={(e) => setNovoLivro({ ...novoLivro, author: e.target.value })} placeholder="Autor" required className="border rounded px-3 py-2" />
          <input name="genre" value={novoLivro.genre} onChange={(e) => setNovoLivro({ ...novoLivro, genre: e.target.value })} placeholder="Gênero (opcional)" className="border rounded px-3 py-2" />
          <input name="coverUrl" value={novoLivro.coverUrl} onChange={(e) => setNovoLivro({ ...novoLivro, coverUrl: e.target.value })} placeholder="URL da capa (opcional)" className="border rounded px-3 py-2" />

          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={salvando} className="flex-1 px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 disabled:opacity-60">
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
