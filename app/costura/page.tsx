"use client";

import { Suspense, useCallback } from "react";
import { Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import app from "../../firebase/config";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import SectorDashboard from "../components/SectorDashboard";
import { atribuicaoDoCostureiro, type Costureiro, Ficha, formatarDataHora } from "../lib/helpers";

const db = getFirestore(app);

async function selecionarCostureiro(
  id: string,
  costureiro: Costureiro
) {
  try {
    await updateDoc(doc(db, "fichas", id), atribuicaoDoCostureiro(costureiro));
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

function CosturaContent() {
  const searchParams = useSearchParams();
  const costureiroParam = searchParams.get("costureiro");
  const costureiro: Costureiro | undefined =
    costureiroParam === "celina" || costureiroParam === "paulo"
      ? costureiroParam
      : undefined;

  const pertenceAoCostureiro = useCallback(
    (ficha: Ficha) => {
      if (!costureiro) return true;
      return costureiro === "celina" ? ficha.costureiroCelina : ficha.costureiroPaulo;
    },
    [costureiro]
  );

  const entryCondition = useCallback(
    (ficha: Ficha) => ficha.corte === true && pertenceAoCostureiro(ficha),
    [pertenceAoCostureiro]
  );
  const pendingCondition = useCallback(
    (ficha: Ficha) =>
      ficha.corte === true && ficha.costuraConcluida === false && pertenceAoCostureiro(ficha),
    [pertenceAoCostureiro]
  );
  const completedCondition = useCallback(
    (ficha: Ficha) => ficha.costuraConcluida === true && pertenceAoCostureiro(ficha),
    [pertenceAoCostureiro]
  );

  const nomeCostureiro = costureiro === "celina" ? "CELINA" : costureiro === "paulo" ? "PAULO" : "";

  return (
    <SectorDashboard
      title={nomeCostureiro ? `COSTURA — ${nomeCostureiro}` : "COSTURA"}
      description={nomeCostureiro ? `Pedidos atribuídos a ${nomeCostureiro}` : "Pedidos aguardando costura"}
      entryCondition={entryCondition}
      pendingCondition={pendingCondition}
      completedCondition={completedCondition}
      actionRenderer={(ficha: Ficha) => (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => selecionarCostureiro(ficha.id || "", "paulo")}
              className={`rounded-xl py-2 text-xs font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
                ficha.costureiroPaulo
                  ? "bg-pink-600 text-white shadow-md"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              PAULO
            </button>
            <button
              onClick={() => selecionarCostureiro(ficha.id || "", "celina")}
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

export default function Costura() {
  return (
    <Suspense fallback={null}>
      <CosturaContent />
    </Suspense>
  );
}
