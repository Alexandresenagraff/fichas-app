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
  <main
  className="min-h-screen bg-black flex items-center justify-center p-6 relative"
  onClick={() => {
    if (menuAberto) setMenuAberto(false)
  }}
>

    <button
      onClick={() => setMenuAberto(!menuAberto)}
      className="absolute top-6 right-6 text-white text-3xl"
    >
      ☰
    </button>

    {menuAberto && (
  <div
  onClick={(e) => e.stopPropagation()}
  className="absolute top-0 right-0 h-auto w-50 bg-zinc-800/90 text-white p-6 z-50"
>

    <h2 className="text-left font-bold mb-6">
    SETORES
    </h2>

    <div className="space-y-6">

      <button className="w-full text-left py-2 border-b border-zinc-600 text-sm">
  ▸ COMERCIAL
</button>

<div>
  <button
    onClick={() => setDesignersAberto(!designersAberto)}
    className="w-full text-left py-2 border-b border-zinc-600 text-sm"
  >
    {designersAberto ? "▾ DESIGNERS" : "▸ DESIGNERS"}
  </button>

  {designersAberto && (
    <div className="ml-4 mt-2 space-y-2 text-xs text-zinc-300">
      <button className="block w-full text-left">LÁZARO</button>
      <button className="block w-full text-left">EDIVAN</button>
      <button className="block w-full text-left">ALEXANDRE</button>
      <button className="block w-full text-left">PAULÃO</button>
    </div>
  )}
</div>

<button className="w-full text-left py-2 border-b border-zinc-600 text-sm">
  ▸ IMPRESSÃO
</button>

<button className="w-full text-left py-2 border-b border-zinc-600 text-sm">
  ▸ PRENSA
</button>

<button className="w-full text-left py-2 border-b border-zinc-600 text-sm">
  ▸ CORTE
</button>

<button className="w-full text-left py-2 border-b border-zinc-600 text-sm">
  ▸ COSTURA
</button>

<button className="w-full text-left py-2 border-b border-zinc-600 text-sm">
  ▸ CONFERÊNCIA
</button>

<button className="w-full text-left py-2 border-b border-zinc-600 text-sm">
  ▸ ENVIO
</button>

<button className="w-full text-left py-2">
  ▸ ADMINISTRAÇÃO
</button>

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