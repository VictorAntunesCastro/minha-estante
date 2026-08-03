"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [livros, setLivros] = useState([]);
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        setLivros(data);
        setCarregando(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8 text-center">
        Minha Estante
      </h1>

      {carregando && (
        <p className="text-center text-amber-700">Carregando livros...</p>
      )}

      {!carregando && livros.length === 0 && (
        <p className="text-center text-amber-700">
          Nenhum livro na estante ainda. Adicione o primeiro!
        </p>
      )}

      {!carregando && livros.length > 0 && (
        <div className="relative bg-amber-800 rounded-lg p-6 shadow-xl">
          <div className="flex gap-4 flex-wrap justify-center pb-4">
            {livros.map((livro) => (
              <div
                key={livro.id}
                onClick={() => setLivroSelecionado(livro)}
                className="cursor-pointer transition-transform hover:-translate-y-3 hover:scale-105"
              >
                {livro.coverUrl ? (
                  <img
                    src={livro.coverUrl}
                    alt={livro.title}
                    className="w-28 h-40 object-cover rounded shadow-md"
                  />
                ) : (
                  <div className="w-28 h-40 bg-amber-600 rounded shadow-md flex items-center justify-center p-2 text-center text-white text-xs">
                    {livro.title}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="h-4 bg-amber-900 rounded-b-lg"></div>
        </div>
      )}

      {livroSelecionado && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setLivroSelecionado(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full flex gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {livroSelecionado.coverUrl && (
              <img
                src={livroSelecionado.coverUrl}
                alt={livroSelecionado.title}
                className="w-32 h-48 object-cover rounded shadow-md"
              />
            )}
            <div>
              <h2 className="text-xl font-bold">{livroSelecionado.title}</h2>
              <p className="text-gray-600">{livroSelecionado.author}</p>
              <p className="text-sm text-gray-500 mt-2">{livroSelecionado.genre}</p>
              {livroSelecionado.rating && (
                <p className="mt-2">{"⭐".repeat(livroSelecionado.rating)}</p>
              )}
              <button
                onClick={() => setLivroSelecionado(null)}
                className="mt-4 px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
