"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, ArrowRight, Lock, X } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/fundo.png')",
      }}
    >
      <button
        onClick={() => setMenuAberto(!menuAberto)}
        className="absolute top-4 right-4 text-white p-2.5 bg-zinc-900/60 border border-zinc-800 backdrop-blur-md rounded-xl hover:bg-zinc-800 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg"
        title="Menu"
      >
        {menuAberto ? <X size={20} /> : <Menu size={20} />}
      </button>

      {menuAberto && (
        <div className="absolute top-16 right-4 bg-zinc-900/90 border border-zinc-800 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden min-w-44 animate-[slideDown_0.2s_ease-out]">
          <button
            onClick={() => {
              setMenuAberto(false);
              router.push("/adm");
            }}
            className="w-full text-left px-4 py-3 hover:bg-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-2 cursor-pointer"
          >
            <Lock size={13} /> Acesso Interno
          </button>
        </div>
      )}

      <div className="w-full max-w-sm bg-zinc-950/65 border border-zinc-900 backdrop-blur-md rounded-3xl p-8 text-center shadow-2xl">
        <h1 className="text-2xl font-extrabold mb-2 tracking-tight text-white">
          Olá, você é VIP!
        </h1>

        <p className="text-zinc-400 text-xs mb-6">
          Acompanhe seu pedido aqui!
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/cliente")}
            className="relative overflow-hidden bg-blue-600 hover:bg-blue-755 hover:scale-105 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer text-xs uppercase tracking-wider"
          >
            <span className="relative z-10">Quero acompanhar!</span>
            <ArrowRight size={14} className="relative z-10" />
            <span className="shine"></span>
          </button>
        </div>
      </div>
    </main>
  );
}