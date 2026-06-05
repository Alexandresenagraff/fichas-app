"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main
  className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center"
  style={{
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/fundo.png')",
  }}
>
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">

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

  <button
    onClick={() => router.push("/adm")}
    className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition"
  >
    Área ADM
  </button>

</div>

      </div>
    </main>
  );
}