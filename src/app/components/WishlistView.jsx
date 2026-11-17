"use client";

import { useState } from "react";

export default function WishlistView({ livros, onSelect, onMoveToReading, onReorder }) {
  const [movendo, setMovendo]             = useState(null);
  const [dragIdx, setDragIdx]             = useState(null);
  const [overIdx, setOverIdx]             = useState(null);
  const [sorteando, setSorteando]         = useState(false);
  const [indiceAnimado, setIndiceAnimado] = useState(null);
  const [livroSorteado, setLivroSorteado] = useState(null);

  async function handleMover(id) {
    setMovendo(id);
    await onMoveToReading(id);
    setMovendo(null);
  }

  function sortearLivro() {
    if (livros.length === 0 || sorteando) return;
    if (livros.length === 1) {
      setLivroSorteado(livros[0]);
      return;
    }

    setSorteando(true);
    setLivroSorteado(null);

    // Escolhe um livro diferente do último sorteado, se possível
    const candidatos = livroSorteado
      ? livros.filter((l) => l.id !== livroSorteado.id)
      : livros;
    const escolhido = candidatos[Math.floor(Math.random() * candidatos.length)];

    let passos = 0;
    const totalPassos = 12;
    const intervalo = setInterval(() => {
      setIndiceAnimado(Math.floor(Math.random() * livros.length));
      passos += 1;
      if (passos >= totalPassos) {
        clearInterval(intervalo);
        const idxFinal = livros.findIndex((l) => l.id === escolhido.id);
        setIndiceAnimado(idxFinal);
        setTimeout(() => {
          setSorteando(false);
          setIndiceAnimado(null);
          setLivroSorteado(escolhido);
        }, 280);
      }
    }, 90);
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
      {/* Barra superior: Sorteador + dica de arrastar */}
      <div className="flex items-center justify-between gap-2 mb-5 flex-wrap">
        {livros.length >= 2 ? (
          <button
            onClick={sortearLivro}
            disabled={sorteando}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #fbbf24, #d97706)", color: "#1c0a00" }}
          >
            <span className={sorteando ? "animate-spin inline-block" : ""}>🎲</span>
            {sorteando ? "Sorteando sua próxima leitura..." : "Indecisa? Sortear próxima leitura ✨"}
          </button>
        ) : <div />}
        <p className="text-xs text-amber-600/60 ml-auto">Arraste para reordenar</p>
      </div>

      {/* Card do Livro Sorteado */}
      {livroSorteado && (
        <div className="paper-card border-2 border-amber-400 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl animate-modal-in relative overflow-hidden">
          <div className="flex items-start gap-4">
            {livroSorteado.coverUrl ? (
              <img
                src={livroSorteado.coverUrl}
                alt={livroSorteado.title}
                onClick={() => onSelect(livroSorteado)}
                className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-lg shadow-lg ring-2 ring-amber-300 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
              />
            ) : (
              <div
                onClick={() => onSelect(livroSorteado)}
                className="w-20 h-28 sm:w-24 sm:h-36 bg-gradient-to-br from-amber-200 to-amber-400 rounded-lg shadow-lg ring-2 ring-amber-300 flex items-center justify-center p-2 flex-shrink-0 cursor-pointer"
              >
                <span className="text-amber-900 text-xs text-center font-semibold leading-tight">{livroSorteado.title}</span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200/80 text-amber-900">
                  ✨ Escolha do destino!
                </span>
                <button
                  onClick={() => setLivroSorteado(null)}
                  className="text-amber-400 hover:text-amber-800 text-sm leading-none p-1"
                >
                  ✕
                </button>
              </div>

              <h3
                onClick={() => onSelect(livroSorteado)}
                className="text-base sm:text-lg font-bold text-amber-950 mt-1.5 truncate cursor-pointer hover:underline"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {livroSorteado.title}
              </h3>
              <p className="text-xs sm:text-sm text-amber-700 truncate">{livroSorteado.author}</p>
              {livroSorteado.genre && (
                <p className="text-xs text-amber-500 italic mt-0.5">🏷️ {livroSorteado.genre}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-3.5">
                <button
                  onClick={() => handleMover(livroSorteado.id)}
                  disabled={movendo === livroSorteado.id}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-full text-xs font-semibold shadow-md transition-all disabled:opacity-60 flex items-center gap-1.5"
                >
                  {movendo === livroSorteado.id ? (
                    <><span className="animate-spin inline-block">⏳</span> Movendo...</>
                  ) : (
                    "📖 Começar a ler agora!"
                  )}
                </button>
                <button
                  onClick={sortearLivro}
                  className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full text-xs font-semibold transition-all"
                >
                  🎲 Sortear outro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {livros.map((livro, index) => {
          const isAnimando = indiceAnimado === index;
          const isEscolhido = livroSorteado?.id === livro.id;
          return (
          <div
            key={livro.id}
            draggable
            onDragStart={() => setDragIdx(index)}
            onDragOver={(e) => { e.preventDefault(); setOverIdx(index); }}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
            className={`group flex flex-col items-center gap-2 cursor-pointer transition-all duration-200
              ${overIdx === index && dragIdx !== index ? "scale-105 -translate-y-1" : ""}
              ${isAnimando ? "scale-105 -translate-y-2" : ""}
              ${dragIdx === index ? "opacity-30" : "opacity-100"}
            `}
            onClick={() => onSelect(livro)}
          >
            <div className={`relative w-full aspect-[2/3] rounded-lg shadow-md overflow-hidden ring-2 transition-all duration-200 group-hover:-translate-y-1 ${
              isAnimando || isEscolhido
                ? "ring-amber-400 shadow-amber-400/40 shadow-xl"
                : "ring-transparent group-hover:ring-amber-400"
            }`}>
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
          );
        })}
      </div>
    </div>
  );
}
