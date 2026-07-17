"use client";

import { Check } from "lucide-react";
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
    console.error(error);
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
          className="w-full bg-orange-655 hover:bg-orange-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl py-3 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <Check size={14} /> CORTADO
        </button>
      )}
    />
  );
}
