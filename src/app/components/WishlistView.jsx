"use client";

import { useState } from "react";

export default function WishlistView({ livros, onSelect, onMoveToReading, onReorder }) {
  const [movendo, setMovendo]   = useState(null);
  const [dragIdx, setDragIdx]   = useState(null);
  const [overIdx, setOverIdx]   = useState(null);

  async function handleMover(id) {
    setMovendo(id);
    await onMoveToReading(id);
    setMovendo(null);
  }

  function handleDrop(index) {
    if (dragIdx === null || dragIdx === index) { setDragIdx(null); setOverIdx(null); return; }
    const reordenado = [...livros];
    const [moved] = reordenado.splice(dragIdx, 1);
    reordenado.splice(index, 0, moved);
    onReorder?.(reordenado);
    setDragIdx(null); setOverIdx(null);
  }

  if (livros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-amber-700/50 animate-slide-up">
        <span className="text-6xl mb-4">🌟</span>
        <p className="text-lg font-medium" style={{ fontFamily: "Georgia, serif" }}>Sua lista de desejos está vazia</p>
        <p className="text-sm mt-1">Adicione livros que você quer ler!</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <p className="text-xs text-amber-600/60 mb-4 text-right">Arraste para reordenar</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {livros.map((livro, index) => (
          <div
            key={livro.id}
            draggable
            onDragStart={() => setDragIdx(index)}
            onDragOver={(e) => { e.preventDefault(); setOverIdx(index); }}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
            className={`group flex flex-col items-center gap-2 cursor-pointer transition-all duration-200
              ${overIdx === index && dragIdx !== index ? "scale-105 -translate-y-1" : ""}
              ${dragIdx === index ? "opacity-30" : "opacity-100"}
            `}
            onClick={() => onSelect(livro)}
          >
            <div className="relative w-full aspect-[2/3] rounded-lg shadow-md overflow-hidden ring-2 ring-transparent group-hover:ring-amber-400 transition-all duration-200 group-hover:-translate-y-1">
              {livro.coverUrl ? (
                <img src={livro.coverUrl} alt={livro.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center p-2">
                  <span className="text-amber-800 text-xs text-center font-medium leading-tight">{livro.title}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            </div>

            <div className="text-center w-full">
              <p className="text-xs font-semibold text-amber-900 truncate leading-tight">{livro.title}</p>
              <p className="text-[10px] text-amber-700/60 truncate">{livro.author}</p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleMover(livro.id); }}
              disabled={movendo === livro.id}
              className="w-full text-[10px] py-1.5 px-2 bg-amber-100 hover:bg-amber-800 hover:text-white text-amber-800 rounded-full transition-all duration-200 font-semibold disabled:opacity-60 flex items-center justify-center gap-1"
            >
              {movendo === livro.id ? (
                <><span className="animate-spin inline-block">⏳</span> Movendo...</>
              ) : (
                "Começar a ler →"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
