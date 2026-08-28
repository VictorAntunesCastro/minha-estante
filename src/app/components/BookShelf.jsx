"use client";

import { useState, useEffect } from "react";

const SPINE_COLORS = [
  { bg: "#7f1d1d", mid: "#991b1b", text: "#fecaca" },
  { bg: "#1e3a5f", mid: "#1d4ed8", text: "#bfdbfe" },
  { bg: "#14532d", mid: "#15803d", text: "#bbf7d0" },
  { bg: "#3b0764", mid: "#7e22ce", text: "#e9d5ff" },
  { bg: "#78350f", mid: "#b45309", text: "#fde68a" },
  { bg: "#881337", mid: "#be123c", text: "#fecdd3" },
  { bg: "#134e4a", mid: "#0f766e", text: "#99f6e4" },
  { bg: "#1e1b4b", mid: "#4338ca", text: "#c7d2fe" },
];

function spineColor(id) {
  return SPINE_COLORS[id % SPINE_COLORS.length];
}

function Lombada({ livro, className = "" }) {
  const { bg, mid, text } = spineColor(livro.id);
  const label = livro.nickname || livro.title;
  return (
    <div
      className={`absolute inset-0 rounded-sm overflow-hidden shadow-md transition-opacity duration-200 ${className}`}
      style={{ background: `linear-gradient(90deg, ${bg} 0%, ${mid} 40%, ${bg} 100%)` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: `linear-gradient(180deg, ${text}33, ${text}88, ${text}33)` }} />
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[9px] font-semibold tracking-wide leading-none select-none"
          style={{
            color: text,
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            maxHeight: "90%",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
            opacity: 0.92,
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function Book({ livro, index, dragIndex, overIndex, onSelect, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const isDragging = dragIndex === index;
  const isOver = overIndex === index && dragIndex !== index;
  const heights = [160, 148, 168, 152, 172, 144, 164, 156, 176, 140];
  const h = heights[livro.id % heights.length];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(livro)}
      title={livro.title}
      className={`cursor-pointer transition-all duration-200 hover:-translate-y-4 relative group flex-shrink-0
        ${isOver ? "ml-5" : ""}
        ${isDragging ? "opacity-30 scale-95" : "opacity-100"}
      `}
      style={{ height: h }}
    >
      {livro.coverUrl ? (
        <div className="relative h-full w-16 flex-shrink-0">
          <Lombada livro={livro} />
          <img
            src={livro.coverUrl}
            alt={livro.title}
            className="absolute inset-0 w-full h-full object-cover rounded-sm shadow-xl"
          />
        </div>
      ) : (
        <div className="relative h-full w-10">
          <Lombada livro={livro} />
        </div>
      )}

      <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-amber-950/95 text-amber-50 text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 max-w-40 text-center leading-tight">
        <p className="font-semibold truncate">{livro.title}</p>
        <p className="text-amber-400 truncate">{livro.author}</p>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-amber-950/95" />
      </div>
    </div>
  );
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

  if (isMobile) {
    const SHELF_SIZE_MOBILE = 6;
    const shelvesMobile = [];
    for (let i = 0; i < livros.length; i += SHELF_SIZE_MOBILE) {
      shelvesMobile.push(livros.slice(i, i + SHELF_SIZE_MOBILE));
    }
    if (shelvesMobile.length === 0) shelvesMobile.push([]);

    return (
      <div className="flex flex-col gap-0 animate-slide-up select-none">
        {shelvesMobile.map((shelfBooks, shelfIdx) => (
          <div key={shelfIdx} className="relative">
            <div className="absolute left-0 top-0 bottom-5 w-3 wood-side rounded-tl-md rounded-bl-sm z-10" />
            <div className="absolute right-0 top-0 bottom-5 w-3 wood-side rounded-tr-md rounded-br-sm z-10" />
            <div className="wood-shelf mx-3 px-3 pt-4 pb-1 flex items-end gap-1 min-h-40 flex-wrap" >
              <div className="absolute top-0 left-3 right-3 h-2 pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 100%)" }} />
              {shelfBooks.map((livro) => {
                const heights = [120, 110, 128, 114, 132, 108];
                const h = heights[livro.id % heights.length];
                const { bg, mid, text } = spineColor(livro.id);
                return (
                  <div
                    key={livro.id}
                    onClick={() => onSelect(livro)}
                    className="cursor-pointer flex-shrink-0 relative active:scale-95 transition-transform"
                    style={{ height: h }}
                  >
                    {livro.coverUrl ? (
                      <div className="relative h-full w-8">
                        <div
                          className="absolute inset-0 rounded-sm overflow-hidden shadow-md"
                          style={{ background: `linear-gradient(90deg, ${bg} 0%, ${mid} 40%, ${bg} 100%)` }}
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: `linear-gradient(180deg, ${text}33, ${text}88, ${text}33)` }} />
                        </div>
                        <img
                          src={livro.coverUrl}
                          alt={livro.title}
                          className="absolute inset-0 w-full h-full object-cover rounded-sm shadow-md"
                        />
                      </div>
                    ) : (
                      <div
                        className="h-full w-8 rounded-sm shadow-md flex items-center justify-center overflow-hidden relative"
                        style={{ background: `linear-gradient(90deg, ${bg} 0%, ${mid} 40%, ${bg} 100%)` }}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: `linear-gradient(180deg, ${text}33, ${text}88, ${text}33)` }} />
                        <span
                          className="text-[7px] font-semibold select-none"
                          style={{
                            color: text,
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            maxHeight: "90%",
                            overflow: "hidden",
                            opacity: 0.9,
                          }}
                        >
                          {livro.nickname || livro.title}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex-shrink-0 w-2 h-24 self-end mb-0.5 rounded-sm opacity-50"
                style={{ background: "linear-gradient(180deg, #c8956044 0%, #8b5e2a 100%)" }} />
            </div>
            <div className="mx-2 h-4 wood-plank rounded-b-sm shadow-xl relative z-10">
              <div className="absolute inset-x-0 top-0 h-px bg-amber-400/20" />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-950/60" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-950/60" />
            </div>
          </div>
        ))}
        <div className="mx-2 h-2.5 rounded-b-xl shadow-2xl" style={{ background: "linear-gradient(180deg, #5c2d0a 0%, #3d1a06 100%)" }} />
        <div className="flex justify-between px-5">
          <div className="w-4 h-2.5 rounded-b-sm" style={{ background: "#2a1004" }} />
          <div className="w-4 h-2.5 rounded-b-sm" style={{ background: "#2a1004" }} />
        </div>
      </div>
    );
  }

  const SHELF_SIZE = 10;
  const shelves = [];
  for (let i = 0; i < livros.length; i += SHELF_SIZE) {
    shelves.push(livros.slice(i, i + SHELF_SIZE));
  }
  if (shelves.length === 0) shelves.push([]);

  return (
    <div className="flex flex-col gap-0 animate-slide-up select-none">
      {shelves.map((shelfBooks, shelfIdx) => {
        const shelfStart = shelfIdx * SHELF_SIZE;
        return (
          <div key={shelfIdx} className="relative">
            <div className="absolute left-0 top-0 bottom-5 w-4 wood-side rounded-tl-lg rounded-bl-sm z-10" />
            <div className="absolute right-0 top-0 bottom-5 w-4 wood-side rounded-tr-lg rounded-br-sm z-10" />
            <div className="wood-shelf mx-4 px-4 pt-5 pb-1 flex items-end gap-1 min-h-52 flex-wrap" onDragOver={(e) => e.preventDefault()}>
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
              <div className="flex-shrink-0 w-3 h-32 self-end mb-0.5 rounded-sm opacity-60"
                style={{ background: "linear-gradient(180deg, #c8956044 0%, #8b5e2a 100%)" }} />
            </div>
            <div className="mx-2 h-5 wood-plank rounded-b-sm shadow-xl relative z-10">
              <div className="absolute inset-x-0 top-0 h-px bg-amber-400/20" />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-950/60 shadow-inner" />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-950/60 shadow-inner" />
            </div>
          </div>
        );
      })}
      <div className="mx-2 h-3 rounded-b-xl shadow-2xl" style={{ background: "linear-gradient(180deg, #5c2d0a 0%, #3d1a06 100%)" }} />
      <div className="flex justify-between px-6">
        <div className="w-5 h-3 rounded-b-sm" style={{ background: "#2a1004" }} />
        <div className="w-5 h-3 rounded-b-sm" style={{ background: "#2a1004" }} />
      </div>
      <p className="text-center text-amber-700/40 text-[10px] mt-2">Arraste para reordenar</p>
    </div>
  );
}
