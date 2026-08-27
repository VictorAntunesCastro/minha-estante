"use client";

export default function WishlistView({ livros, onSelect, onMoveToReading }) {
  if (livros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-amber-700/60">
        <span className="text-6xl mb-4">🌟</span>
        <p className="text-lg font-medium">Sua lista de desejos está vazia</p>
        <p className="text-sm mt-1">Adicione livros que você quer ler!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
      {livros.map((livro) => (
        <div
          key={livro.id}
          className="group flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => onSelect(livro)}
        >
          <div className="relative w-full aspect-[2/3] rounded-lg shadow-md overflow-hidden ring-2 ring-transparent group-hover:ring-amber-400 transition-all duration-200 group-hover:-translate-y-1">
            {livro.coverUrl ? (
              <img src={livro.coverUrl} alt={livro.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center p-2">
                <span className="text-amber-800 text-xs text-center font-medium leading-tight">{livro.title}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
          </div>
          <div className="text-center w-full">
            <p className="text-xs font-semibold text-amber-900 truncate leading-tight">{livro.title}</p>
            <p className="text-[10px] text-amber-700/70 truncate">{livro.author}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveToReading(livro.id); }}
            className="w-full text-[10px] py-1 px-2 bg-amber-100 hover:bg-amber-800 hover:text-white text-amber-800 rounded-full transition-colors duration-200 font-medium"
          >
            Começar a ler →
          </button>
        </div>
      ))}
    </div>
  );
}
