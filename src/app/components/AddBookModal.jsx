"use client";

import { useState, useEffect } from "react";

const inputClass = "w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-sm text-amber-950 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition";

export default function AddBookModal({ onClose, onSave }) {
  const [novoLivro, setNovoLivro] = useState({ title: "", author: "", coverUrl: "", genre: "", status: "wishlist" });
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
    setNovoLivro({ ...novoLivro, title: livro.title, author: livro.author, coverUrl: livro.coverUrl, genre: livro.genre });
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

        {/* Header do modal */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>Adicionar Livro</h2>
            <p className="text-amber-300 text-xs mt-0.5">Busque ou preencha manualmente</p>
          </div>
          <button onClick={onClose} className="text-amber-300 hover:text-white text-xl leading-none transition-colors">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Busca */}
          <div className="relative">
            <label className="block text-xs font-semibold text-amber-800 mb-1.5">🔍 Buscar pelo título</label>
            <input
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              placeholder="Ex: Harry Potter, Dom Casmurro..."
              className={inputClass}
            />
            {buscando && <p className="text-xs text-amber-500 mt-1 animate-pulse">Buscando...</p>}
            {resultadosBusca.length > 0 && (
              <div className="absolute z-10 bg-white border border-amber-200 rounded-xl shadow-xl w-full max-h-60 overflow-y-auto mt-1">
                {resultadosBusca.map((resultado, index) => (
                  <div
                    key={index}
                    onClick={() => selecionarResultado(resultado)}
                    className="flex items-center gap-3 p-3 hover:bg-amber-50 cursor-pointer border-b border-amber-100 last:border-b-0 transition-colors"
                  >
                    {resultado.coverUrl ? (
                      <img src={resultado.coverUrl} alt={resultado.title} className="w-9 h-13 object-cover rounded shadow-sm flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-13 bg-amber-200 rounded flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-amber-950 truncate">{resultado.title}</p>
                      <p className="text-amber-600 text-xs truncate">{resultado.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-amber-400">
            <div className="flex-1 h-px bg-amber-100" />
            ou preencha manualmente
            <div className="flex-1 h-px bg-amber-100" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1.5">Título *</label>
              <input value={novoLivro.title} onChange={(e) => setNovoLivro({ ...novoLivro, title: e.target.value })} placeholder="Ex: Cem Anos de Solidão" required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1.5">Autor *</label>
              <input value={novoLivro.author} onChange={(e) => setNovoLivro({ ...novoLivro, author: e.target.value })} placeholder="Ex: Gabriel García Márquez" required className={inputClass} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-amber-800 mb-1.5">Gênero</label>
                <input value={novoLivro.genre} onChange={(e) => setNovoLivro({ ...novoLivro, genre: e.target.value })} placeholder="Ex: Romance" className={inputClass} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-amber-800 mb-1.5">Adicionar como</label>
                <select value={novoLivro.status} onChange={(e) => setNovoLivro({ ...novoLivro, status: e.target.value })} className={inputClass}>
                  <option value="wishlist">🌟 Quero ler</option>
                  <option value="lendo">📖 Lendo</option>
                  <option value="lido">✅ Lido</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1.5">URL da capa</label>
              <input value={novoLivro.coverUrl} onChange={(e) => setNovoLivro({ ...novoLivro, coverUrl: e.target.value })} placeholder="https://..." className={inputClass} />
            </div>

            {/* Preview da capa */}
            {novoLivro.coverUrl && (
              <div className="flex items-center gap-3 bg-amber-50 rounded-lg p-3 border border-amber-100">
                <img src={novoLivro.coverUrl} alt="preview" className="w-10 h-14 object-cover rounded shadow-sm" onError={(e) => e.target.style.display = "none"} />
                <div className="text-xs text-amber-700">
                  <p className="font-semibold">{novoLivro.title || "Sem título"}</p>
                  <p className="text-amber-500">{novoLivro.author || "Sem autor"}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={salvando} className="flex-1 px-4 py-2.5 bg-amber-800 text-white rounded-lg hover:bg-amber-900 disabled:opacity-60 font-semibold text-sm transition-colors">
                {salvando ? "Salvando..." : "Salvar livro"}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 text-sm transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
