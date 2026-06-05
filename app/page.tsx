"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
const [menuAberto, setMenuAberto] = useState(false);
  return (
    <main
  className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center relative"
  style={{
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/fundo.png')",
  }}
>
  <button
  onClick={() => setMenuAberto(!menuAberto)}
  className="absolute top-4 right-4 text-white text-3xl"
>
  ☰
</button>
{menuAberto && (
  <div className="absolute top-16 right-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg overflow-hidden">
    <button
      onClick={() => {
  setMenuAberto(false);
  router.push("/adm");
}}
      className="block w-full text-left px-4 py-3 hover:bg-zinc-800"
    >
      Acesso Interno
    </button>
  </div>
)}
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-md rounded-3xl p-8 text-center">

       <h1 className="text-2xl font-bold mb-4">
  Olá, você é VIP!
</h1>

<p className="text-zinc-400 mb-4">
  Acompanhe seu pedido aqui!
</p>

<div className="flex flex-col gap-4">

  <button
    onClick={() => router.push("/cliente")}
    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition"
  >
    Quero acompanhar!
  </button>

  

</div>

      </div>
    </main>
  );
}