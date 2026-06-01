"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">

        <h1 className="text-4xl font-bold text-white mb-2">
          Área VIP Senagraff
        </h1>

        <p className="text-zinc-400 mb-8">
          Bem-vindo!
        </p>

        <div className="flex flex-col gap-4">

          <button
            onClick={() => router.push("/cliente")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition"
          >
            Área do Cliente
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