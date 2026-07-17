"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import app from "../../firebase/config";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import {
  Ficha,
  etapaDaFicha,
  categoriaDaFicha,
  VENDEDORES,
  DESIGNERS,
  ETAPAS,
  Etapa,
} from "../lib/helpers";

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
  const [vendedoresAberto, setVendedoresAberto] = useState(false);
  const [designersAberto, setDesignersAberto] = useState(false);

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

  // Filter Logic
  const fichasFiltradas = fichas.filter((ficha) => {
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

  // Calculate Metrics
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

  // Helper to map Stage IDs to Labels
  const getEtapaLabel = (id: string) => {
    const found = ETAPAS.find((e) => e.id === id);
    return found ? found.label : id.toUpperCase();
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 relative" onClick={() => setMenuAberto(false)}>
      {/* MENU HAMBÚRGUER */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuAberto(!menuAberto);
        }}
        className="fixed top-4 right-4 text-white text-2xl z-50 bg-zinc-900 border border-zinc-800 p-2 rounded-xl hover:bg-zinc-800 transition"
      >
        ☰
      </button>

      {menuAberto && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-16 right-4 w-48 bg-zinc-900 border border-zinc-800 text-white p-3 z-50 rounded-xl shadow-2xl max-h-[85vh] overflow-y-auto"
        >
          <h2 className="font-bold mb-4 text-zinc-400 text-sm">SETORES</h2>
          <div className="space-y-3">
            <div className="relative">
              {vendedoresAberto && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-0 -left-44 w-40 bg-zinc-800 border border-zinc-700 text-white p-4 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
                >
                  <h3 className="font-bold text-xs mb-3 text-zinc-400">VENDEDORES</h3>
                  <div className="space-y-3 text-xs">
                    {VENDEDORES.map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          setMenuAberto(false);
                          setVendedoresAberto(false);
                          window.location.href = `/comercial?vendedor=${v}`;
                        }}
                        className="block w-full text-left border-b border-zinc-700 pb-2 text-zinc-300 hover:text-white"
                      >
                        ▸ {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => setVendedoresAberto(!vendedoresAberto)}
                className="w-full text-left py-2 border-b border-zinc-800 text-xs text-zinc-300 hover:text-white"
              >
                {vendedoresAberto ? "▾ COMERCIAL" : "▸ COMERCIAL"}
              </button>
            </div>

            <div>
              {designersAberto && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-0 -left-44 w-40 bg-zinc-800 border border-zinc-700 text-white p-4 rounded-xl shadow-xl z-50"
                >
                  <h3 className="font-bold text-xs mb-3 text-zinc-400">DESIGNERS</h3>
                  <div className="space-y-3 text-xs">
                    {DESIGNERS.map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          setMenuAberto(false);
                          setDesignersAberto(false);
                          window.location.href = `/arte?designer=${d}`;
                        }}
                        className="block w-full text-left border-b border-zinc-700 pb-2 text-zinc-300 hover:text-white"
                      >
                        ▸ {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => setDesignersAberto(!designersAberto)}
                className="w-full text-left py-2 border-b border-zinc-800 text-xs text-zinc-300 hover:text-white"
              >
                {designersAberto ? "▾ DESIGNERS" : "▸ DESIGNERS"}
              </button>
            </div>

            {["impressao", "prensa", "corte", "costura", "conferencia", "envio"].map((setor) => (
              <button
                key={setor}
                onClick={() => {
                  setMenuAberto(false);
                  window.location.href = `/${setor}`;
                }}
                className="w-full text-left py-2 border-b border-zinc-800 text-xs text-zinc-300 hover:text-white"
              >
                ▸ {setor.toUpperCase() === "IMPRESSAO" ? "IMPRESSÃO" : setor.toUpperCase() === "CONFERENCIA" ? "CONFERÊNCIA" : setor.toUpperCase()}
              </button>
            ))}

            <button
              onClick={() => {
                setMenuAberto(false);
                window.location.href = "/relatorios";
              }}
              className="w-full text-left py-2 border-b border-zinc-800 text-xs text-blue-400 font-bold"
            >
              ▸ RELATÓRIOS
            </button>

            <button
              onClick={() => {
                setMenuAberto(false);
                window.location.href = "/adm";
              }}
              className="w-full text-left py-2 text-xs text-zinc-300 hover:text-white"
            >
              ▸ ADMINISTRAÇÃO
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8 mt-2">
          <button
            onClick={() => router.push("/fichas")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition text-lg"
            title="Voltar para Fichas"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              Painel de Relatórios
            </h1>
            <p className="text-zinc-500 text-xs mt-1">Estatísticas e análise das fichas de produção em tempo real</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Vendedor</label>
            <select
              value={buscaVendedor}
              onChange={(e) => setBuscaVendedor(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-sm text-white focus:border-blue-500 focus:outline-none"
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
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Designer</label>
            <select
              value={buscaDesigner}
              onChange={(e) => setBuscaDesigner(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-sm text-white focus:border-blue-500 focus:outline-none"
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
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Status / Prazo</label>
            <select
              value={buscaStatus}
              onChange={(e) => setBuscaStatus(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="todos">TODAS AS FICHAS</option>
              <option value="ativos">APENAS EM PRODUÇÃO</option>
              <option value="finalizados">APENAS FINALIZADOS</option>
              <option value="atrasados">ATRASADOS</option>
              <option value="urgentes">URGENTES (PRAZO ≤ 12 DIAS)</option>
            </select>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {carregando ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
            <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></span>
            Carregando estatísticas...
          </div>
        ) : (
          <>
            {/* KPI CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-xs text-zinc-400 font-semibold mb-1 uppercase">Geral</p>
                <p className="text-3xl font-extrabold text-white">{totalGeral}</p>
                <p className="text-[10px] text-zinc-500 mt-1">Fichas Filtradas</p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-xs text-blue-400 font-semibold mb-1 uppercase">Em Produção</p>
                <p className="text-3xl font-extrabold text-blue-400">{totalAtivas}</p>
                <p className="text-[10px] text-zinc-500 mt-1">Ativas no Fluxo</p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-xs text-green-400 font-semibold mb-1 uppercase">Finalizadas</p>
                <p className="text-3xl font-extrabold text-green-400">{totalFinalizadas}</p>
                <p className="text-[10px] text-zinc-500 mt-1">Entregues / Prontas</p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-xs text-red-400 font-semibold mb-1 uppercase">Atrasadas</p>
                <p className="text-3xl font-extrabold text-red-400">{totalAtrasadas}</p>
                <p className="text-[10px] text-zinc-500 mt-1">Prazo Excedido</p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-center col-span-2 md:col-span-1">
                <p className="text-xs text-orange-400 font-semibold mb-1 uppercase">Urgentes</p>
                <p className="text-3xl font-extrabold text-orange-400">{totalUrgentes}</p>
                <p className="text-[10px] text-zinc-500 mt-1">Vencimento Rápido</p>
              </div>
            </div>

            {/* PIPELINE / STAGES DISTRIBUTION */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-bold text-white mb-5 uppercase tracking-wide border-b border-zinc-800 pb-3">
                Distribuição no Fluxo de Produção (Fichas Ativas)
              </h2>
              <div className="space-y-4">
                {Object.entries(estagiosCount).map(([id, count]) => {
                  const percent = totalAtivas > 0 ? (count / totalAtivas) * 100 : 0;
                  return (
                    <div key={id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="w-full sm:w-1/3 flex items-center justify-between sm:justify-start gap-2">
                        <span className="text-xs font-semibold text-zinc-300">{getEtapaLabel(id)}</span>
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-zinc-400 min-w-8 text-right">
                          {count} ({Math.round(percent)}%)
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
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4 uppercase tracking-wide border-b border-zinc-800 pb-2">
                  Fichas por Vendedor
                </h3>
                <div className="space-y-3">
                  {Object.entries(vendedoresCount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([vendedor, count]) => {
                      const percent = totalGeral > 0 ? (count / totalGeral) * 100 : 0;
                      if (count === 0) return null;
                      return (
                        <div key={vendedor} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-300">{vendedor}</span>
                            <span className="font-bold text-zinc-400">{count} pedidos</span>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  {totalGeral === 0 && <p className="text-xs text-zinc-500 text-center">Nenhum dado disponível</p>}
                </div>
              </div>

              {/* BY DESIGNER */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4 uppercase tracking-wide border-b border-zinc-800 pb-2">
                  Fichas por Designer
                </h3>
                <div className="space-y-3">
                  {Object.entries(designersCount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([designer, count]) => {
                      const percent = totalGeral > 0 ? (count / totalGeral) * 100 : 0;
                      if (count === 0) return null;
                      return (
                        <div key={designer} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-300">{designer}</span>
                            <span className="font-bold text-zinc-400">{count} pedidos</span>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  {totalGeral === 0 && <p className="text-xs text-zinc-500 text-center">Nenhum dado disponível</p>}
                </div>
              </div>
            </div>

            {/* DETAILED LIST OF FILTERED ORDERS */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wide border-b border-zinc-800 pb-3">
                Detalhamento dos Pedidos ({fichasFiltradas.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="py-3 px-2">Cliente</th>
                      <th className="py-3 px-2">Vendedor</th>
                      <th className="py-3 px-2">Designer</th>
                      <th className="py-3 px-2">Entrega</th>
                      <th className="py-3 px-2">Etapa Atual</th>
                      <th className="py-3 px-2 text-right">Prazo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {fichasFiltradas.map((ficha) => {
                      const etapa = ficha.entregaStatus ? "Finalizado" : getEtapaLabel(etapaDaFicha(ficha) || "");
                      const categoria = categoriaDaFicha(ficha);
                      const entregaFmt = ficha.entrega
                        ? ficha.entrega.split("-").reverse().join("/")
                        : "Não informada";

                      return (
                        <tr key={ficha.id} className="hover:bg-zinc-950/40 transition">
                          <td className="py-3 px-2 font-bold text-white uppercase">{ficha.cliente}</td>
                          <td className="py-3 px-2 text-zinc-300">{ficha.vendedor || "N/A"}</td>
                          <td className="py-3 px-2 text-zinc-300">{ficha.designer || "N/A"}</td>
                          <td className="py-3 px-2 text-zinc-400">{entregaFmt}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ficha.entregaStatus
                                  ? "bg-green-950 text-green-400 border border-green-800"
                                  : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                              }`}
                            >
                              {etapa}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            {categoria === "atrasados" && (
                              <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-md font-bold">
                                ATRASADO
                              </span>
                            )}
                            {categoria === "urgentes" && (
                              <span className="bg-orange-950 text-orange-400 border border-orange-800 px-2 py-0.5 rounded-md font-bold">
                                URGENTE
                              </span>
                            )}
                            {categoria === "noPrazo" && (
                              <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-md font-bold">
                                NO PRAZO
                              </span>
                            )}
                            {categoria === "finalizados" && (
                              <span className="bg-green-950 text-green-400 border border-green-800 px-2 py-0.5 rounded-md font-bold">
                                FINALIZADO
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {fichasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500">
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
