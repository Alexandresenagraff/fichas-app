"use client";

import { Check } from "lucide-react";
import app from "../../firebase/config";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import SectorDashboard from "../components/SectorDashboard";
import { Ficha, formatarDataHora } from "../lib/helpers";

const db = getFirestore(app);

const entryCondition = (ficha: Ficha) => ficha.corte === true;
const pendingCondition = (ficha: Ficha) =>
  ficha.corte === true && ficha.costuraConcluida === false;
const completedCondition = (ficha: Ficha) => ficha.costuraConcluida === true;

async function selecionarCostureiro(
  id: string,
  paulo: boolean,
  celina: boolean
) {
  try {
    await updateDoc(doc(db, "fichas", id), {
      costureiroPaulo: paulo,
      costureiroCelina: celina,
    });
  } catch (error) {
    console.error(error);
    alert("Erro ao atualizar");
  }
}

async function marcarCosturaConcluida(id: string) {
  try {
    await updateDoc(doc(db, "fichas", id), {
      costuraConcluida: true,
      costuraData: formatarDataHora(),
    });
  } catch (error) {
    console.error(error);
    alert("Erro ao atualizar");
  }
}

export default function Costura() {
  return (
    <SectorDashboard
      title="COSTURA"
      description="Pedidos aguardando costura"
      entryCondition={entryCondition}
      pendingCondition={pendingCondition}
      completedCondition={completedCondition}
      actionRenderer={(ficha: Ficha) => (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => selecionarCostureiro(ficha.id || "", true, false)}
              className={`rounded-xl py-2 text-xs font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
                ficha.costureiroPaulo
                  ? "bg-pink-600 text-white shadow-md"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              PAULO
            </button>
            <button
              onClick={() => selecionarCostureiro(ficha.id || "", false, true)}
              className={`rounded-xl py-2 text-xs font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
                ficha.costureiroCelina
                  ? "bg-pink-600 text-white shadow-md"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              CELINA
            </button>
          </div>

          <button
            onClick={() => marcarCosturaConcluida(ficha.id || "")}
            className="w-full bg-pink-600 hover:bg-pink-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl py-3 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Check size={14} /> COSTURA CONCLUÍDA
          </button>
        </div>
      )}
    />
  );
}
