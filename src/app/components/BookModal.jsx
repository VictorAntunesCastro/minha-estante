"use client";

import { useState } from "react";

const STATUS_LABELS = { wishlist: "Quero ler", lendo: "Lendo", lido: "Lido" };
const STATUS_ICONS = { wishlist: "🌟", lendo: "📖", lido: "✅" };

function toDateInput(iso) {
  if (!iso) return "";
  return new Date(iso).toISOString().split("T")[0];
}

export default function BookModal({ livro, onClose, onUpdate, onDelete }) {
  const [notes, setNotes] = useState(livro.notes || "");
  const [nickname, setNickname] = useState(livro.nickname || "");
  const [startedAt, setStartedAt] = useState(toDateInput(livro.startedAt));
  const [finishedAt, setFinishedAt] = useState(toDateInput(livro.finishedAt));
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [atualizandoStatus, setAtualizandoStatus] = useState(null);

  async function salvarTudo() {
    setSalvando(true);
    await onUpdate(livro.id, {
      notes,
      nickname,
      startedAt: startedAt || null,
      finishedAt: finishedAt || null,
    });
    setSalvando(false);
  }

  async function mudarStatus(val) {
    setAtualizandoStatus(val);
    await onUpdate(livro.id, { status: val });
    setAtualizandoStatus(null);
  }

  async function handleDelete() {
    if (!confirm("Remover este livro da estante?")) return;
    setDeletando(true);
    await onDelete(livro.id);
    setDeletando(false);
  }

  const temAlteracao =
    notes !== (livro.notes || "") ||
    nickname !== (livro.nickname || "") ||
    startedAt !== toDateInput(livro.startedAt) ||
    finishedAt !== toDateInput(livro.finishedAt);

  const inputClass = "w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com capa */}
        <div className="relative h-28 rounded-t-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #3d1f08, #7c4a1e)" }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: livro.coverUrl ? `url(${livro.coverUrl})` : "none", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(8px)", transform: "scale(1.1)" }}
          />
          <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white text-xl leading-none z-10">✕</button>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="flex gap-4 px-6 -mt-12 mb-4 relative z-10">
          {livro.coverUrl ? (
            <img src={livro.coverUrl} alt={livro.title} className="w-20 h-28 object-cover rounded-lg shadow-xl flex-shrink-0 ring-2 ring-white" />
          ) : (
            <div className="w-20 h-28 bg-gradient-to-br from-amber-200 to-amber-300 rounded-lg shadow-xl flex-shrink-0 ring-2 ring-white flex items-center justify-center p-2">
              <span className="text-amber-800 text-[10px] text-center font-medium leading-tight">{livro.title}</span>
            </div>
          )}
          <div className="pt-14 min-w-0">
            <h2 className="text-lg font-bold text-amber-950 leading-tight" style={{ fontFamily: "Georgia, serif" }}>{livro.title}</h2>
            <p className="text-amber-700 text-sm font-medium">{livro.author}</p>
            {livro.genre && <p className="text-xs text-amber-500 italic mt-0.5">{livro.genre}</p>}
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-amber-800 mb-2">Status</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => mudarStatus(val)}
                  disabled={atualizandoStatus !== null}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    livro.status === val
                      ? "bg-amber-800 text-white shadow-md"
                      : "bg-amber-50 text-amber-700 border border-amber-200 hover:border-amber-400"
                  } disabled:opacity-60`}
                >
                  {atualizandoStatus === val ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <span>{STATUS_ICONS[val]}</span>
                  )}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Avaliação */}
          <div>
            <p className="text-xs font-semibold text-amber-800 mb-2">Avaliação</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onUpdate(livro.id, { rating: livro.rating === star ? null : star })}
                  className="text-2xl leading-none hover:scale-125 transition-transform"
                >
                  {star <= (livro.rating || 0) ? "⭐" : "☆"}
                </button>
              ))}
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1.5">📅 Início da leitura</label>
              <input type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1.5">🏁 Conclusão</label>
              <input type="date" value={finishedAt} onChange={(e) => setFinishedAt(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Apelido */}
          <div>
            <label className="block text-xs font-semibold text-amber-800 mb-1.5">
              🏷️ Apelido <span className="text-amber-400 font-normal">(aparece na lombada)</span>
            </label>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={livro.title} className={inputClass} />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-amber-800 mb-1.5">📝 Notas / Resenha</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escreva suas impressões sobre o livro..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-1">
            {temAlteracao ? (
              <button
                onClick={salvarTudo}
                disabled={salvando}
                className="flex-1 px-4 py-2.5 bg-amber-800 text-white rounded-lg hover:bg-amber-900 disabled:opacity-60 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {salvando ? <><span className="animate-spin">⏳</span> Salvando...</> : "💾 Salvar alterações"}
              </button>
            ) : (
              <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-amber-800 text-white rounded-lg hover:bg-amber-900 font-semibold text-sm transition-colors">
                Fechar
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deletando}
              className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-1"
            >
              {deletando ? <span className="animate-spin">⏳</span> : "🗑️"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
