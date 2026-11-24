"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from "lucide-react";
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
      <div className="mx-auto max-w-5xl px-3 pb-6 pt-4 sm:px-6 sm:pt-7">
        <header className="rounded-3xl bg-gradient-to-br from-blue-800 via-blue-700 to-sky-600 p-4 text-white shadow-lg shadow-blue-950/20 sm:p-6">
          <p className="text-xs font-bold tracking-[0.18em] text-blue-100">FICHAS · ADMINISTRAÇÃO</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight sm:mt-2 sm:text-2xl">Visão geral da produção</h1>
          <p className="mt-2 max-w-lg text-sm text-blue-100">Acompanhe o que precisa de atenção e acesse rapidamente cada área do sistema.</p>
        </header>

        <section className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 lg:grid-cols-4" aria-label="Resumo dos pedidos">
          {indicadores.map(({ label, value, Icon, className }) => (
            <div key={label} className={`rounded-2xl border p-3 shadow-sm sm:p-4 ${className}`}>
              <Icon size={18} />
              <p className="mt-1 text-xl font-bold sm:mt-4 sm:text-2xl">{carregando ? "–" : value}</p>
              <p className="mt-1 text-xs font-semibold">{label}</p>
            </div>
          ))}
        </section>

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:mt-6 sm:p-5" aria-label="Distribuição de artes pendentes por designer">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold">Distribuição de artes</h2>
              <p className="mt-1 text-sm text-slate-500">Pedidos atribuídos que ainda não possuem Arte Concluída.</p>
            </div>
            <ListTodo className="shrink-0 text-blue-600" size={22} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 lg:grid-cols-4">
            {DESIGNERS.map((designer) => (
              <div key={designer} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2 sm:px-4 sm:py-3">
                <p className="truncate text-xs font-bold tracking-wide text-slate-700">{designer}</p>
                <p className="mt-1 text-xs font-semibold text-slate-600 sm:mt-2 sm:text-sm">
                  Arte à CRIAR <span className="font-bold text-blue-700">— {carregando ? "–" : artesPendentesPorDesigner[designer].total}</span>
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-600 sm:text-sm">
                  URGENTES ⚠ <span className="font-bold text-orange-600">— {carregando ? "–" : artesPendentesPorDesigner[designer].urgentes}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <AdminNavigation />
    </main>
  );
}
