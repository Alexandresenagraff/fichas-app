"use client";

import app from "../../firebase/config";

import { getFirestore, doc, updateDoc } from "firebase/firestore";

import SectorDashboard from "../components/SectorDashboard";

import { Ficha, formatarDataHora } from "../lib/helpers";

const db = getFirestore(app);

const entryCondition = (ficha: Ficha) => ficha.costuraConcluida === true;
const pendingCondition = (ficha: Ficha) =>
  ficha.costuraConcluida === true && ficha.conferencia === false;
const completedCondition = (ficha: Ficha) => ficha.conferencia === true;

async function marcarConferido(id: string) {
  try {
    await updateDoc(doc(db, "fichas", id), {
      conferencia: true,
      conferenciaData: formatarDataHora(),
    });
  } catch (error) {
    console.log(error);
    alert("Erro ao atualizar");
  }
}

export default function Conferencia() {
  return (
    <SectorDashboard
      title="CONFERÊNCIA"
      description="Pedidos aguardando conferência e embalagem"
      entryCondition={entryCondition}
      pendingCondition={pendingCondition}
      completedCondition={completedCondition}
      actionRenderer={(ficha: Ficha) => (
        <button
          onClick={() => marcarConferido(ficha.id || "")}
          className="w-full bg-teal-600 hover:bg-teal-700 transition rounded-xl py-3 text-sm font-bold"
        >
          ✅ CONFERIDO E EMBALADO
        </button>
      )}
    />
  );
}
