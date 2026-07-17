"use client";

import { Truck, Store } from "lucide-react";
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
    console.error(error);
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
    console.error(error);
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
            className="w-full bg-indigo-600 hover:bg-indigo-755 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl py-3 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Truck size={14} /> ENVIO
          </button>
          <button
            onClick={() => marcarRetirada(ficha.id || "")}
            className="w-full bg-green-600 hover:bg-green-755 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl py-3 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Store size={14} /> RETIRADA
          </button>
        </div>
      )}
    />
  );
}
