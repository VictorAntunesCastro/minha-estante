"use client";

import { useState, useEffect } from "react";

const SPINE_COLORS = [
  "from-red-800 to-red-950",
  "from-blue-800 to-blue-950",
  "from-emerald-700 to-emerald-950",
  "from-violet-800 to-violet-950",
  "from-amber-700 to-amber-950",
  "from-rose-700 to-rose-950",
  "from-teal-700 to-teal-950",
  "from-indigo-700 to-indigo-950",
];

function spineColor(id) {
  return SPINE_COLORS[id % SPINE_COLORS.length];
}

export default function BookShelf({ livros, onSelect, onReorder }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  function handleDrop(index) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null); setOverIndex(null); return;
    }
    const reordenado = [...livros];
    const [moved] = reordenado.splice(dragIndex, 1);
    reordenado.splice(index, 0, moved);
    onReorder(reordenado);
    setDragIndex(null); setOverIndex(null);
  }

  /* ── Mobile: grid de capas ── */
  if (isMobile) {
    return (
      <div className="grid grid-cols-3 gap-3 animate-slide-up">
        {livros.map((livro) => (
          <div key={livro.id} onClick={() => onSelect(livro)} className="flex flex-col items-center gap-1 cursor-pointer group">
            <div className="relative w-full aspect-[2/3] rounded-lg shadow-lg overflow-hidden ring-2 ring-transparent group-hover:ring-amber-400 transition-all duration-200 group-hover:-translate-y-1">
              {livro.coverUrl ? (
                <img src={livro.coverUrl} alt={livro.title} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-b ${spineColor(livro.id)} flex items-center justify-center p-2`}>
                  <span className="text-white/90 text-[10px] text-center font-medium leading-tight">{livro.nickname || livro.title}</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-amber-900 text-center truncate w-full leading-tight font-medium">{livro.nickname || livro.title}</p>
          </div>
        ))}
      </div>
    );
  }

  /* ── Desktop: estante com prateleiras ── */
  const SHELF_SIZE = 10;
  const shelves = [];
  for (let i = 0; i < livros.length; i += SHELF_SIZE) {
    shelves.push(livros.slice(i, i + SHELF_SIZE));
  }
  if (shelves.length === 0) shelves.push([]);

  let globalIndex = 0;

  return (
    <div className="flex flex-col gap-0 animate-slide-up select-none">
      {shelves.map((shelfBooks, shelfIdx) => {
        const shelfStart = shelfIdx * SHELF_SIZE;
        return (
          <div key={shelfIdx} className="relative">
            {/* Lateral esquerda */}
            <div className="absolute left-0 top-0 bottom-5 w-4 wood-side rounded-tl-lg rounded-bl-sm z-10" />
            {/* Lateral direita */}
            <div className="absolute right-0 top-0 bottom-5 w-4 wood-side rounded-tr-lg rounded-br-sm z-10" />

            {/* Área dos livros */}
            <div
              className="wood-shelf mx-4 px-4 pt-5 pb-1 flex items-end gap-1 min-h-52 flex-wrap"
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Sombra interna no topo */}
              <div className="absolute top-0 left-4 right-4 h-3 pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 100%)" }} />

              {shelfBooks.map((livro, localIdx) => {
                const gi = shelfStart + localIdx;
                return (
                  <Book
                    key={livro.id}
                    livro={livro}
                    index={gi}
                    dragIndex={dragIndex}
                    overIndex={overIndex}
                    onSelect={onSelect}
                    onDragStart={() => setDragIndex(gi)}
                    onDragOver={() => setOverIndex(gi)}
                    onDrop={() => handleDrop(gi)}
                    onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                  />
                );
              })}

              {/* Bookend decorativo */}
              <div className="flex-shrink-0 w-3 h-32 self-end mb-0.5 rounded-sm opacity-60"
                style={{ background: "linear-gradient(180deg, #c8956044 0%, #8b5e2a 100%)" }} />
            </div>

            {/* Prateleira (tábua) */}
            <div className="mx-2 h-5 wood-plank rounded-b-sm shadow-xl relative z-10">
              <div className="absolute inset-x-0 top-0 h-px bg-amber-400/20" />
              {/* Parafusos decorativos */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-950/60 shadow-inner" />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-950/60 shadow-inner" />
            </div>
          </div>
        );
      })}

      {/* Base da estante */}
      <div className="mx-2 h-3 rounded-b-xl shadow-2xl"
        style={{ background: "linear-gradient(180deg, #5c2d0a 0%, #3d1a06 100%)" }} />
      <div className="flex justify-between px-6">
        <div className="w-5 h-3 rounded-b-sm" style={{ background: "#2a1004" }} />
        <div className="w-5 h-3 rounded-b-sm" style={{ background: "#2a1004" }} />
      </div>

      <p className="text-center text-amber-700/40 text-[10px] mt-2">
        Arraste para reordenar
      </p>
    </div>
  );
}

function Book({ livro, index, dragIndex, overIndex, onSelect, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const isDragging = dragIndex === index;
  const isOver = overIndex === index && dragIndex !== index;

  /* Altura variada para parecer mais real */
  const heights = [160, 148, 168, 152, 172, 144, 164, 156, 176, 140];
  const h = heights[livro.id % heights.length];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      title={livro.title}
      className={`
        cursor-pointer transition-all duration-200 hover:-translate-y-4 relative group flex-shrink-0
        ${isOver ? "ml-5" : ""}
        ${isDragging ? "opacity-30 scale-95" : "opacity-100"}
      `}
      style={{ height: h }}
    >
      {livro.coverUrl ? (
        /* Livro com capa */
        <div className="relative h-full group-hover:w-28 w-10 transition-all duration-200">
          {/* Lombada visível quando fechado */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${spineColor(livro.id)} rounded-sm shadow-md flex items-center justify-center overflow-hidden group-hover:opacity-0 transition-opacity duration-200`}
            style={{ writingMode: "vertical-rl" }}
          >
            <span className="text-white/90 text-[9px] font-medium px-0.5 truncate rotate-180 leading-tight max-h-full">
              {livro.nickname || livro.title}
            </span>
            {/* Reflexo na lombada */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 rounded-l-sm" />
          </div>
          {/* Capa ao hover */}
          <img
            src={livro.coverUrl}
            alt={livro.title}
            className="absolute inset-0 w-full h-full object-cover rounded-sm shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          />
        </div>
      ) : (
        /* Livro sem capa */
        <div
          className={`h-full w-10 group-hover:w-24 transition-all duration-200 bg-gradient-to-b ${spineColor(livro.id)} rounded-sm shadow-md flex items-center justify-center overflow-hidden relative`}
          style={{ writingMode: "vertical-rl" }}
        >
          <span className="text-white/90 text-[9px] font-medium px-0.5 truncate rotate-180 leading-tight max-h-full">
            {livro.nickname || livro.title}
          </span>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 rounded-l-sm" />
        </div>
      )}

      {/* Tooltip ao hover */}
      <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-amber-950/95 text-amber-50 text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 max-w-40 text-center leading-tight">
        <p className="font-semibold truncate">{livro.title}</p>
        <p className="text-amber-400 truncate">{livro.author}</p>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-amber-950/95" />
      </div>
    </div>
  );
}
