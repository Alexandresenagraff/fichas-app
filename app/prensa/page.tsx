"use client";

import app from "../../firebase/config";

import { getFirestore, doc, updateDoc } from "firebase/firestore";

import SectorDashboard from "../components/SectorDashboard";

import { Ficha, formatarDataHora } from "../lib/helpers";

const db = getFirestore(app);

const entryCondition = (ficha: Ficha) => ficha.impressao === true;
const pendingCondition = (ficha: Ficha) =>
  ficha.impressao === true && ficha.prensa === false;
const completedCondition = (ficha: Ficha) => ficha.prensa === true;

async function marcarPrensagemConcluida(id: string) {
  try {
    await updateDoc(doc(db, "fichas", id), {
      prensa: true,
      prensaData: formatarDataHora(),
    });
  } catch (error) {
    console.log(error);
    alert("Erro ao atualizar");
  }
}

export default function Prensa() {
  return (
    <SectorDashboard
      title="PRENSA"
      description="Pedidos aguardando prensagem"
      entryCondition={entryCondition}
      pendingCondition={pendingCondition}
      completedCondition={completedCondition}
      actionRenderer={(ficha: Ficha) => (
        <button
          onClick={() => marcarPrensagemConcluida(ficha.id || "")}
          className="w-full bg-amber-600 hover:bg-amber-700 transition rounded-xl py-3 text-sm font-bold"
        >
          ✅ PRENSAGEM CONCLUÍDA
        </button>
      )}
    />
  );
}
