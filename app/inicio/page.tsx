"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import app from "../../firebase/config";
import AdminNavigation from "../components/AdminNavigation";
import { categoriaDaFicha, Ficha } from "../lib/helpers";

const db = getFirestore(app);

export default function Inicio() {
  const router = useRouter();
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

  const indicadores = [
    { label: "Em andamento", value: resumo.ativos, Icon: Clock3, className: "text-blue-700 bg-blue-50 border-blue-100" },
    { label: "Urgentes", value: resumo.urgentes, Icon: AlertTriangle, className: "text-amber-700 bg-amber-50 border-amber-100" },
    { label: "Atrasados", value: resumo.atrasados, Icon: AlertTriangle, className: "text-red-700 bg-red-50 border-red-100" },
    { label: "Finalizados", value: resumo.finalizados, Icon: CheckCircle2, className: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  ];

  return (
    <main className="min-h-screen bg-slate-800 pb-28 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 pb-6 pt-7 sm:px-6">
        <header className="rounded-3xl bg-gradient-to-br from-blue-800 via-blue-700 to-sky-600 p-6 text-white shadow-lg shadow-blue-950/20">
          <p className="text-xs font-bold tracking-[0.18em] text-blue-100">FICHAS · ADMINISTRAÇÃO</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Visão geral da produção</h1>
          <p className="mt-2 max-w-lg text-sm text-blue-100">Acompanhe o que precisa de atenção e acesse rapidamente cada área do sistema.</p>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumo dos pedidos">
          {indicadores.map(({ label, value, Icon, className }) => (
            <div key={label} className={`rounded-2xl border p-4 shadow-sm ${className}`}>
              <Icon size={18} />
              <p className="mt-4 text-2xl font-bold">{carregando ? "–" : value}</p>
              <p className="mt-1 text-xs font-semibold">{label}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold">Acessos rápidos</h2>
              <p className="mt-1 text-sm text-slate-500">Use os mesmos recursos que já fazem parte do fluxo.</p>
            </div>
            <ListTodo className="text-blue-600" size={22} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Ver pedidos", description: "Lista, busca e status", href: "/fichas" },
              { label: "Ver pendências", description: "Itens que exigem atenção", href: "/pendencias" },
              { label: "Ir para Comercial", description: "Pedidos e aprovação", href: "/comercial" },
            ].map((atalho) => (
              <button
                key={atalho.href}
                onClick={() => router.push(atalho.href)}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50 active:scale-[0.99]"
              >
                <span>
                  <span className="block text-sm font-bold text-slate-800">{atalho.label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{atalho.description}</span>
                </span>
                <ArrowRight size={17} className="text-blue-600" />
              </button>
            ))}
          </div>
        </section>
      </div>
      <AdminNavigation />
    </main>
  );
}
