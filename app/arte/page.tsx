"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Search, X, FileText, Check, Undo2, Eye, EyeOff } from "lucide-react";
import NotificationBell from "../components/NotificationBell";
import ClientPdfLink from "../components/ClientPdfLink";
import AdminNavigation from "../components/AdminNavigation";
import CabecalhoSenagraff from "../components/CabecalhoSenagraff";

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
  type HistoricoAprovacao,
} from "../lib/helpers";
import { DashboardSkeleton } from "../components/Skeleton";

const db = getFirestore(app);

type SecaoArte = "arteParaCriar" | "alteracaoSolicitada" | "aguardandoAprovacao";
type SituacaoPainelDesigner = "aCriar" | "emAprovacao" | "aprovados" | "emProducao";

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function situacaoDoPainelDesigner(ficha: Ficha): SituacaoPainelDesigner | null {
  if (ficha.pdfLink) return "emProducao";
  if (ficha.arteAprovada) return "aprovados";
  if (etapaDaFicha(ficha) === "aguardandoAprovacao") return "emAprovacao";
  if (etapaDaFicha(ficha) === "arteParaCriar") return "aCriar";
  return null;
}

function normalizarTexto(texto?: string) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function dataDoPedido(ficha: Ficha) {
  const correspondencia = ficha.pedido?.match(/^(\d{4})-(\d{2})-/);
  if (!correspondencia) return null;

  return {
    ano: Number(correspondencia[1]),
    mes: Number(correspondencia[2]),
  };
}

function pertenceAoPeriodo(ficha: Ficha, anoSelecionado: string, mesSelecionado: string) {
  if (anoSelecionado === "todos") return true;

  const data = dataDoPedido(ficha);
  if (!data || data.ano !== Number(anoSelecionado)) return false;

  return mesSelecionado === "todos" || data.mes === Number(mesSelecionado);
}

function ArteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designerAtivo = searchParams.get("designer") || "";
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [fichasFinanceiras, setFichasFinanceiras] = useState<Ficha[]>([]);
  const [financeiroAberto, setFinanceiroAberto] = useState(false);
  const [mesFinanceiro, setMesFinanceiro] = useState(() => { const hoje = new Date(); return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`; });
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoArte>("arteParaCriar");
  const [situacaoPainelAtiva, setSituacaoPainelAtiva] = useState<SituacaoPainelDesigner | null>(null);
  const [contadorAberto, setContadorAberto] = useState(false);
  const [anoSelecionado, setAnoSelecionado] = useState("todos");
  const [mesSelecionado, setMesSelecionado] = useState("todos");
  const [pdfLinks, setPdfLinks] = useState<Record<string, string>>({});
  const [pedidosAbertos, setPedidosAbertos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "fichas"),
      (snapshot) => {
        const lista: Ficha[] = [];
        const listaFinanceira: Ficha[] = [];
        snapshot.forEach((item) => {
          const dados = item.data() as Ficha;
          if (dados.venda && dados.designer) listaFinanceira.push({ id: item.id, ...dados });
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
        setFichasFinanceiras(listaFinanceira);
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
            // Mantém a seção alinhada à ficha aberta pelo link de notificação.
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
        arteAprovada: false,
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
      const designerNome = ficha.designer || "Designer";

      const novaMensagem: HistoricoAprovacao = {
        dataHora: arteData,
        autor: designerNome,
        mensagem: "Alteração concluída.",
        tipo: "resposta",
      };

      const historico = ficha.historicoAprovacao || [];
      const alteracoesAtualizadas = (ficha.alteracoes || []).map((alt) =>
        alt.status === "pendente"
          ? {
              ...alt,
              status: "concluida" as const,
              concluidoPor: designerNome,
              concluidoEm: arteData,
            }
          : alt
      );

      await updateDoc(fichaRef, {
        arte: true,
        alteracaoSolicitada: false,
        arteAprovada: false,
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
    const termo = normalizarTexto(busca.trim());
    return fichas.filter((ficha) => {
      const camposDeBusca = [
        ficha.cliente,
        ficha.empresa,
        ficha.pedido,
        ficha.id,
      ];
      const matchBusca =
        !termo || camposDeBusca.some((campo) => normalizarTexto(campo).includes(termo));
      const matchDesigner = !designerAtivo || ficha.designer?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === designerAtivo;
      const matchPeriodo = pertenceAoPeriodo(ficha, anoSelecionado, mesSelecionado);
      return matchBusca && matchDesigner && matchPeriodo;
    });
  }, [fichas, busca, designerAtivo, anoSelecionado, mesSelecionado]);

  const fichasDoDesigner = useMemo(() => {
    if (!designerAtivo) return [];

    return fichas.filter(
      (ficha) =>
        ficha.designer?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === designerAtivo
    );
  }, [fichas, designerAtivo]);

  const pedidosFinanceiros = fichasFinanceiras.filter((ficha) => {
    if (!designerAtivo || normalizarTexto(ficha.designer) !== normalizarTexto(designerAtivo) || ficha.valorTotalCentavos == null) return false;
    const partes = ficha.vendaData?.split(" ")[0]?.split("/");
    const dataLancamento = partes?.length === 3 ? `${partes[2]}-${partes[1]}-${partes[0]}` : "";
    return (ficha.pedido || dataLancamento).startsWith(`${mesFinanceiro}-`);
  });
  const totalFinanceiro = pedidosFinanceiros.reduce((soma, ficha) => soma + (ficha.valorTotalCentavos || 0), 0);

  const anosDisponiveis = useMemo(() => {
    return [...new Set(
      fichasDoDesigner
        .map((ficha) => dataDoPedido(ficha)?.ano)
        .filter((ano): ano is number => Boolean(ano))
    )].sort((a, b) => b - a);
  }, [fichasDoDesigner]);

  const fichasDoDesignerNoPeriodo = useMemo(() => {
    return fichasDoDesigner.filter((ficha) =>
      pertenceAoPeriodo(ficha, anoSelecionado, mesSelecionado)
    );
  }, [fichasDoDesigner, anoSelecionado, mesSelecionado]);

  const painelGeral = useMemo(() => {
    const situacoes: Array<{ id: SituacaoPainelDesigner; label: string; cor: string }> = [
      { id: "aCriar", label: "À CRIAR", cor: "text-amber-400" },
      { id: "emAprovacao", label: "EM APROVAÇÃO", cor: "text-yellow-400" },
      { id: "aprovados", label: "APROVADOS", cor: "text-lime-400" },
      { id: "emProducao", label: "EM PRODUÇÃO", cor: "text-indigo-400" },
    ];

    return situacoes.map((situacao) => ({
      ...situacao,
      quantidade: fichasDoDesignerNoPeriodo.filter((ficha) => situacaoDoPainelDesigner(ficha) === situacao.id).length,
    }));
  }, [fichasDoDesignerNoPeriodo]);

  const arteParaCriar = useMemo(() => fichasFiltradas.filter((f) => etapaDaFicha(f) === "arteParaCriar"), [fichasFiltradas]);
  const alteracaoSolicitada = useMemo(() => fichasFiltradas.filter((f) => etapaDaFicha(f) === "alteracaoSolicitada"), [fichasFiltradas]);
  const aguardandoAprovacao = useMemo(() => {
    return fichasFiltradas.filter(
      (f) =>
        etapaDaFicha(f) === "aguardandoAprovacao" ||
        etapaDaFicha(f) === "exportacao" ||
        etapaDaFicha(f) === "impressao"
    );
  }, [fichasFiltradas]);

  const secoes = useMemo(() => {
    return [
      { id: "arteParaCriar" as const, label: "À CRIAR", lista: arteParaCriar, cor: "text-amber-400" },
      { id: "alteracaoSolicitada" as const, label: "ALTERAÇÃO SOLICITADA", lista: alteracaoSolicitada, cor: "text-red-400" },
      { id: "aguardandoAprovacao" as const, label: "EXPORTANDO", lista: aguardandoAprovacao, cor: "text-yellow-400" },
    ];
  }, [arteParaCriar, alteracaoSolicitada, aguardandoAprovacao]);

  function renderSecao(ficha: Ficha) {
    const etapa = etapaDaFicha(ficha);
    const aberto = pedidosAbertos[ficha.id || ""] ?? (ficha.id === fichaIdParam);

    return (
      <div
        key={ficha.id}
        id={`ficha-${ficha.id}`}
        className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3 sm:p-4 shadow-lg transition-all duration-200 hover:border-zinc-800/80"
      >
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex-1 min-w-0">
            <ClientPdfLink
              pdfLink={ficha.pdfLink}
              className="text-lg font-bold uppercase break-words leading-tight text-white"
            >
              {ficha.cliente}
            </ClientPdfLink>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {etapaDaFicha(ficha) === "aguardandoAprovacao" && (
                <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
                  AGUARDANDO APROVAÇÃO
                </span>
              )}
              {etapaDaFicha(ficha) === "alteracaoSolicitada" && (
                <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
                  ALTERAÇÃO SOLICITADA
                </span>
              )}
            </div>
          </div>
          {estaAtrasado(ficha) && (
            <span className="bg-red-655 text-white text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-md flex-shrink-0">
              ATRASADO
            </span>
          )}
        </div>

        {(ficha.pedido || ficha.entrega) && (
          <p className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
            {ficha.pedido && <span>Pedido: <span className="text-white font-medium">{ficha.pedido.split("-").reverse().join("/")}</span></span>}
            {ficha.pedido && ficha.entrega && <span aria-hidden="true">—</span>}
            {ficha.entrega && <span>Entrega: <span className="text-white font-medium">{ficha.entrega.split("-").reverse().join("/")}</span></span>}
          </p>
        )}
        <button type="button" aria-expanded={aberto} onClick={() => setPedidosAbertos((atual) => ({ ...atual, [ficha.id || ""]: !aberto }))} className="mb-2 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-bold text-zinc-200 hover:bg-zinc-800">
          {aberto ? <EyeOff size={14} /> : <Eye size={14} />} {aberto ? "RECOLHER" : "VISUALIZAR"}
        </button>

        {aberto && <>
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
                      &quot;{alt.descricao}&quot;
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
                      &quot;{lastAlt?.mensagem || "Alteração solicitada"}&quot;
                    </p>
                  </div>
                );
              }
            })()}
          </div>
        )}

        {ficha.historicoAprovacao && ficha.historicoAprovacao.length > 0 && (
          <div className="bg-black/50 border border-zinc-900 rounded-xl p-2 mb-2 space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
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

        <div className="mb-2">
          {ficha.pdfLink ? (
            <a
              href={ficha.pdfLink}
              target="_blank"
              rel="noreferrer"
              className="block bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-center rounded-xl p-2.5 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1.5"
            >
              <FileText size={14} /> VISUALIZAR FICHA
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
            📤 Enviar para Aprovação
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
          <div className="space-y-2 pt-1">
            {etapa === "aguardandoAprovacao" ? (
              <div className="text-xs text-yellow-400 bg-yellow-950/20 border border-yellow-900/50 rounded-xl p-3 text-center font-bold flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                AGUARDANDO APROVAÇÃO DO COMERCIAL
              </div>
            ) : (
              <>
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
              </>
            )}

            <button
              onClick={() => desfazerArte(ficha.id || "")}
              className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-zinc-300 active:scale-95 transition-all duration-200 rounded-xl py-2 text-[10px] font-semibold text-zinc-500 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Undo2 size={12} /> DESFAZER ARTE
            </button>
          </div>
        )}
        </>}
      </div>
    );
  }

  const activeSectionList = useMemo(() => {
    const found = secoes.find((s) => s.id === secaoAtiva);
    return found ? found.lista : [];
  }, [secoes, secaoAtiva]);

  const listaExibida = useMemo(() => {
    if (!situacaoPainelAtiva) return activeSectionList;
    return fichasFiltradas.filter(
      (ficha) => situacaoDoPainelDesigner(ficha) === situacaoPainelAtiva
    );
  }, [activeSectionList, fichasFiltradas, situacaoPainelAtiva]);

  return (
    <main className="min-h-screen bg-slate-800 p-3 pb-28 text-white">
      <div className="mx-auto mb-4 max-w-5xl"><CabecalhoSenagraff subtitulo="DESIGNER" compacto /></div>
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
              <p className="text-slate-300 text-xs mt-0.5">
                {designerAtivo ? `Designer: ${designerAtivo}` : "Aprovação de arte"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="order-2 sm:order-none">
              <NotificationBell />
            </div>
            <button
              onClick={() => router.push("/fichas")}
              className="order-1 sm:order-none bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl px-4 py-2 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
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

        {designerAtivo && <section className="mb-3">
          <button type="button" onClick={() => setFinanceiroAberto((aberto) => !aberto)} aria-expanded={financeiroAberto} aria-controls="financeiro-designer" className="flex min-h-11 w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-left text-xs font-bold text-zinc-200">
            <span>CONTADOR FINANCEIRO</span>{financeiroAberto ? <EyeOff size={17} aria-label="Recolher contador financeiro" /> : <Eye size={17} aria-label="Visualizar contador financeiro" />}
          </button>
          <div id="financeiro-designer" hidden={!financeiroAberto} className="mt-2 space-y-2 rounded-xl bg-zinc-900 p-3 text-xs text-zinc-200">
            <label className="block">Mês dos pedidos<input type="month" value={mesFinanceiro} onChange={(event) => setMesFinanceiro(event.target.value)} className="mt-1 block w-full max-w-60 rounded-lg bg-black p-2 text-white" /></label>
            <p>Pedidos com valor: <strong>{pedidosFinanceiros.length}</strong></p>
            <p>Valor total dos pedidos: <strong className="text-base text-white">{(totalFinanceiro / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></p>
            <p className="text-zinc-400">Pela data do pedido; sem data, pela data de lançamento.</p>
          </div>
        </section>}

        {designerAtivo && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <select
              value={anoSelecionado}
              onChange={(event) => {
                setAnoSelecionado(event.target.value);
                setMesSelecionado("todos");
              }}
              className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-300 outline-none focus:border-zinc-600"
              aria-label="Filtrar por ano"
            >
              <option value="todos">Todos os anos</option>
              {anosDisponiveis.map((ano) => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
            <select
              value={mesSelecionado}
              onChange={(event) => setMesSelecionado(event.target.value)}
              disabled={anoSelecionado === "todos"}
              className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-300 outline-none focus:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Filtrar por mês"
            >
              <option value="todos">Todos os meses</option>
              {meses.map((mes, index) => (
                <option key={mes} value={index + 1}>{mes}</option>
              ))}
            </select>
          </div>
        )}

        {designerAtivo && (
          <section className="mb-3">
            <button type="button" onClick={() => setContadorAberto((aberto) => !aberto)} aria-expanded={contadorAberto} aria-controls="contador-geral-designer" className="flex min-h-11 w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-left text-xs font-bold text-zinc-200">
              <span>CONTADOR GERAL</span>
              {contadorAberto ? <EyeOff size={17} aria-label="Recolher contador" /> : <Eye size={17} aria-label="Visualizar contador" />}
            </button>
            {!contadorAberto && <p className="mt-1 px-1 text-[10px] text-slate-300">Etapa selecionada: {situacaoPainelAtiva ? painelGeral.find((situacao) => situacao.id === situacaoPainelAtiva)?.label : secoes.find((secao) => secao.id === secaoAtiva)?.label}</p>}
            <div id="contador-geral-designer" hidden={!contadorAberto} className="mt-2 rounded-xl border border-zinc-900 bg-zinc-950 p-2">
            <div className="grid grid-cols-2 gap-1">
              {painelGeral.map((situacao) => {
                const ativa = situacaoPainelAtiva === situacao.id;
                return (
                  <button
                    key={situacao.id}
                    onClick={() =>
                      setSituacaoPainelAtiva((atual) =>
                        atual === situacao.id ? null : situacao.id
                      )
                    }
                    className={`flex min-h-11 items-center gap-2 rounded-xl border px-2 py-1 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      ativa
                        ? "bg-zinc-800 border-zinc-700 text-white animate-pulse-once"
                        : "bg-zinc-900/80 border-zinc-800/80 hover:bg-zinc-850"
                    }`}
                  >
                    <span className="text-[9px] font-bold tracking-wide text-zinc-400">
                      {situacao.label}
                    </span>
                    <span className={`text-base font-extrabold ${ativa ? "text-white" : situacao.cor}`}>
                      {situacao.quantidade}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1">
              {secoes.filter((secao) => secao.id !== "arteParaCriar").map((secao) => {
                const ativo = !situacaoPainelAtiva && secaoAtiva === secao.id;
                return (
                  <button key={secao.id} onClick={() => { setSituacaoPainelAtiva(null); setSecaoAtiva(secao.id); }}
                    className={`flex min-h-11 items-center gap-2 rounded-xl border px-2 py-1 text-left transition-all ${ativo ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-900/80 border-zinc-800/80 text-zinc-400 hover:bg-zinc-850"}`}>
                    <span className="text-[9px] font-bold tracking-wide">{secao.label}</span>
                    <span className={`text-base font-extrabold ${ativo ? "text-white" : secao.cor}`}>{secao.lista.length}</span>
                  </button>
                );
              })}
            </div>
            </div>
          </section>
        )}

        {/* ABAS */}
        {!designerAtivo && <div className="grid grid-cols-3 gap-2 mb-3">
          {secoes.map((secao) => {
            const ativo = secaoAtiva === secao.id;
            return (
              <button
                key={secao.id}
                onClick={() => {
                  setSituacaoPainelAtiva(null);
                  setSecaoAtiva(secao.id);
                }}
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
        </div>}

        {/* LISTA */}
        <div className="space-y-3">
          {carregando ? (
            <DashboardSkeleton />
          ) : listaExibida.length > 0 ? (
            listaExibida.map((ficha) => renderSecao(ficha))
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-400 text-xs">
              {busca
                ? "Nenhum cliente encontrado"
                : situacaoPainelAtiva
                  ? `Nenhum pedido em ${painelGeral.find((s) => s.id === situacaoPainelAtiva)?.label}`
                  : `Nenhum pedido em ${secoes.find((s) => s.id === secaoAtiva)?.label}`}
            </div>
          )}
        </div>
      </div>
      <AdminNavigation />
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
