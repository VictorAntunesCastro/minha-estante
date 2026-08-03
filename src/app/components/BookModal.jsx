"use client";

import { useState } from "react";

const STATUS_LABELS = {
  wishlist: "Quero ler",
  lendo: "Lendo",
  lido: "Lido",
};

export default function BookModal({ livro, onClose, onUpdate, onDelete }) {
  const [notes, setNotes] = useState(livro.notes || "");
  const [salvandoNotes, setSalvandoNotes] = useState(false);
  const [nickname, setNickname] = useState(livro.nickname || "");
  const [salvandoNickname, setSalvandoNickname] = useState(false);

  async function salvarNotes() {
    setSalvandoNotes(true);
    await onUpdate(livro.id, { notes });
    setSalvandoNotes(false);
  }

  async function salvarNickname() {
    setSalvandoNickname(true);
    await onUpdate(livro.id, { nickname });
    setSalvandoNickname(false);
  }

  function formatarData(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-lg w-full flex gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Capa */}
        {livro.coverUrl ? (
          <img src={livro.coverUrl} alt={livro.title} className="w-32 h-48 object-cover rounded shadow-md flex-shrink-0" />
        ) : (
          <div className="w-32 h-48 bg-amber-200 rounded shadow-md flex-shrink-0 flex items-center justify-center text-amber-700 text-xs text-center p-2">
            {livro.title}
          </div>
        )}

        <div className="flex flex-col flex-1 min-w-0 gap-3">
          <div>
            <h2 className="text-xl font-bold leading-tight">{livro.title}</h2>
            <p className="text-gray-600 text-sm">{livro.author}</p>
            {livro.genre && <p className="text-xs text-gray-400 mt-0.5">{livro.genre}</p>}
          </div>

          {/* Status */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <div className="flex gap-1 flex-wrap">
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => onUpdate(livro.id, { status: val })}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    livro.status === val ? "bg-amber-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Datas */}
          <div className="flex gap-4 text-xs text-gray-500">
            <span>Início: {formatarData(livro.startedAt)}</span>
            <span>Fim: {formatarData(livro.finishedAt)}</span>
          </div>

          {/* Avaliação */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Avaliação</p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onUpdate(livro.id, { rating: livro.rating === star ? null : star })}
                  className="text-xl leading-none hover:scale-110 transition-transform"
                >
                  {star <= (livro.rating || 0) ? "⭐" : "☆"}
                </button>
              ))}
            </div>
          </div>

          {/* Apelido */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Apelido <span className="text-gray-300">(aparece na lombada)</span></p>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={livro.title}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            {nickname !== (livro.nickname || "") && (
              <button
                onClick={salvarNickname}
                disabled={salvandoNickname}
                className="mt-1 px-3 py-1 bg-amber-700 text-white text-xs rounded hover:bg-amber-800 disabled:opacity-60"
              >
                {salvandoNickname ? "Salvando..." : "Salvar apelido"}
              </button>
            )}
          </div>

          {/* Notas */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Notas / Resenha</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escreva suas impressões sobre o livro..."
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            {notes !== (livro.notes || "") && (
              <button
                onClick={salvarNotes}
                disabled={salvandoNotes}
                className="mt-1 px-3 py-1 bg-amber-700 text-white text-xs rounded hover:bg-amber-800 disabled:opacity-60"
              >
                {salvandoNotes ? "Salvando..." : "Salvar nota"}
              </button>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-2 mt-auto pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 text-sm"
            >
              Fechar
            </button>
            <button
              onClick={() => { if (confirm("Remover este livro?")) onDelete(livro.id); }}
              className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
