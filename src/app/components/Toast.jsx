"use client";

import { useEffect } from "react";

const CONFIG = {
  sucesso: { icon: "✓", bg: "bg-amber-900", bar: "bg-amber-500" },
  erro:    { icon: "✕", bg: "bg-red-800",   bar: "bg-red-400"   },
  info:    { icon: "ℹ", bg: "bg-stone-700", bar: "bg-stone-400" },
};

export default function Toast({ mensagem, tipo = "sucesso", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  const { icon, bg, bar } = CONFIG[tipo] ?? CONFIG.sucesso;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${bg} text-amber-50 pl-4 pr-5 py-3 rounded-xl shadow-2xl z-50 animate-fade-in flex items-center gap-3 min-w-56 max-w-xs overflow-hidden`}
      style={{ fontFamily: "Georgia, serif" }}
    >
      <span className="text-base leading-none opacity-80">{icon}</span>
      <span className="text-sm font-medium flex-1">{mensagem}</span>
      <button onClick={onClose} className="opacity-40 hover:opacity-80 text-xs leading-none ml-1">✕</button>
      {/* barra de progresso */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 ${bar} rounded-full`}
        style={{ animation: "shrink 3.2s linear forwards" }}
      />
      <style>{`@keyframes shrink { from { width: 100% } to { width: 0% } }`}</style>
    </div>
  );
}
