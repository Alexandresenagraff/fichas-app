"use client";

import { Check } from "lucide-react";
import app from "../../firebase/config";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import SectorDashboard from "../components/SectorDashboard";
import { Ficha, formatarDataHora } from "../lib/helpers";

const db = getFirestore(app);

const entryCondition = (ficha: Ficha) => ficha.exportacao === true;
const pendingCondition = (ficha: Ficha) =>
  ficha.exportacao === true && ficha.impressao === false;
const completedCondition = (ficha: Ficha) => ficha.impressao === true;

async function marcarImpresso(id: string) {
  try {
    await updateDoc(doc(db, "fichas", id), {
      impressao: true,
      impressaoData: formatarDataHora(),
    });
  } catch (error) {
    console.error(error);
    alert("Erro ao atualizar");
  }
}

export default function Impressao() {
  return (
    <SectorDashboard
      title="IMPRESSÃO"
      description="Pedidos aguardando impressão"
      entryCondition={entryCondition}
      pendingCondition={pendingCondition}
      completedCondition={completedCondition}
      actionRenderer={(ficha: Ficha) => (
        <button
          onClick={() => marcarImpresso(ficha.id || "")}
          className="w-full bg-cyan-600 hover:bg-cyan-750 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl py-3 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <Check size={14} /> IMPRESSO
        </button>
      )}
    />
  );
}
