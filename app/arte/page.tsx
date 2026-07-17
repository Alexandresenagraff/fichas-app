"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Search, X, Calendar, FileText, Check, Undo2 } from "lucide-react";
import NotificationBell from "../components/NotificationBell";

import app from "../../firebase/config";
import {
  getFirestore,
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

import {
  formatarDataHora,
  etapaDaFicha,
  type Ficha,
  type Etapa,
  type HistoricoAprovacao,
} from "../lib/helpers";
import { DashboardSkeleton } from "../components/Skeleton";

const db = getFirestore(app);

type SecaoArte = "arteParaCriar" | "alteracaoSolicitada" | "aguardandoAprovacao";

function ArteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designerAtivo = searchParams.get("designer") || "";
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoArte>("arteParaCriar");
  const [pdfLinks, setPdfLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    setCarregando(true);
    const unsubscribe = onSnapshot(
      collection(db, "fichas"),
      (snapshot) => {
        const lista: Ficha[] = [];
        snapshot.forEach((item) => {
          const dados = item.data() as Ficha;
          if (
            dados.venda &&
            !dados.entregaStatus &&
            dados.designer
          ) {
            lista.push({ id: item.id, ...dados });
          }
        });

        lista.sort((a, b) => {
          const dateA = a.pedido ? new Date(a.pedido).getTime() : 0;
          const dateB = b.pedido ? new Date(b.pedido).getTime() : 0;
          return dateB - dateA;
        });

        setFichas(lista);
        setCarregando(false);
      },
      (error) => {
        console.error("Erro onSnapshot arte:", error);
        setCarregando(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const fichaIdParam = searchParams.get("fichaId");

  useEffect(() => {
    if (fichaIdParam && fichas.length > 0) {
      const fichaAlvo = fichas.find((f) => f.id === fichaIdParam);
      if (fichaAlvo) {
        const etapa = etapaDaFicha(fichaAlvo);
        if (etapa) {
          if (etapa === "arteParaCriar" || etapa === "alteracaoSolicitada" || etapa === "aguardandoAprovacao" || etapa === "exportacao") {
            const secaoId = (etapa === "exportacao") ? "aguardandoAprovacao" : etapa;
            setSecaoAtiva(secaoId as SecaoArte);
          }
        }
      }

      setTimeout(() => {
        const elemento = document.getElementById(`ficha-${fichaIdParam}`);
        if (elemento) {
          elemento.scrollIntoView({ behavior: "smooth", block: "center" });
          elemento.classList.add("ring-2", "ring-blue-500", "scale-[1.01]");
          setTimeout(() => {
            elemento.classList.remove("ring-2", "ring-blue-500", "scale-[1.01]");
          }, 3000);
        }
      }, 300);
    }
  }, [fichaIdParam, fichas]);

  function estaAtrasado(ficha: Ficha): boolean {
    if (!ficha.entrega || ficha.arte) return false;
    const [ano, mes, dia] = ficha.entrega.split("-").map(Number);
    const hoje = new Date();
    const inicioDeHoje = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dataEntrega = Date.UTC(ano, mes - 1, dia);
    return dataEntrega < inicioDeHoje;
  }

  async function concluirArte(id: string) {
    try {
      const fichaRef = doc(db, "fichas", id);
      const arteData = formatarDataHora();
      await updateDoc(fichaRef, {
        arte: true,
        arteAprovada: true,
        exportacao: false,
        arteData,
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar");
    }
  }

  async function concluirAlteracao(ficha: Ficha) {
    if (!ficha.id) return;

    try {
      const fichaRef = doc(db, "fichas", ficha.id);
      const arteData = formatarDataHora();

      const novaMensagem: HistoricoAprovacao = {
        dataHora: arteData,
        autor: ficha.designer || "Designer",
        mensagem: "Alteração concluída.",
        tipo: "resposta",
      };

      const historico = ficha.historicoAprovacao || [];
      const alteracoesAtualizadas = (ficha.alteracoes || []).map((alt) =>
        alt.status === "pendente" ? { ...alt, status: "concluida" as const } : alt
      );

      await updateDoc(fichaRef, {
        arte: true,
        alteracaoSolicitada: false,
        arteData,
        historicoAprovacao: [...historico, novaMensagem],
        alteracoes: alteracoesAtualizadas,
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar");
    }
  }

  async function desfazerArte(id: string) {
    try {
      const fichaRef = doc(db, "fichas", id);
      await updateDoc(fichaRef, { arte: false, arteAprovada: false, exportacao: false, arteData: "" });
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar");
    }
  }

  async function confirmarExportacao(id: string, link: string) {
    if (!link.trim()) {
      alert("Por favor, cole o link do PDF.");
      return;
    }

    try {
      const fichaRef = doc(db, "fichas", id);
      const exportacaoData = formatarDataHora();
      await updateDoc(fichaRef, {
        exportacao: true,
        exportacaoData,
        pdfLink: link.trim(),
      });
      alert("Exportação confirmada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao confirmar exportação");
    }
  }

  // Memoized filters for UI performance optimization
  const fichasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return fichas.filter((ficha) => {
      const matchBusca = !termo || (ficha.cliente || "").toLowerCase().includes(termo);
      const matchDesigner = !designerAtivo || ficha.designer?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === designerAtivo;
      return matchBusca && matchDesigner;
    });
  }, [fichas, busca, designerAtivo]);

  const arteParaCriar = useMemo(() => fichasFiltradas.filter((f) => etapaDaFicha(f) === "arteParaCriar"), [fichasFiltradas]);
  const alteracaoSolicitada = useMemo(() => fichasFiltradas.filter((f) => etapaDaFicha(f) === "alteracaoSolicitada"), [fichasFiltradas]);
  const aguardandoAprovacao = useMemo(() => {
    return fichasFiltradas.filter(
      (f) => etapaDaFicha(f) === "aguardandoAprovacao" || etapaDaFicha(f) === "exportacao"
    );
  }, [fichasFiltradas]);

  const secoes = useMemo(() => {
    return [
      { id: "arteParaCriar" as const, label: "ARTE P/ CRIAR", lista: arteParaCriar, cor: "text-amber-400" },
      { id: "alteracaoSolicitada" as const, label: "ALTERAÇÃO SOLICITADA", lista: alteracaoSolicitada, cor: "text-red-400" },
      { id: "aguardandoAprovacao" as const, label: "EXPORTANDO", lista: aguardandoAprovacao, cor: "text-yellow-400" },
    ];
  }, [arteParaCriar, alteracaoSolicitada, aguardandoAprovacao]);

  function renderSecao(ficha: Ficha) {
    const etapa = etapaDaFicha(ficha);

    return (
      <div
        key={ficha.id}
        id={`ficha-${ficha.id}`}
        className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg transition-all duration-200 hover:border-zinc-800/80"
      >
        <div className="flex items-start justify-between mb-3 gap-2">
          <p className="text-lg font-bold uppercase break-words flex-1 leading-tight text-white">
            {ficha.cliente}
          </p>
          {estaAtrasado(ficha) && (
            <span className="bg-red-655 text-white text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-md flex-shrink-0">
              ATRASADO
            </span>
          )}
        </div>

        {ficha.designer && (
          <p className="text-xs text-zinc-400 mb-1">
            Designer: <span className="text-white font-medium">{ficha.designer}</span>
          </p>
        )}

        {ficha.vendedor && (
          <p className="text-xs text-zinc-400 mb-1">
            Vendedor: <span className="text-white font-medium">{ficha.vendedor}</span>
          </p>
        )}

        {ficha.pedido && (
          <p className="text-xs text-zinc-400 mb-1">
            Data Pedido: <span className="text-white font-medium">{ficha.pedido.split("-").reverse().join("/")}</span>
          </p>
        )}

        {ficha.entrega && (
          <p className="text-xs text-zinc-400 mb-2">
            Data Entrega: <span className="text-white font-medium">{ficha.entrega.split("-").reverse().join("/")}</span>
          </p>
        )}

        {ficha.observacao && (
          <div className="bg-zinc-900/60 rounded-xl p-2.5 mb-3 text-xs text-zinc-400 border border-zinc-800/40">
            <span className="font-semibold text-zinc-500 block mb-0.5">Observação:</span>
            <p className="break-words">{ficha.observacao}</p>
          </div>
        )}

        {ficha.alteracaoSolicitada && (
          <div className="bg-red-955/10 border border-red-900/45 rounded-xl p-3.5 mb-4 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-red-900/20">
              <span className="text-[10px] font-extrabold text-red-400 tracking-wider">
                ✏️ ALTERAÇÃO SOLICITADA
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">
                Ficha: <span className="text-zinc-300">#{ficha.id}</span>
              </span>
            </div>
            {(() => {
              const pendentes = ficha.alteracoes?.filter((alt) => alt.status === "pendente");
              if (pendentes && pendentes.length > 0) {
                return pendentes.map((alt) => (
                  <div key={alt.id} className="space-y-1 pt-1.5 first:pt-0">
                    <p className="text-zinc-400">
                      Quem solicitou: <span className="text-zinc-200 font-semibold">{alt.solicitante}</span>
                    </p>
                    <p className="text-zinc-400">
                      Data/Hora: <span className="text-zinc-200 font-semibold">{alt.dataHora}</span>
                    </p>
                    <p className="text-zinc-200 font-medium bg-black/45 p-2 rounded-lg border border-red-950/60 mt-1 italic">
                      "{alt.descricao}"
                    </p>
                  </div>
                ));
              } else {
                const lastAlt = ficha.historicoAprovacao?.filter((h) => h.tipo === "alteracao").pop();
                return (
                  <div className="space-y-1">
                    <p className="text-zinc-400">
                      Quem solicitou: <span className="text-zinc-200 font-semibold">{lastAlt?.autor || ficha.vendedor || "Vendedor"}</span>
                    </p>
                    <p className="text-zinc-400">
                      Data/Hora: <span className="text-zinc-200 font-semibold">{lastAlt?.dataHora || "—"}</span>
                    </p>
                    <p className="text-zinc-200 font-medium bg-black/45 p-2 rounded-lg border border-red-950/60 mt-1 italic">
                      "{lastAlt?.mensagem || "Alteração solicitada"}"
                    </p>
                  </div>
                );
              }
            })()}
          </div>
        )}

        {ficha.historicoAprovacao && ficha.historicoAprovacao.length > 0 && (
          <div className="bg-black/50 border border-zinc-900 rounded-xl p-3 mb-4 space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
            {ficha.historicoAprovacao.map((item, index) => (
              <div key={index} className="text-xs border-l-2 border-zinc-700 pl-2.5">
                <p className="text-[9px] text-zinc-500 mb-0.5">
                  {item.dataHora} — {item.autor}
                </p>
                <p className="text-zinc-300">{item.mensagem}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-4">
          {ficha.pdfLink ? (
            <a
              href={ficha.pdfLink}
              target="_blank"
              rel="noreferrer"
              className="block bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-center rounded-xl p-2.5 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1.5"
            >
              <FileText size={14} /> VER MOLDE (PDF)
            </a>
          ) : (
            <div className="text-[11px] text-zinc-500 text-center bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 font-medium">
              Molde ainda não disponível
            </div>
          )}
        </div>

        {etapa === "arteParaCriar" && (
          <button
            onClick={() => concluirArte(ficha.id || "")}
            className="w-full bg-lime-600 hover:bg-lime-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-white rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Check size={15} /> CONCLUIR ARTE
          </button>
        )}

        {etapa === "alteracaoSolicitada" && (
          <button
            onClick={() => concluirAlteracao(ficha)}
            className="w-full bg-red-600 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-white rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Check size={15} /> ALTERAÇÃO CONCLUÍDA
          </button>
        )}

        {(etapa === "aguardandoAprovacao" || etapa === "exportacao") && (
          <div className="space-y-3.5 pt-1">
            <button
              disabled
              className="w-full bg-yellow-600/10 border border-yellow-500/20 text-yellow-400 rounded-xl py-3 text-xs font-bold cursor-default flex items-center justify-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full inline-block animate-pulse"></span>
              EXPORTANDO MOLDE
            </button>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Cole aqui o link do PDF"
                value={pdfLinks[ficha.id || ""] || ""}
                onChange={(e) =>
                  setPdfLinks((prev) => ({ ...prev, [ficha.id || ""]: e.target.value }))
                }
                className="flex-1 bg-black border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-zinc-500"
              />
              <button
                onClick={() => confirmarExportacao(ficha.id || "", pdfLinks[ficha.id || ""] || "")}
                className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 text-white text-[10px] font-bold py-3 px-3.5 rounded-xl whitespace-nowrap transition-all cursor-pointer"
              >
                SALVAR PDF
              </button>
            </div>

            <button
              onClick={() => desfazerArte(ficha.id || "")}
              className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-zinc-300 active:scale-95 transition-all duration-200 rounded-xl py-2 text-[10px] font-semibold text-zinc-500 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Undo2 size={12} /> DESFAZER ARTE
            </button>
          </div>
        )}
      </div>
    );
  }

  const activeSectionList = useMemo(() => {
    const found = secoes.find((s) => s.id === secaoAtiva);
    return found ? found.lista : [];
  }, [secoes, secaoAtiva]);

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
              <h1 className="text-2xl font-bold tracking-tight">ARTE</h1>
              <p className="text-zinc-500 text-xs mt-0.5">
                {designerAtivo ? `Designer: ${designerAtivo}` : "Aprovação de arte"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => router.push("/fichas")}
              className="bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl px-4 py-2 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} /> Novo
            </button>
          </div>
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

        {/* ABAS */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {secoes.map((secao) => {
            const ativo = secaoAtiva === secao.id;
            return (
              <button
                key={secao.id}
                onClick={() => setSecaoAtiva(secao.id)}
                className={`rounded-xl py-2.5 text-[9px] font-bold border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center ${
                  ativo
                    ? "bg-zinc-800 border-zinc-700 text-white animate-pulse-once"
                    : "bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-300"
                }`}
              >
                <span className="block truncate">{secao.label}</span>
                <span className={`block text-xs mt-0.5 ${ativo ? "text-white" : secao.cor}`}>
                  ({secao.lista.length})
                </span>
              </button>
            );
          })}
        </div>

        {/* LISTA */}
        <div className="space-y-3">
          {carregando ? (
            <DashboardSkeleton />
          ) : activeSectionList.length > 0 ? (
            activeSectionList.map((ficha) => renderSecao(ficha))
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-400 text-xs">
              {busca
                ? "Nenhum cliente encontrado"
                : `Nenhum pedido em ${secoes.find((s) => s.id === secaoAtiva)?.label}`}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function Arte() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black text-white p-3"><DashboardSkeleton /></main>}>
      <ArteContent />
    </Suspense>
  );
}
