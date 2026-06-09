"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Adm() {
  const [senha, setSenha] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const router = useRouter();

  function entrar() {
    if (senha === "123") {
      router.push("/fichas");
    } else {
      alert("Senha incorreta");
    }
  }

  return (
  <main className="min-h-screen bg-black flex items-center justify-center p-6 relative">

    <button
      onClick={() => setMenuAberto(!menuAberto)}
      className="absolute top-6 right-6 text-white text-3xl"
    >
      ☰
    </button>

    {menuAberto && (
  <div className="absolute top-0 right-0 h-auto w-50 bg-zinc-800/80 text-white p-6 z-50">

    <h2 className="text-center font-bold mb-6">
    SETORES
    </h2>

    <div className="space-y-4">

      <p>👤 COMERCIAL</p>
<p>✏️ DESIGNERS</p>
<p>🖨️ IMPRESSÃO</p>
<p>🔥 PRENSA</p>
<p>✂️ CORTE</p>
<p>🧵 COSTURA</p>
<p>✔️ CONFERÊNCIA</p>
<p>📦 ENVIO</p>
<p>⚙️ ADMINISTRAÇÃO</p>

    </div>

  </div>
)}

    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

      <h1 className="text-3xl font-bold text-white text-center mb-2">
        Área ADM
      </h1>

        <p className="text-zinc-400 text-center mb-6">
          Informe a senha administrativa
        </p>

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full bg-black border border-zinc-700 rounded-2xl p-3 text-white mb-4 outline-none"
        />

        <button
          onClick={entrar}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl"
        >
          Entrar
        </button>

      </div>
    </main>
  );
}