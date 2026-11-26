"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, ListTodo, Plus } from "lucide-react";
import Link from "next/link";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import app from "../../firebase/config";
import AdminNavigation from "../components/AdminNavigation";
import CabecalhoSenagraff from "../components/CabecalhoSenagraff";
import { categoriaDaFicha, DESIGNERS, Ficha } from "../lib/helpers";

const db = getFirestore(app);
const coresDesigner: Record<string, string> = {
  ALEXANDRE: "bg-rose-200 text-rose-950",
  "LÁZARO": "bg-emerald-200 text-emerald-950",
  EDIVAN: "bg-sky-200 text-sky-950",
  "PAULÃO": "bg-slate-200 text-black",
};

function normalizarDesigner(nome?: string) {
  return (nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export default function Inicio() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "fichas"),
      (snapshot) => {
        setFichas(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Ficha));
        setCarregando(false);
      },
      (error) => {
        console.error("Erro ao carregar resumo administrativo:", error);
        setCarregando(false);
      }
    );

    return unsubscribe;
  }, []);

  const resumo = useMemo(() => ({
    ativos: fichas.filter((ficha) => !ficha.entregaStatus).length,
    urgentes: fichas.filter((ficha) => !ficha.entregaStatus && categoriaDaFicha(ficha) === "urgentes").length,
    atrasados: fichas.filter((ficha) => !ficha.entregaStatus && categoriaDaFicha(ficha) === "atrasados").length,
    finalizados: fichas.filter((ficha) => ficha.entregaStatus).length,
  }), [fichas]);

  const artesPendentesPorDesigner = useMemo(() => {
    return DESIGNERS.reduce<Record<string, { total: number; urgentes: number }>>((contagens, designer) => {
      const designerNormalizado = normalizarDesigner(designer);
      const artesPendentes = fichas.filter(
        (ficha) => normalizarDesigner(ficha.designer) === designerNormalizado && !ficha.exportacao && !ficha.entregaStatus
      );

      contagens[designer] = {
        total: artesPendentes.length,
        urgentes: artesPendentes.filter((ficha) => categoriaDaFicha(ficha) === "urgentes").length,
      };
      return contagens;
    }, {});
  }, [fichas]);

  const indicadores = [
    { label: "Em andamento", value: resumo.ativos, Icon: Clock3, className: "text-blue-300" },
    { label: "Urgentes", value: resumo.urgentes, Icon: AlertTriangle, className: "text-amber-300" },
    { label: "Atrasados", value: resumo.atrasados, Icon: AlertTriangle, className: "text-red-300" },
    { label: "Finalizados", value: resumo.finalizados, Icon: CheckCircle2, className: "text-emerald-300" },
  ];

  return (
    <main className="min-h-screen bg-slate-800 pb-28 text-slate-900">
      <CabecalhoSenagraff />
      <div className="relative mx-auto max-w-5xl px-3 pb-6 sm:px-6">

        <section className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 lg:grid-cols-4" aria-label="Resumo dos pedidos">
          {indicadores.map(({ label, value, Icon, className }) => (
            <div key={label} className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-600 bg-slate-700 px-3 py-2">
              <Icon size={16} className={`shrink-0 ${className}`} />
              <span className="min-w-0 text-xs font-semibold text-slate-100">{label}</span>
              <span className={`ml-auto text-base font-bold ${className}`}>{carregando ? "–" : value}</span>
            </div>
          ))}
        </section>

        <section className="mt-4 sm:mt-6" aria-label="Distribuição de artes pendentes por designer">
          <div className="relative flex items-center justify-center px-7">
            <h2 className="text-center text-base font-bold text-white">DISTRIBUIÇÃO DE PEDIDOS - DESIGNERS</h2>
            <ListTodo className="absolute right-0 shrink-0 text-blue-600" size={22} />
          </div>
          <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2">
            {DESIGNERS.map((designer) => (
              <div key={designer} className="grid min-w-0 grid-cols-[minmax(0,1.1fr)_auto_minmax(0,1fr)_auto_minmax(0,1.1fr)] items-center text-white">
                <span className={`flex min-h-10 min-w-0 items-center justify-center rounded-xl px-1 text-center text-[clamp(11px,3.4vw,16px)] font-extrabold leading-tight sm:text-base ${coresDesigner[designer] || "bg-slate-600 text-white"}`}><span className="max-w-full break-words">{designer}</span></span>
                <span aria-hidden="true" className={`h-2 w-2 ${coresDesigner[designer] || "bg-slate-600 text-white"}`} />
                <span className={`flex min-h-10 items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold sm:text-xs ${coresDesigner[designer] || "bg-slate-600 text-white"}`}>NA FILA <strong className="text-base font-extrabold sm:text-lg">{carregando ? "–" : String(artesPendentesPorDesigner[designer].total).padStart(2, "0")}</strong></span>
                <span aria-hidden="true" className={`h-2 w-2 ${coresDesigner[designer] || "bg-slate-600 text-white"}`} />
                <span className={`flex min-h-10 items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold sm:text-xs ${coresDesigner[designer] || "bg-slate-600 text-white"}`}>URGENTES <strong className="text-base font-extrabold sm:text-lg">{carregando ? "–" : String(artesPendentesPorDesigner[designer].urgentes).padStart(2, "0")}</strong></span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Link href="/comercial?novo=1" aria-label="Criar novo pedido" title="Novo pedido" className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg transition hover:scale-105 hover:bg-blue-800 active:scale-95">
        <Plus size={28} aria-hidden="true" />
      </Link>
      <AdminNavigation />
    </main>
  );
}
