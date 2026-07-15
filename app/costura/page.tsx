"use client";

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
    console.log(error);
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
    console.log(error);
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
              className={`rounded-xl py-2 text-xs font-bold transition ${
                ficha.costureiroPaulo
                  ? "bg-pink-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              PAULO
            </button>
            <button
              onClick={() => selecionarCostureiro(ficha.id || "", false, true)}
              className={`rounded-xl py-2 text-xs font-bold transition ${
                ficha.costureiroCelina
                  ? "bg-pink-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              CELINA
            </button>
          </div>

          <button
            onClick={() => marcarCosturaConcluida(ficha.id || "")}
            className="w-full bg-pink-600 hover:bg-pink-700 transition rounded-xl py-3 text-sm font-bold"
          >
            ✅ COSTURA CONCLUÍDA
          </button>
        </div>
      )}
    />
  );
}
