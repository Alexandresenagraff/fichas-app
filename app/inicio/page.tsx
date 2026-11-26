"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, ListTodo, Plus } from "lucide-react";
import Link from "next/link";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import app from "../../firebase/config";
import AdminNavigation from "../components/AdminNavigation";
import { categoriaDaFicha, DESIGNERS, Ficha } from "../lib/helpers";

const db = getFirestore(app);

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
        (ficha) => normalizarDesigner(ficha.designer) === designerNormalizado && !ficha.arte
      );

      contagens[designer] = {
        total: artesPendentes.length,
        urgentes: artesPendentes.filter((ficha) => categoriaDaFicha(ficha) === "urgentes").length,
      };
      return contagens;
    }, {});
  }, [fichas]);

  const indicadores = [
    { label: "Em andamento", value: resumo.ativos, Icon: Clock3, className: "text-blue-700 bg-blue-50 border-blue-100" },
    { label: "Urgentes", value: resumo.urgentes, Icon: AlertTriangle, className: "text-amber-700 bg-amber-50 border-amber-100" },
    { label: "Atrasados", value: resumo.atrasados, Icon: AlertTriangle, className: "text-red-700 bg-red-50 border-red-100" },
    { label: "Finalizados", value: resumo.finalizados, Icon: CheckCircle2, className: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  ];

  return (
    <main className="min-h-screen bg-slate-800 pb-28 text-slate-900">
      <header className="bg-gradient-to-b from-blue-700 from-40% via-blue-800 via-65% to-slate-800 px-4 pb-14 pt-6 text-center text-white sm:pb-16 sm:pt-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">SENAGRAFF</h1>
        <p className="mt-2 text-[10px] font-bold tracking-[0.12em] text-blue-100 sm:text-xs">DISTRIBUIÇÃO E ACOMPANHAMENTO DE PEDIDOS</p>
      </header>
      <div className="mx-auto max-w-5xl px-3 pb-6 sm:px-6">

        <section className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 lg:grid-cols-4" aria-label="Resumo dos pedidos">
          {indicadores.map(({ label, value, Icon, className }) => (
            <div key={label} className={`rounded-2xl border p-3 shadow-sm sm:p-4 ${className}`}>
              <Icon size={18} />
              <p className="mt-1 text-xl font-bold sm:mt-4 sm:text-2xl">{carregando ? "–" : value}</p>
              <p className="mt-1 text-xs font-semibold">{label}</p>
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
              <div key={designer} className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 rounded-xl bg-slate-600 px-3 py-2 text-xs text-white sm:text-sm">
                <span className="font-bold">{designer}:</span>
                <span className="whitespace-nowrap">À CRIAR <strong className="text-base font-extrabold sm:text-lg">{carregando ? "–" : String(artesPendentesPorDesigner[designer].total).padStart(2, "0")}</strong></span>
                <span className="whitespace-nowrap text-slate-200">— (Urgentes {carregando ? "–" : String(artesPendentesPorDesigner[designer].urgentes).padStart(2, "0")})</span>
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
