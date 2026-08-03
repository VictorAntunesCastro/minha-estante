"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [livros, setLivros] = useState([]);
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoLivro, setNovoLivro] = useState({
    title: "",
    author: "",
    coverUrl: "",
    genre: "",
  });

  function buscarLivros() {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        setLivros(data);
        setCarregando(false);
      });
  }

  useEffect(() => {
    buscarLivros();
  }, []);

  function handleChange(e) {
    setNovoLivro({ ...novoLivro, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoLivro),
    });

    setNovoLivro({ title: "", author: "", coverUrl: "", genre: "" });
    setMostrarFormulario(false);
    buscarLivros();
  }

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900">Minha Estante</h1>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
        >
          + Adicionar Livro
        </button>
      </div>

      {carregando && (
        <p className="text-center text-amber-700">Carregando livros...</p>
      )}

      {!carregando && livros.length === 0 && (
        <p className="text-center text-amber-700">
          Nenhum livro na estante ainda. Adicione o primeiro!
        </p>
      )}

      {!carregando && livros.length > 0 && (
        <div className="relative bg-amber-800 rounded-lg p-6 shadow-xl max-w-4xl mx-auto">
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

      {/* Modal de detalhes do livro */}
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

      {/* Modal de adicionar livro */}
      {mostrarFormulario && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setMostrarFormulario(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 max-w-md w-full flex flex-col gap-3"
          >
            <h2 className="text-xl font-bold mb-2">Adicionar Livro</h2>

            <input
              name="title"
              value={novoLivro.title}
              onChange={handleChange}
              placeholder="Título"
              required
              className="border rounded px-3 py-2"
            />
            <input
              name="author"
              value={novoLivro.author}
              onChange={handleChange}
              placeholder="Autor"
              required
              className="border rounded px-3 py-2"
            />
            <input
              name="genre"
              value={novoLivro.genre}
              onChange={handleChange}
              placeholder="Gênero (opcional)"
              className="border rounded px-3 py-2"
            />
            <input
              name="coverUrl"
              value={novoLivro.coverUrl}
              onChange={handleChange}
              placeholder="URL da capa (opcional)"
              className="border rounded px-3 py-2"
            />

            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
