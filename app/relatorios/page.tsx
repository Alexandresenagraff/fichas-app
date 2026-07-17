"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Menu, ArrowLeft, BarChart3, TrendingUp, Calendar, AlertTriangle, Users, Palette } from "lucide-react";
import app from "../../firebase/config";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import {
  Ficha,
  etapaDaFicha,
  categoriaDaFicha,
  VENDEDORES,
  DESIGNERS,
  ETAPAS,
} from "../lib/helpers";
import Sidebar from "../components/Sidebar";
import { RelatoriosSkeleton } from "../components/Skeleton";

const db = getFirestore(app);

function RelatoriosContent() {
  const router = useRouter();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [buscaVendedor, setBuscaVendedor] = useState("");
  const [buscaDesigner, setBuscaDesigner] = useState("");
  const [buscaStatus, setBuscaStatus] = useState<string>("todos"); // todos, ativos, finalizados, atrasados, urgentes

  // Menu States
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    setCarregando(true);
    const unsubscribe = onSnapshot(
      collection(db, "fichas"),
      (snapshot) => {
        const lista: Ficha[] = [];
        snapshot.forEach((item) => {
          lista.push({ id: item.id, ...item.data() } as Ficha);
        });
        setFichas(lista);
        setCarregando(false);
      },
      (error) => {
        console.error("Erro ao carregar fichas:", error);
        setCarregando(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Filter Logic memoized for performance optimization
  const fichasFiltradas = useMemo(() => {
    return fichas.filter((ficha) => {
      // Vendedor Filter
      if (buscaVendedor && ficha.vendedor !== buscaVendedor) return false;
      // Designer Filter
      if (buscaDesigner && ficha.designer !== buscaDesigner) return false;
      // Status Filter
      if (buscaStatus === "ativos" && ficha.entregaStatus) return false;
      if (buscaStatus === "finalizados" && !ficha.entregaStatus) return false;
      if (buscaStatus === "atrasados" && categoriaDaFicha(ficha) !== "atrasados") return false;
      if (buscaStatus === "urgentes" && categoriaDaFicha(ficha) !== "urgentes") return false;
      
      return true;
    });
  }, [fichas, buscaVendedor, buscaDesigner, buscaStatus]);

  // Calculate Metrics memoized
  const metricas = useMemo(() => {
    const totalGeral = fichasFiltradas.length;
    const totalAtivas = fichasFiltradas.filter((f) => !f.entregaStatus).length;
    const totalFinalizadas = fichasFiltradas.filter((f) => f.entregaStatus).length;
    const totalAtrasadas = fichasFiltradas.filter((f) => !f.entregaStatus && categoriaDaFicha(f) === "atrasados").length;
    const totalUrgentes = fichasFiltradas.filter((f) => !f.entregaStatus && categoriaDaFicha(f) === "urgentes").length;

    // Distribution by stage
    const estagiosCount: Record<string, number> = {
      arteParaCriar: 0,
      aguardandoAprovacao: 0,
      alteracaoSolicitada: 0,
      exportacao: 0,
      impressao: 0,
      prensa: 0,
      corte: 0,
      costura: 0,
      conferencia: 0,
      entrega: 0,
    };

    fichasFiltradas.forEach((ficha) => {
      if (!ficha.entregaStatus) {
        const etapa = etapaDaFicha(ficha);
        if (etapa && etapa in estagiosCount) {
          estagiosCount[etapa]++;
        }
      }
    });

    // Distribution by Seller
    const vendedoresCount: Record<string, number> = {};
    VENDEDORES.forEach((v) => {
      vendedoresCount[v] = fichasFiltradas.filter((f) => f.vendedor === v).length;
    });

    // Distribution by Designer
    const designersCount: Record<string, number> = {};
    DESIGNERS.forEach((d) => {
      designersCount[d] = fichasFiltradas.filter((f) => f.designer === d).length;
    });

    return {
      totalGeral,
      totalAtivas,
      totalFinalizadas,
      totalAtrasadas,
      totalUrgentes,
      estagiosCount,
      vendedoresCount,
      designersCount,
    };
  }, [fichasFiltradas]);

  // Helper to map Stage IDs to Labels
  const getEtapaLabel = (id: string) => {
    const found = ETAPAS.find((e) => e.id === id);
    return found ? found.label : id.toUpperCase();
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 relative">
      {/* MENU HAMBÚRGUER */}
      <button
        onClick={() => setMenuAberto(!menuAberto)}
        className="fixed top-4 right-4 text-white p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-95 transition-all duration-200 rounded-xl z-40 cursor-pointer shadow-lg animate-pulse-once"
      >
        <Menu size={22} />
      </button>

      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />

      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8 mt-2">
          <button
            onClick={() => router.push("/fichas")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-95 transition-all duration-150 text-zinc-300 hover:text-white"
            title="Voltar para Fichas"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              Painel de Relatórios
            </h1>
            <p className="text-zinc-500 text-xs mt-1">Estatísticas e análise das fichas de produção em tempo real</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-xl">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Vendedor</label>
            <select
              value={buscaVendedor}
              onChange={(e) => setBuscaVendedor(e.target.value)}
              className="w-full bg-black border border-zinc-750 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">TODOS VENDEDORES</option>
              {VENDEDORES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Designer</label>
            <select
              value={buscaDesigner}
              onChange={(e) => setBuscaDesigner(e.target.value)}
              className="w-full bg-black border border-zinc-750 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">TODOS DESIGNERS</option>
              {DESIGNERS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Status / Prazo</label>
            <select
              value={buscaStatus}
              onChange={(e) => setBuscaStatus(e.target.value)}
              className="w-full bg-black border border-zinc-750 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="todos">TODAS AS FICHAS</option>
              <option value="ativos">APENAS EM PRODUÇÃO</option>
              <option value="finalizados">APENAS FINALIZADOS</option>
              <option value="atrasados">ATRASADOS</option>
              <option value="urgentes">URGENTES (PRAZO ≤ 12 DIAS)</option>
            </select>
          </div>
        </div>

        {/* LOADING INDICATOR / SKELETON */}
        {carregando ? (
          <RelatoriosSkeleton />
        ) : (
          <>
            {/* KPI CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 text-center shadow-md transition hover:border-zinc-800">
                <p className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-1 flex items-center justify-center gap-1">
                  <BarChart3 size={11} className="text-zinc-500" /> Geral
                </p>
                <p className="text-3xl font-extrabold text-white">{metricas.totalGeral}</p>
                <p className="text-[9px] text-zinc-500 mt-1 font-medium">Fichas Filtradas</p>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 text-center shadow-md transition hover:border-zinc-800">
                <p className="text-[10px] text-blue-400 font-bold tracking-wider uppercase mb-1 flex items-center justify-center gap-1">
                  <TrendingUp size={11} className="text-blue-400 animate-pulse" /> Ativas
                </p>
                <p className="text-3xl font-extrabold text-blue-400">{metricas.totalAtivas}</p>
                <p className="text-[9px] text-zinc-500 mt-1 font-medium">No Fluxo Geral</p>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 text-center shadow-md transition hover:border-zinc-800">
                <p className="text-[10px] text-green-400 font-bold tracking-wider uppercase mb-1 flex items-center justify-center gap-1">
                  <Calendar size={11} className="text-green-400" /> Prontas
                </p>
                <p className="text-3xl font-extrabold text-green-400">{metricas.totalFinalizadas}</p>
                <p className="text-[9px] text-zinc-500 mt-1 font-medium">Finalizadas</p>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 text-center shadow-md transition hover:border-zinc-800">
                <p className="text-[10px] text-red-400 font-bold tracking-wider uppercase mb-1 flex items-center justify-center gap-1">
                  <AlertTriangle size={11} className="text-red-400" /> Atrasadas
                </p>
                <p className="text-3xl font-extrabold text-red-400">{metricas.totalAtrasadas}</p>
                <p className="text-[9px] text-zinc-500 mt-1 font-medium">Vencidas</p>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 text-center shadow-md transition hover:border-zinc-800 col-span-2 md:col-span-1">
                <p className="text-[10px] text-orange-400 font-bold tracking-wider uppercase mb-1 flex items-center justify-center gap-1">
                  <AlertTriangle size={11} className="text-orange-400" /> Urgentes
                </p>
                <p className="text-3xl font-extrabold text-orange-400">{metricas.totalUrgentes}</p>
                <p className="text-[9px] text-zinc-500 mt-1 font-medium">Prazo Curto</p>
              </div>
            </div>

            {/* PIPELINE / STAGES DISTRIBUTION */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-5 uppercase tracking-wider border-b border-zinc-800 pb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-400" /> Distribuição no Fluxo de Produção (Fichas Ativas)
              </h2>
              <div className="space-y-4">
                {Object.entries(metricas.estagiosCount).map(([id, count]) => {
                  const percent = metricas.totalAtivas > 0 ? (count / metricas.totalAtivas) * 100 : 0;
                  return (
                    <div key={id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="w-full sm:w-1/3 flex items-center justify-between sm:justify-start">
                        <span className="text-xs font-semibold text-zinc-300">{getEtapaLabel(id)}</span>
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-zinc-400 min-w-8 text-right">
                          {count} <span className="text-[10px] text-zinc-500 font-normal">({Math.round(percent)}%)</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SELLER AND DESIGNER METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* BY SELLER */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
                  <Users size={15} className="text-blue-400" /> Fichas por Vendedor
                </h3>
                <div className="space-y-3.5">
                  {Object.entries(metricas.vendedoresCount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([vendedor, count]) => {
                      const percent = metricas.totalGeral > 0 ? (count / metricas.totalGeral) * 100 : 0;
                      if (count === 0) return null;
                      return (
                        <div key={vendedor} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-300">{vendedor}</span>
                            <span className="font-bold text-zinc-500">{count} pedidos <span className="font-normal text-[10px]">({Math.round(percent)}%)</span></span>
                          </div>
                          <div className="w-full bg-zinc-800/60 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  {metricas.totalGeral === 0 && <p className="text-xs text-zinc-500 text-center py-4">Nenhum dado disponível</p>}
                </div>
              </div>

              {/* BY DESIGNER */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
                  <Palette size={15} className="text-indigo-400" /> Fichas por Designer
                </h3>
                <div className="space-y-3.5">
                  {Object.entries(metricas.designersCount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([designer, count]) => {
                      const percent = metricas.totalGeral > 0 ? (count / metricas.totalGeral) * 100 : 0;
                      if (count === 0) return null;
                      return (
                        <div key={designer} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-300">{designer}</span>
                            <span className="font-bold text-zinc-500">{count} pedidos <span className="font-normal text-[10px]">({Math.round(percent)}%)</span></span>
                          </div>
                          <div className="w-full bg-zinc-800/60 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  {metricas.totalGeral === 0 && <p className="text-xs text-zinc-500 text-center py-4">Nenhum dado disponível</p>}
                </div>
              </div>
            </div>

            {/* DETAILED LIST OF FILTERED ORDERS */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-zinc-800 pb-3">
                Detalhamento dos Pedidos ({fichasFiltradas.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-2">Cliente</th>
                      <th className="py-3 px-2">Vendedor</th>
                      <th className="py-3 px-2">Designer</th>
                      <th className="py-3 px-2">Entrega</th>
                      <th className="py-3 px-2">Etapa Atual</th>
                      <th className="py-3 px-2 text-right">Prazo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {fichasFiltradas.map((ficha) => {
                      const etapa = ficha.entregaStatus ? "Finalizado" : getEtapaLabel(etapaDaFicha(ficha) || "");
                      const categoria = categoriaDaFicha(ficha);
                      const entregaFmt = ficha.entrega
                        ? ficha.entrega.split("-").reverse().join("/")
                        : "Não informada";

                      return (
                        <tr key={ficha.id} className="hover:bg-zinc-950/40 transition-colors duration-150">
                          <td className="py-3.5 px-2 font-extrabold text-white uppercase">{ficha.cliente}</td>
                          <td className="py-3.5 px-2 text-zinc-300 font-medium">{ficha.vendedor || "N/A"}</td>
                          <td className="py-3.5 px-2 text-zinc-300 font-medium">{ficha.designer || "N/A"}</td>
                          <td className="py-3.5 px-2 text-zinc-400">{entregaFmt}</td>
                          <td className="py-3.5 px-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wider border ${
                                ficha.entregaStatus
                                  ? "bg-green-950/30 text-green-400 border-green-900/50"
                                  : "bg-zinc-850 text-zinc-300 border-zinc-850"
                              }`}
                            >
                              {etapa}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            {categoria === "atrasados" && (
                              <span className="bg-red-950/30 text-red-400 border border-red-900/50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                ATRASADO
                              </span>
                            )}
                            {categoria === "urgentes" && (
                              <span className="bg-orange-950/30 text-orange-400 border border-orange-900/50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                URGENTE
                              </span>
                            )}
                            {categoria === "noPrazo" && (
                              <span className="bg-blue-950/30 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                NO PRAZO
                              </span>
                            )}
                            {categoria === "finalizados" && (
                              <span className="bg-green-950/30 text-green-400 border border-green-900/50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                FINALIZADO
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {fichasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 font-medium">
                          Nenhum pedido atende aos filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function Relatorios() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white p-4">
          <div className="max-w-4xl mx-auto text-center mt-12">
            <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></span>
            Carregando página...
          </div>
        </main>
      }
    >
      <RelatoriosContent />
    </Suspense>
  );
}
