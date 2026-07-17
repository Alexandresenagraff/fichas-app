"use client";

import { useState } from "react";
import app from "../../firebase/config";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import SectorDashboard from "../components/SectorDashboard";
import { Ficha, formatarDataHora } from "../lib/helpers";

const db = getFirestore(app);

const entryCondition = (ficha: Ficha) => ficha.arteAprovada === true;
const pendingCondition = (ficha: Ficha) =>
  ficha.arteAprovada === true && ficha.exportacao === false;
const completedCondition = (ficha: Ficha) => ficha.exportacao === true;

export default function Exportacao() {
  const [links, setLinks] = useState<Record<string, string>>({});

  async function realizarExportacao(id: string, link: string) {
    if (!link.trim()) {
      alert("Por favor, cole o link do PDF do molde.");
      return;
    }

    try {
      await updateDoc(doc(db, "fichas", id), {
        exportacao: true,
        exportacaoData: formatarDataHora(),
        pdfLink: link.trim(),
      });
      alert("Molde exportado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao realizar exportação");
    }
  }

  return (
    <SectorDashboard
      title="EXPORTAÇÃO"
      description="Pedidos aguardando exportação de molde (PDF)"
      entryCondition={entryCondition}
      pendingCondition={pendingCondition}
      completedCondition={completedCondition}
      actionRenderer={(ficha: Ficha) => {
        if (ficha.exportacao) {
          return (
            <a
              href={ficha.pdfLink}
              target="_blank"
              className="block w-full bg-green-600 hover:bg-green-700 transition text-center rounded-xl p-3 text-sm font-bold text-white"
            >
              📄 VER PDF EXPORTADO
            </a>
          );
        }

        const currentLink = links[ficha.id || ""] || "";

        return (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Cole aqui o link do PDF"
              value={currentLink}
              onChange={(e) =>
                setLinks((prev) => ({ ...prev, [ficha.id || ""]: e.target.value }))
              }
              className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => realizarExportacao(ficha.id || "", currentLink)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition rounded-xl py-3 text-sm font-bold text-white"
            >
              EXPORTAR
            </button>
          </div>
        );
      }}
    />
  );
}
