"use client";

import app from "../../firebase/config";

import { getFirestore, doc, updateDoc } from "firebase/firestore";

import SectorDashboard from "../components/SectorDashboard";

import { Ficha, formatarDataHora } from "../lib/helpers";

const db = getFirestore(app);

const entryCondition = (ficha: Ficha) => ficha.conferencia === true;
const pendingCondition = (ficha: Ficha) =>
  ficha.conferencia === true && ficha.entregaStatus === false;
const completedCondition = (ficha: Ficha) => ficha.entregaStatus === true;

async function marcarEnvio(id: string) {
  try {
    await updateDoc(doc(db, "fichas", id), {
      entregaStatus: true,
      envio: true,
      retirada: false,
      entregaData: formatarDataHora(),
    });
  } catch (error) {
    console.log(error);
    alert("Erro ao atualizar");
  }
}

async function marcarRetirada(id: string) {
  try {
    await updateDoc(doc(db, "fichas", id), {
      entregaStatus: true,
      envio: false,
      retirada: true,
      entregaData: formatarDataHora(),
    });
  } catch (error) {
    console.log(error);
    alert("Erro ao atualizar");
  }
}

export default function Envio() {
  return (
    <SectorDashboard
      title="ENVIO"
      description="Pedidos prontos para entrega"
      entryCondition={entryCondition}
      pendingCondition={pendingCondition}
      completedCondition={completedCondition}
      actionRenderer={(ficha: Ficha) => (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => marcarEnvio(ficha.id || "")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition rounded-xl py-3 text-sm font-bold"
          >
            🚚 ENVIO
          </button>
          <button
            onClick={() => marcarRetirada(ficha.id || "")}
            className="w-full bg-green-600 hover:bg-green-700 transition rounded-xl py-3 text-sm font-bold"
          >
            🏪 RETIRADA
          </button>
        </div>
      )}
    />
  );
}
