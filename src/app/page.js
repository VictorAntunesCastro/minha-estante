"use client";

import { useState } from "react";

const livrosFalsos = [
  { id: 1, title: "Orgulho e Preconceito", author: "Jane Austen", coverUrl: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg", rating: 5, genre: "Romance" },
  { id: 2, title: "1984", author: "George Orwell", coverUrl: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg", rating: 4, genre: "Ficção" },
  { id: 3, title: "O Hobbit", author: "J.R.R. Tolkien", coverUrl: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg", rating: 5, genre: "Fantasia" },
];

export default function Home() {
  const [livroSelecionado, setLivroSelecionado] = useState(null);

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8 text-center">
        Minha Estante
      </h1>

      {/* Prateleira */}
      <div className="relative bg-amber-800 rounded-lg p-6 shadow-xl">
        <div className="flex gap-4 flex-wrap justify-center pb-4">
          {livrosFalsos.map((livro) => (
            <div
              key={livro.id}
              onClick={() => setLivroSelecionado(livro)}
              className="cursor-pointer transition-transform hover:-translate-y-3 hover:scale-105"
            >
              <img
                src={livro.coverUrl}
                alt={livro.title}
                className="w-28 h-40 object-cover rounded shadow-md"
              />
            </div>
          ))}
        </div>
        {/* Prateleira de madeira (a "tábua") */}
        <div className="h-4 bg-amber-900 rounded-b-lg"></div>
      </div>

      {/* Modal */}
      {livroSelecionado && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setLivroSelecionado(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full flex gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={livroSelecionado.coverUrl}
              alt={livroSelecionado.title}
              className="w-32 h-48 object-cover rounded shadow-md"
            />
            <div>
              <h2 className="text-xl font-bold">{livroSelecionado.title}</h2>
              <p className="text-gray-600">{livroSelecionado.author}</p>
              <p className="text-sm text-gray-500 mt-2">{livroSelecionado.genre}</p>
              <p className="mt-2">{"⭐".repeat(livroSelecionado.rating)}</p>
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