"use client";

import { useState } from "react";

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

  function handleDragStart(index) {
    setDragIndex(index);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    setOverIndex(index);
  }

  function handleDrop(index) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const reordenado = [...livros];
    const [moved] = reordenado.splice(dragIndex, 1);
    reordenado.splice(index, 0, moved);
    onReorder(reordenado);
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="relative bg-amber-800 rounded-lg p-6 shadow-xl max-w-4xl mx-auto">
      <div className="flex gap-1 flex-wrap justify-center pb-4 items-end min-h-48">
        {livros.map((livro, index) => (
          <div
            key={livro.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
            onClick={() => onSelect(livro)}
            className={`cursor-pointer transition-all duration-200 hover:-translate-y-3 hover:scale-105 relative group
              ${overIndex === index && dragIndex !== index ? "ml-6" : ""}
              ${dragIndex === index ? "opacity-40" : "opacity-100"}
            `}
          >
            {livro.coverUrl ? (
              /* Capa frontal ao hover, lombada por padrão */
              <div className="relative w-10 h-40 group-hover:w-28 transition-all duration-200">
                {/* Lombada */}
                <div
                  className={`absolute inset-0 rounded shadow-md flex items-center justify-center overflow-hidden group-hover:opacity-0 transition-opacity duration-200 ${STATUS_COLORS[livro.status]}`}
                  style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                >
                  <span className="text-white text-[10px] font-medium px-1 truncate max-h-full rotate-180 leading-tight">
                    {livro.nickname || livro.title}
                  </span>
                </div>
                {/* Capa (aparece no hover) */}
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

            {/* Badge de status (só aparece no hover) */}
            <span className={`absolute bottom-1 left-0 right-0 text-center text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${STATUS_COLORS[livro.status]}`}>
              {STATUS_LABELS[livro.status]}
            </span>
          </div>
        ))}
      </div>
      <div className="h-4 bg-amber-900 rounded-b-lg"></div>
    </div>
  );
}
