"use client";

import { useState } from "react";

const input =
  "w-full bg-amber-50/80 border border-amber-200 rounded-xl px-3.5 py-2.5 text-sm text-amber-950 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 transition";

export default function AuthScreen({ onAuthenticated }) {
  const [modo, setModo]         = useState("login"); // "login" | "register"
  const [name, setName]         = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro]         = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: modo,
          name: name.trim(),
          username: username.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Não foi possível entrar");
        setEnviando(false);
        return;
      }
      onAuthenticated(data.user);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: "#f5ede0",
        backgroundImage: "radial-gradient(#c8956033 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="paper-card rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-amber-200/80 animate-modal-in">
        {/* Topo de madeira */}
        <div
          className="px-6 py-7 text-center relative"
          style={{
            background: "linear-gradient(160deg, #1e0c02 0%, #5c2d0a 50%, #1e0c02 100%)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: "linear-gradient(90deg, #92400e, #fbbf24, #d97706, #fbbf24, #92400e)",
            }}
          />
          <div className="text-5xl mb-2 drop-shadow-lg">📚</div>
          <h1
            className="text-2xl font-bold text-amber-50 tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Minha Estante
          </h1>
          <p className="text-amber-300/80 text-xs mt-1">
            Seu cantinho literário pessoal
          </p>
        </div>

        {/* Seletor Entrar / Criar */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-5 bg-amber-100/70 rounded-xl border border-amber-200/60">
          <button
            type="button"
            onClick={() => { setModo("login"); setErro(""); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              modo === "login"
                ? "bg-amber-800 text-white shadow-sm"
                : "text-amber-800 hover:text-amber-950"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setModo("register"); setErro(""); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              modo === "register"
                ? "bg-amber-800 text-white shadow-sm"
                : "text-amber-800 hover:text-amber-950"
            }`}
          >
            Criar estante
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3.5">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3.5 py-2.5 text-center font-medium">
              ⚠️ {erro}
            </div>
          )}

          {modo === "register" && (
            <div>
              <label className="block text-xs font-semibold text-amber-900 mb-1">
                Como você se chama?
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ju"
                required
                className={input}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-amber-900 mb-1">
              Usuário
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: ju"
              required
              autoCapitalize="none"
              className={input}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-900 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 3 caracteres"
              required
              minLength={3}
              className={input}
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 w-full py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-amber-400/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #fbbf24, #d97706)",
              color: "#1c0a00",
            }}
          >
            {enviando
              ? "⏳ Carregando..."
              : modo === "login"
              ? "📖 Abrir minha estante"
              : "✨ Criar minha estante"}
          </button>
        </form>
      </div>
    </main>
  );
}
