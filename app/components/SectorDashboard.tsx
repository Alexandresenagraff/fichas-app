"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCw, Search, X } from "lucide-react";

import app from "../../firebase/config";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { Ficha, categoriaDaFicha } from "../lib/helpers";
import { DashboardSkeleton, KpiSkeleton } from "./Skeleton";

const db = getFirestore(app);

interface SectorDashboardProps {
  title: string;
  description: string;
  entryCondition: (ficha: Ficha) => boolean;
  pendingCondition: (ficha: Ficha) => boolean;
  completedCondition: (ficha: Ficha) => boolean;
  actionRenderer: (ficha: Ficha) => React.ReactNode;
}

function SectorDashboardContent({
  title,
  description,
  entryCondition,
  pendingCondition,
  completedCondition,
  actionRenderer,
}: SectorDashboardProps) {
  const router = useRouter();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<string | null>(null);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "fichas"),
      (snapshot) => {
        const lista: Ficha[] = [];
        snapshot.forEach((item) => {
          const dados = item.data() as Ficha;
          if (dados.venda && entryCondition(dados)) {
            lista.push({ id: item.id, ...dados });
          }
        });
        setFichas(lista);
        setCarregando(false);
        setAtualizadoEm(new Date());
      },
      (error) => {
        console.error("Error onSnapshot sector:", error);
        setCarregando(false);
      }
    );
    return () => unsubscribe();
  }, [entryCondition]);

  const fichasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return fichas.filter((ficha) => {
      return !termo || (ficha.cliente || "").toLowerCase().includes(termo);
    });
  }, [fichas, busca]);

  const pendentes = useMemo(() => fichasFiltradas.filter((f) => pendingCondition(f)), [fichasFiltradas, pendingCondition]);
  const concluidas = useMemo(() => fichasFiltradas.filter((f) => completedCondition(f)), [fichasFiltradas, completedCondition]);

  const contagem = useMemo(() => {
    return {
      urgentes: pendentes.filter((f) => categoriaDaFicha(f) === "urgentes").length,
      atrasados: pendentes.filter((f) => categoriaDaFicha(f) === "atrasados").length,
      noPrazo: pendentes.filter((f) => categoriaDaFicha(f) === "noPrazo").length,
      finalizados: concluidas.length,
    };
  }, [pendentes, concluidas]);

  function toggleFiltro(id: string) {
    setFiltroAtivo((prev) => (prev === id ? null : id));
  }

  const listaExibida = useMemo(() => {
    if (filtroAtivo === "finalizados") return concluidas;
    if (filtroAtivo === "urgentes") return pendentes.filter((f) => categoriaDaFicha(f) === "urgentes");
    if (filtroAtivo === "atrasados") return pendentes.filter((f) => categoriaDaFicha(f) === "atrasados");
    if (filtroAtivo === "noPrazo") return pendentes.filter((f) => categoriaDaFicha(f) === "noPrazo");
    return pendentes;
  }, [filtroAtivo, pendentes, concluidas]);

  const cardStyle = (id: string) => {
    const isSelected = filtroAtivo === id;
    const base = "rounded-xl p-3 text-center cursor-pointer transition-all duration-200 border hover:scale-[1.02] active:scale-[0.98] ";
    if (id === "urgentes") {
      return base + (isSelected 
        ? "bg-red-500/10 border-red-500 ring-1 ring-red-500" 
        : "bg-zinc-900 border-zinc-800/80 hover:bg-zinc-800");
    }
    if (id === "atrasados") {
      return base + (isSelected 
        ? "bg-orange-500/10 border-orange-500 ring-1 ring-orange-500" 
        : "bg-zinc-900 border-zinc-800/80 hover:bg-zinc-800");
    }
    if (id === "noPrazo") {
      return base + (isSelected 
        ? "bg-blue-500/10 border-blue-500 ring-1 ring-blue-500" 
        : "bg-zinc-900 border-zinc-800/80 hover:bg-zinc-800");
    }
    if (id === "finalizados") {
      return base + (isSelected 
        ? "bg-green-500/10 border-green-500 ring-1 ring-green-500" 
        : "bg-zinc-900 border-zinc-800/80 hover:bg-zinc-800");
    }
    return base + "bg-zinc-900 border-zinc-800/80 hover:bg-zinc-800";
  };

  return (
    <main className="min-h-screen bg-black text-white p-3">
      <div className="max-w-md mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5 mt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/fichas")}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-95 transition-all duration-150 text-zinc-300 hover:text-white"
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-zinc-500 text-xs">{description}</p>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-95 transition-all duration-150 rounded-full w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white"
            title="Atualizar"
          >
            <RotateCw size={16} />
          </button>
        </div>

        {/* PESQUISA */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-3 mb-4 relative flex items-center gap-2">
          <Search size={16} className="text-zinc-500 ml-1" />
          <input
            type="text"
            placeholder="Pesquisar Cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-5 text-zinc-500 hover:text-white transition-colors"
              title="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* CONTADORES */}
        {carregando ? (
          <KpiSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => toggleFiltro("urgentes")}
              className={cardStyle("urgentes")}
            >
              <p className="text-2xl font-bold text-red-400">{contagem.urgentes}</p>
              <p className="text-[10px] font-semibold text-zinc-400 tracking-wider">URGENTES</p>
            </button>
            <button
              onClick={() => toggleFiltro("atrasados")}
              className={cardStyle("atrasados")}
            >
              <p className="text-2xl font-bold text-orange-400">{contagem.atrasados}</p>
              <p className="text-[10px] font-semibold text-zinc-400 tracking-wider">ATRASADOS</p>
            </button>
            <button
              onClick={() => toggleFiltro("noPrazo")}
              className={cardStyle("noPrazo")}
            >
              <p className="text-2xl font-bold text-blue-400">{contagem.noPrazo}</p>
              <p className="text-[10px] font-semibold text-zinc-400 tracking-wider">NO PRAZO</p>
            </button>
            <button
              onClick={() => toggleFiltro("finalizados")}
              className={cardStyle("finalizados")}
            >
              <p className="text-2xl font-bold text-green-400">{contagem.finalizados}</p>
              <p className="text-[10px] font-semibold text-zinc-400 tracking-wider">FINALIZADOS</p>
            </button>
          </div>
        )}

        <button
          onClick={() => setFiltroAtivo(null)}
          className={`w-full rounded-xl p-3 text-center cursor-pointer transition-all duration-200 border mb-5 hover:scale-[1.01] active:scale-[0.99] ${
            filtroAtivo === null
              ? "bg-zinc-800/80 border-zinc-700/60 ring-1 ring-zinc-700/60"
              : "bg-zinc-900 border-zinc-800/80 hover:bg-zinc-800"
          }`}
        >
          <p className="text-2xl font-bold text-white">
            {carregando ? "..." : fichasFiltradas.length}
          </p>
          <p className="text-[10px] font-semibold text-zinc-400 tracking-wider">TODOS</p>
        </button>

        {/* LISTA */}
        <div className="space-y-3">
          {carregando ? (
            <DashboardSkeleton />
          ) : listaExibida.length > 0 ? (
            listaExibida.map((ficha) => (
              <div
                key={ficha.id}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg transition-all duration-200 hover:border-zinc-800/80"
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <p className="text-lg font-bold uppercase break-words flex-1 leading-tight text-white">
                    {ficha.cliente}
                  </p>
                  {ficha.entrega && categoriaDaFicha(ficha) === "atrasados" && (
                    <span className="bg-red-650/90 text-white text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-md flex-shrink-0">
                      ATRASADO
                    </span>
                  )}
                  {ficha.entrega && categoriaDaFicha(ficha) === "urgentes" && (
                    <span className="bg-orange-655/90 text-white text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-md flex-shrink-0">
                      URGENTE
                    </span>
                  )}
                </div>

                {ficha.vendedor && (
                  <p className="text-xs text-zinc-400 mb-1">
                    Vendedor: <span className="text-white font-medium">{ficha.vendedor}</span>
                  </p>
                )}

                {ficha.designer && (
                  <p className="text-xs text-zinc-400 mb-1">
                    Designer: <span className="text-white font-medium">{ficha.designer}</span>
                  </p>
                )}

                {ficha.pedido && (
                  <p className="text-xs text-zinc-400 mb-1">
                    Data Pedido: <span className="text-white font-medium">{ficha.pedido.split("-").reverse().join("/")}</span>
                  </p>
                )}

                {ficha.entrega && (
                  <p className="text-xs text-zinc-400 mb-1.5">
                    Data Entrega: <span className="text-white font-medium">{ficha.entrega.split("-").reverse().join("/")}</span>
                  </p>
                )}

                {ficha.observacao && (
                  <div className="bg-zinc-900/60 rounded-xl p-2.5 mb-4 text-xs text-zinc-400 border border-zinc-800/40">
                    <span className="font-semibold text-zinc-500 block mb-0.5">Observação:</span>
                    <p className="break-words">{ficha.observacao}</p>
                  </div>
                )}

                <div className="mt-2 transition-all duration-200">
                  {actionRenderer(ficha)}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-400 text-xs">
              {busca
                ? "Nenhum cliente encontrado"
                : "Nenhum pedido aguardando ação deste setor"}
            </div>
          )}
        </div>

        {atualizadoEm && (
          <p className="text-center text-zinc-600 text-[10px] mt-6 tracking-wide">
            ATUALIZADO EM {atualizadoEm.toLocaleTimeString()}
          </p>
        )}
      </div>
    </main>
  );
}

export default function SectorDashboard(props: SectorDashboardProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white p-3">
          <div className="max-w-md mx-auto">
            <DashboardSkeleton />
          </div>
        </main>
      }
    >
      <SectorDashboardContent {...props} />
    </Suspense>
  );
}
