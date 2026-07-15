"use client";

import app from "../../firebase/config";

import { getFirestore, doc, updateDoc } from "firebase/firestore";

import SectorDashboard from "../components/SectorDashboard";

import { Ficha, formatarDataHora } from "../lib/helpers";

const db = getFirestore(app);

const entryCondition = (ficha: Ficha) => ficha.prensa === true;
const pendingCondition = (ficha: Ficha) =>
  ficha.prensa === true && ficha.corte === false;
const completedCondition = (ficha: Ficha) => ficha.corte === true;

async function marcarCortado(id: string) {
  try {
    await updateDoc(doc(db, "fichas", id), {
      corte: true,
      corteData: formatarDataHora(),
    });
  } catch (error) {
    console.log(error);
    alert("Erro ao atualizar");
  }
}

export default function Corte() {
  return (
    <SectorDashboard
      title="CORTE"
      description="Pedidos aguardando corte"
      entryCondition={entryCondition}
      pendingCondition={pendingCondition}
      completedCondition={completedCondition}
      actionRenderer={(ficha: Ficha) => (
        <button
          onClick={() => marcarCortado(ficha.id || "")}
          className="w-full bg-orange-600 hover:bg-orange-700 transition rounded-xl py-3 text-sm font-bold"
        >
          ✅ CORTADO
        </button>
      )}
    />
  );
}
