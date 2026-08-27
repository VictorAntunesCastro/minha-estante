"use client";

import { useState, useEffect } from "react";

const input = "w-full bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2.5 text-sm text-amber-950 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 transition";

export default function AddBookModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", author: "", coverUrl: "", genre: "", status: "wishlist" });
  const [busca, setBusca]           = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando]     = useState(false);
  const [erroBusca, setErroBusca]   = useState(false);
  const [salvando, setSalvando]     = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (busca.trim().length < 3) { setResultados([]); setErroBusca(false); return; }
    setBuscando(true);
    setErroBusca(false);
    const timer = setTimeout(() => {
      fetch(`/api/search-books?q=${encodeURIComponent(busca)}`)
        .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
        .then((data) => { setResultados(data); setBuscando(false); })
        .catch(() => { setErroBusca(true); setBuscando(false); setResultados([]); });
    }, 500);
    return () => clearTimeout(timer);
  }, [busca]);

  function selecionar(livro) {
    setForm({ ...form, title: livro.title, author: livro.author, coverUrl: livro.coverUrl, genre: livro.genre });
    setBusca(""); setResultados([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    await onSave(form);
    setSalvando(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="paper-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-modal-in border border-amber-200/60">

        {/* Header */}
        <div className="px-6 py-5 border-b border-amber-100" style={{ background: "linear-gradient(135deg, #2d1206 0%, #7c4a1e 100%)" }}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-amber-50" style={{ fontFamily: "Georgia, serif" }}>Adicionar Livro</h2>
              <p className="text-amber-400/80 text-xs mt-0.5">Busque ou preencha manualmente</p>
            </div>
            <button onClick={onClose} className="text-amber-400/60 hover:text-amber-200 text-lg leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition">✕</button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* Busca */}
          <div className="relative">
            <label className="block text-xs font-semibold text-amber-800 mb-1.5 uppercase tracking-wide">🔍 Buscar pelo título</label>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Ex: Harry Potter, Dom Casmurro..."
              className={input}
            />
            {buscando && <p className="text-xs text-amber-500 mt-1.5 animate-pulse">Buscando livros...</p>}
            {erroBusca && <p className="text-xs text-red-500 mt-1.5">Não foi possível buscar. Preencha manualmente.</p>}

            {resultados.length > 0 && (
              <div className="absolute z-10 bg-white border border-amber-200 rounded-xl shadow-2xl w-full max-h-64 overflow-y-auto mt-1">
                {resultados.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => selecionar(r)}
                    className="flex items-center gap-3 p-3 hover:bg-amber-50 cursor-pointer border-b border-amber-100/60 last:border-b-0 transition-colors"
                  >
                    {r.coverUrl ? (
                      <img src={r.coverUrl} alt={r.title} className="w-9 h-12 object-cover rounded shadow-sm flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-12 bg-gradient-to-br from-amber-200 to-amber-300 rounded flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-amber-950 truncate">{r.title}</p>
                      <p className="text-amber-600 text-xs truncate">{r.author}</p>
                      {r.genre && <p className="text-amber-400 text-[10px] truncate italic">{r.genre}</p>}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-amber-800 mb-1.5">Título *</label>
                <input value={form.title} onChange={set("title")} placeholder="Ex: Cem Anos de Solidão" required className={input} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-amber-800 mb-1.5">Autor *</label>
                <input value={form.author} onChange={set("author")} placeholder="Ex: Gabriel García Márquez" required className={input} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-amber-800 mb-1.5">Gênero</label>
                <input value={form.genre} onChange={set("genre")} placeholder="Ex: Romance" className={input} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-amber-800 mb-1.5">Adicionar como</label>
                <select value={form.status} onChange={set("status")} className={input}>
                  <option value="wishlist">🌟 Quero ler</option>
                  <option value="lendo">📖 Lendo</option>
                  <option value="lido">✅ Lido</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-amber-800 mb-1.5">URL da capa</label>
                <input value={form.coverUrl} onChange={set("coverUrl")} placeholder="https://..." className={input} />
              </div>
            </div>

            {/* Preview */}
            {(form.coverUrl || form.title) && (
              <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100 animate-slide-up">
                {form.coverUrl ? (
                  <img src={form.coverUrl} alt="preview" className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0" onError={(e) => (e.target.style.display = "none")} />
                ) : (
                  <div className="w-10 h-14 bg-gradient-to-br from-amber-200 to-amber-300 rounded shadow-sm flex-shrink-0" />
                )}
                <div className="text-xs min-w-0">
                  <p className="font-semibold text-amber-900 truncate">{form.title || "Sem título"}</p>
                  <p className="text-amber-600 truncate">{form.author || "Sem autor"}</p>
                  {form.genre && <p className="text-amber-400 italic truncate">{form.genre}</p>}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 px-4 py-2.5 bg-amber-800 text-white rounded-xl hover:bg-amber-900 disabled:opacity-60 font-semibold text-sm transition-all shadow-md shadow-amber-800/20 flex items-center justify-center gap-2"
              >
                {salvando ? <><span className="animate-spin">⏳</span> Salvando...</> : "📚 Salvar livro"}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-100 text-sm transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
