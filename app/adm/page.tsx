"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";

export default function Adm() {
  const [senha, setSenha] = useState("");
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
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 active:scale-90 transition-all duration-200 text-zinc-400 hover:text-white cursor-pointer shadow-lg"
        title="Voltar"
      >
        <ArrowLeft size={16} />
      </button>

      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl">
        <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-700">
          <Lock size={20} className="text-zinc-300" />
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-1">
          Área Administrativa
        </h1>

        <p className="text-zinc-500 text-center text-xs mb-6 font-medium">
          Informe a senha de acesso
        </p>

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              entrar();
            }
          }}
          className="w-full bg-black border border-zinc-750 rounded-xl p-3 text-sm text-white mb-4 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
        />

        <button
          onClick={entrar}
          className="w-full bg-green-600 hover:bg-green-700 hover:scale-102 active:scale-98 text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-xs uppercase tracking-wider cursor-pointer shadow-lg"
        >
          Entrar
        </button>
      </div>
    </main>
  );
}