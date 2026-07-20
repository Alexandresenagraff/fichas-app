"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  areNotificationSoundsEnabled,
  primeNotificationSounds,
  setNotificationSoundsEnabled,
} from "../lib/notificationSounds";

export default function Configuracoes() {
  const router = useRouter();
  const [sonsAtivados, setSonsAtivados] = useState(true);

  useEffect(() => {
    // Lê uma preferência que só existe no navegador.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSonsAtivados(areNotificationSoundsEnabled());
  }, []);

  function atualizarSons(ativado: boolean) {
    setNotificationSoundsEnabled(ativado);
    setSonsAtivados(ativado);
    if (ativado) primeNotificationSounds();
  }

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-xl mx-auto pt-2">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-95 transition-all duration-150 text-zinc-300 hover:text-white"
          title="Voltar"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="mt-7 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Configurações</h1>
          <p className="text-zinc-500 text-xs mt-1">Preferências do sistema</p>
        </div>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700">
              <Bell size={18} className="text-zinc-200" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Sons de notificações</h2>
              <p className="text-xs text-zinc-500 mt-1">Reproduzir sons para novas notificações recebidas em tempo real.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => atualizarSons(true)}
              className={`flex-1 rounded-xl border px-4 py-3 text-xs font-bold transition-colors ${sonsAtivados ? "bg-blue-600 border-blue-500 text-white" : "bg-black border-zinc-800 text-zinc-400 hover:bg-zinc-800"}`}
              aria-pressed={sonsAtivados}
            >
              Ativado
            </button>
            <button
              onClick={() => atualizarSons(false)}
              className={`flex-1 rounded-xl border px-4 py-3 text-xs font-bold transition-colors ${!sonsAtivados ? "bg-zinc-700 border-zinc-600 text-white" : "bg-black border-zinc-800 text-zinc-400 hover:bg-zinc-800"}`}
              aria-pressed={!sonsAtivados}
            >
              Desativado
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
