"use client";

import { useState } from "react";

const STATUS = [
  { val: "wishlist", label: "Quero ler", icon: "🌟" },
  { val: "lendo",    label: "Lendo",     icon: "📖" },
  { val: "lido",     label: "Lido",      icon: "✅" },
];

function toDateInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const input = "w-full bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-950 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 transition";

export default function BookModal({ livro, onClose, onUpdate, onDelete }) {
  const [form, setForm] = useState({
    title:       livro.title,
    author:      livro.author,
    genre:       livro.genre || "",
    coverUrl:    livro.coverUrl || "",
    nickname:    livro.nickname || "",
    notes:       livro.notes || "",
    quote:       livro.quote || "",
    currentPage: livro.currentPage != null ? String(livro.currentPage) : "",
    totalPages:  livro.totalPages != null ? String(livro.totalPages) : "",
    startedAt:   toDateInput(livro.startedAt),
    finishedAt:  toDateInput(livro.finishedAt),
  });
  const [salvando, setSalvando]           = useState(false);
  const [salvou, setSalvou]               = useState(false);
  const [deletando, setDeletando]         = useState(false);
  const [atualizandoStatus, setAtualizandoStatus] = useState(null);
  const [editandoCapa, setEditandoCapa]   = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const temAlteracao =
    form.title       !== livro.title ||
    form.author      !== livro.author ||
    form.genre       !== (livro.genre || "") ||
    form.coverUrl    !== (livro.coverUrl || "") ||
    form.nickname    !== (livro.nickname || "") ||
    form.notes       !== (livro.notes || "") ||
    form.quote       !== (livro.quote || "") ||
    form.currentPage !== (livro.currentPage != null ? String(livro.currentPage) : "") ||
    form.totalPages  !== (livro.totalPages != null ? String(livro.totalPages) : "") ||
    form.startedAt   !== toDateInput(livro.startedAt) ||
    form.finishedAt  !== toDateInput(livro.finishedAt);

  function handleTentativaFechar() {
    if (temAlteracao && !confirm("Você tem alterações não salvas. Deseja fechar sem salvar?")) {
      return;
    }
    onClose();
  }

  async function salvarTudo() {
    if (!form.title.trim() || !form.author.trim()) return;
    setSalvando(true);
    const total = form.totalPages ? Math.max(1, Number(form.totalPages)) : null;
    const atual = form.currentPage !== "" ? Math.max(0, Number(form.currentPage)) : null;
    await onUpdate(livro.id, {
      title:       form.title.trim(),
      author:      form.author.trim(),
      genre:       form.genre.trim() || null,
      coverUrl:    form.coverUrl.trim() || null,
      nickname:    form.nickname.trim() || null,
      notes:       form.notes.trim() || null,
      quote:       form.quote.trim() || null,
      currentPage: total && atual != null ? Math.min(atual, total) : atual,
      totalPages:  total,
      startedAt:   form.startedAt || null,
      finishedAt:  form.finishedAt || null,
    });
    setSalvando(false);
    setSalvou(true);
    setTimeout(() => setSalvou(false), 2000);
  }

  async function mudarStatus(val) {
    setAtualizandoStatus(val);
    const payload = { status: val };
    if (val === "lido" && form.totalPages) {
      payload.currentPage = Number(form.totalPages);
    }
    const atualizado = await onUpdate(livro.id, payload);
    if (atualizado) {
      setForm((prev) => ({
        ...prev,
        currentPage: atualizado.currentPage != null ? String(atualizado.currentPage) : prev.currentPage,
        startedAt:   toDateInput(atualizado.startedAt),
        finishedAt:  toDateInput(atualizado.finishedAt),
      }));
    }
    setAtualizandoStatus(null);
  }

  async function handleDelete() {
    if (!confirm("Remover este livro da estante?")) return;
    setDeletando(true);
    await onDelete(livro.id);
    setDeletando(false);
  }

  const capaAtual = form.coverUrl || livro.coverUrl;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-40" onClick={handleTentativaFechar}>
      <div
        className="paper-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto animate-modal-in border border-amber-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header com capa ── */}
        <div className="relative h-32 rounded-t-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #2d1206, #7c4a1e)" }}>
          {capaAtual && (
            <img src={capaAtual} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 scale-110 blur-sm" />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(45,18,6,0.7), rgba(124,74,30,0.5))" }} />
          <button onClick={handleTentativaFechar} className="absolute top-3 right-3 text-white/60 hover:text-white text-lg leading-none z-10 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition">✕</button>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fdf8f0] to-transparent" />
        </div>

        {/* ── Capa + título ── */}
        <div className="flex gap-4 px-6 -mt-14 mb-5 relative z-10">
          <div className="relative flex-shrink-0 group" onClick={() => setEditandoCapa((v) => !v)}>
            {capaAtual ? (
              <img src={capaAtual} alt={form.title} className="w-20 h-28 object-cover rounded-lg shadow-xl ring-2 ring-white cursor-pointer" />
            ) : (
              <div className="w-20 h-28 bg-gradient-to-br from-amber-200 to-amber-400 rounded-lg shadow-xl ring-2 ring-white flex items-center justify-center cursor-pointer">
                <span className="text-amber-800 text-[9px] text-center font-medium px-1 leading-tight">{form.title}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
              <span className="text-white text-xs font-semibold">✏️ Capa</span>
            </div>
          </div>
          <div className="pt-16 min-w-0 flex-1">
            <input
              value={form.title}
              onChange={set("title")}
              className="w-full text-lg font-bold text-amber-950 bg-transparent border-b border-transparent hover:border-amber-300 focus:border-amber-500 focus:outline-none transition leading-tight pb-0.5"
              style={{ fontFamily: "Georgia, serif" }}
              placeholder="Título"
            />
            <input
              value={form.author}
              onChange={set("author")}
              className="w-full text-sm text-amber-700 bg-transparent border-b border-transparent hover:border-amber-300 focus:border-amber-500 focus:outline-none transition mt-1 pb-0.5"
              placeholder="Autor"
            />
            {form.genre && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100/80 text-amber-800 text-[11px] font-medium rounded-full border border-amber-200/60">
                🏷️ {form.genre}
              </span>
            )}
          </div>
        </div>

        {/* ── Campo de URL da capa (expansível) ── */}
        {editandoCapa && (
          <div className="px-6 mb-4 animate-slide-up">
            <label className="block text-xs font-semibold text-amber-800 mb-1.5">🖼️ URL da capa</label>
            <input value={form.coverUrl} onChange={set("coverUrl")} placeholder="https://..." className={input} />
          </div>
        )}

        <div className="px-6 pb-6 flex flex-col gap-5">
          {/* ── Status ── */}
          <div>
            <p className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">Status</p>
            <div className="flex gap-2">
              {STATUS.map(({ val, label, icon }) => (
                <button
                  key={val}
                  onClick={() => mudarStatus(val)}
                  disabled={atualizandoStatus !== null}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    livro.status === val
                      ? "bg-amber-800 text-white border-amber-800 shadow-md shadow-amber-800/20"
                      : "bg-white text-amber-700 border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                  } disabled:opacity-60`}
                >
                  {atualizandoStatus === val ? <span className="animate-spin inline-block">⏳</span> : <span>{icon}</span>}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Avaliação ── */}
          <div>
            <p className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">Avaliação</p>
            <div className="flex gap-1 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onUpdate(livro.id, { rating: livro.rating === star ? null : star })}
                  className="text-2xl leading-none hover:scale-125 transition-transform active:scale-110"
                >
                  {star <= (livro.rating || 0) ? "⭐" : "☆"}
                </button>
              ))}
              {livro.rating && <span className="text-xs text-amber-500 ml-2">{livro.rating}/5</span>}
            </div>
          </div>

          {/* ── Gênero + Apelido ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1.5 uppercase tracking-wide">🏷️ Gênero</label>
              <input value={form.genre} onChange={set("genre")} placeholder="Ex: Romance, Fantasia..." className={input} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1.5 uppercase tracking-wide">
                🔖 Apelido <span className="text-amber-400 font-normal normal-case">(na lombada)</span>
              </label>
              <input value={form.nickname} onChange={set("nickname")} placeholder={form.title} className={input} />
            </div>
          </div>

          {/* ── Progresso de Páginas ── */}
          <div className="bg-amber-100/50 border border-amber-200/70 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">📖 Progresso de Leitura</span>
              {Number(form.totalPages) > 0 && (
                <span className="text-xs font-bold text-amber-800">
                  {Math.min(100, Math.round(((Number(form.currentPage) || 0) / Number(form.totalPages)) * 100))}% concluído
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-amber-700 mb-1">Página atual</label>
                <input
                  type="number"
                  min="0"
                  max={form.totalPages || undefined}
                  value={form.currentPage}
                  onChange={set("currentPage")}
                  placeholder="Ex: 120"
                  className={input}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-amber-700 mb-1">Total de páginas</label>
                <input
                  type="number"
                  min="1"
                  value={form.totalPages}
                  onChange={set("totalPages")}
                  placeholder="Ex: 350"
                  className={input}
                />
              </div>
            </div>
            {Number(form.totalPages) > 0 && (
              <div className="w-full h-2.5 bg-amber-200/70 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-amber-700 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round(((Number(form.currentPage) || 0) / Number(form.totalPages)) * 100))}%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* ── Datas ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1.5">📅 Início</label>
              <input type="date" value={form.startedAt} onChange={set("startedAt")} className={input} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1.5">🏁 Conclusão</label>
              <input type="date" value={form.finishedAt} onChange={set("finishedAt")} className={input} />
            </div>
          </div>

          {/* ── Citação favorita ── */}
          <div>
            <label className="block text-xs font-semibold text-amber-800 mb-1.5 uppercase tracking-wide">
              💬 Citação / Frase Favorita
            </label>
            <textarea
              value={form.quote}
              onChange={set("quote")}
              placeholder="“Aquela frase do livro que ficou marcada no coração...”"
              rows={2}
              className={`${input} resize-none italic`}
              style={{ fontFamily: "Georgia, serif" }}
            />
          </div>

          {/* ── Notas ── */}
          <div>
            <label className="block text-xs font-semibold text-amber-800 mb-1.5 uppercase tracking-wide">📝 Notas / Resenha</label>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              placeholder="Escreva suas impressões sobre o livro..."
              rows={3}
              className={`${input} resize-none`}
            />
          </div>

          {/* ── Botões ── */}
          <div className="flex gap-2 pt-1">
            {temAlteracao ? (
              <button
                onClick={salvarTudo}
                disabled={salvando || !form.title.trim() || !form.author.trim()}
                className="flex-1 px-4 py-2.5 bg-amber-800 text-white rounded-xl hover:bg-amber-900 disabled:opacity-60 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-800/20"
              >
                {salvando ? (
                  <><span className="animate-spin">⏳</span> Salvando...</>
                ) : salvou ? (
                  <><span>✓</span> Salvo!</>
                ) : (
                  "💾 Salvar alterações"
                )}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-amber-800 text-white rounded-xl hover:bg-amber-900 font-semibold text-sm transition-all shadow-md shadow-amber-800/20"
              >
                Fechar
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deletando}
              className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 text-sm font-semibold transition-all disabled:opacity-60 flex items-center gap-1"
            >
              {deletando ? <span className="animate-spin">⏳</span> : "🗑️"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
