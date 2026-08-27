"use client";

import { useState, useEffect } from "react";

const STATUS_COLORS = {
  wishlist: "bg-gray-400",
  lendo: "bg-blue-500",
  lido: "bg-green-600",
};

const STATUS_LABELS = {
  wishlist: "Quero ler",
  lendo: "Lendo",
  lido: "Lido",
};

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

  // Mobile: grid de capas
  if (isMobile) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {livros.map((livro) => (
          <div key={livro.id} onClick={() => onSelect(livro)} className="flex flex-col items-center gap-1 cursor-pointer group">
            <div className="relative w-full aspect-[2/3] rounded-lg shadow-md overflow-hidden ring-2 ring-transparent group-hover:ring-amber-400 transition-all">
              {livro.coverUrl ? (
                <img src={livro.coverUrl} alt={livro.title} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full ${STATUS_COLORS[livro.status]} flex items-center justify-center p-2`}>
                  <span className="text-white text-[10px] text-center font-medium leading-tight">{livro.nickname || livro.title}</span>
                </div>
              )}
              <span className={`absolute bottom-0 left-0 right-0 text-center text-white text-[9px] py-0.5 ${STATUS_COLORS[livro.status]}`}>
                {STATUS_LABELS[livro.status]}
              </span>
            </div>
            <p className="text-[10px] text-amber-900 text-center truncate w-full leading-tight">{livro.nickname || livro.title}</p>
          </div>
        ))}
      </div>
    );
  }

  // Desktop: estante com drag-and-drop
  return (
    <div
      className="relative rounded-xl shadow-2xl max-w-4xl mx-auto overflow-hidden"
      style={{ background: "linear-gradient(180deg, #7c4a1e 0%, #5c3310 60%, #3d2008 100%)" }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-950 to-amber-900 rounded-l-xl" />
      <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-amber-950 to-amber-900 rounded-r-xl" />
      <div className="flex gap-1 flex-wrap justify-center px-6 pt-6 pb-4 items-end min-h-52">
        {livros.map((livro, index) => (
          <div
            key={livro.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => { e.preventDefault(); setOverIndex(index); }}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
            onClick={() => onSelect(livro)}
            className={`cursor-pointer transition-all duration-200 hover:-translate-y-3 hover:scale-105 relative group
              ${overIndex === index && dragIndex !== index ? "ml-6" : ""}
              ${dragIndex === index ? "opacity-40" : "opacity-100"}
            `}
          >
            {livro.coverUrl ? (
              <div className="relative w-10 h-40 group-hover:w-28 transition-all duration-200">
                <div
                  className={`absolute inset-0 rounded shadow-md flex items-center justify-center overflow-hidden group-hover:opacity-0 transition-opacity duration-200 ${STATUS_COLORS[livro.status]}`}
                  style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                >
                  <span className="text-white text-[10px] font-medium px-1 truncate max-h-full rotate-180 leading-tight">
                    {livro.nickname || livro.title}
                  </span>
                </div>
                <img
                  src={livro.coverUrl}
                  alt={livro.title}
                  className="absolute inset-0 w-full h-full object-cover rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
              </div>
            ) : (
              <div
                className={`w-10 h-40 group-hover:w-28 transition-all duration-200 ${STATUS_COLORS[livro.status]} rounded shadow-md flex items-center justify-center overflow-hidden`}
                style={{ writingMode: "vertical-rl" }}
              >
                <span className="text-white text-[10px] font-medium px-1 truncate rotate-180 leading-tight">
                  {livro.nickname || livro.title}
                </span>
              </div>
            )}
            <span className={`absolute bottom-1 left-0 right-0 text-center text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${STATUS_COLORS[livro.status]}`}>
              {STATUS_LABELS[livro.status]}
            </span>
          </div>
        ))}
      </div>
      <div className="h-5 mx-3 rounded-b-lg shadow-inner" style={{ background: "linear-gradient(180deg, #8B4513 0%, #5c2d0a 100%)" }} />
      <div className="flex justify-between px-8">
        <div className="w-4 h-3 bg-amber-950 rounded-b-sm" />
        <div className="w-4 h-3 bg-amber-950 rounded-b-sm" />
      </div>
    </div>
  );
}
