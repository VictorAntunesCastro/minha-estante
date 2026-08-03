"use client";

import { useEffect } from "react";

export default function Toast({ mensagem, tipo = "sucesso", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const cores = {
    sucesso: "bg-green-600",
    erro: "bg-red-600",
  };

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${cores[tipo]} text-white px-5 py-3 rounded-lg shadow-lg z-50 animate-fade-in text-sm`}>
      {mensagem}
    </div>
  );
}
