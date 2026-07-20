"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, X, Calendar, User } from "lucide-react";
import NotificationBell from "../components/NotificationBell";

import app from "../../firebase/config";
import { addDoc, collection, doc, getFirestore, onSnapshot, updateDoc } from "firebase/firestore";

import {
  formatarDataHora,
  etapaDaFicha,
  ETAPAS,
  VENDEDORES,
  DESIGNERS,
  type Ficha,
  type Etapa,
  type HistoricoAprovacao,
} from "../lib/helpers";
import { DashboardSkeleton } from "../components/Skeleton";

const db = getFirestore(app);

function ComercialContent() {
  const searchParams = useSearchParams();
  const vendedorParam = searchParams.get("vendedor") || "";

  const [modalAberto, setModalAberto] = useState(false);
  const [modalAlteracao, setModalAlteracao] = useState(false);
  const [fichaAlteracao, setFichaAlteracao] = useState<Ficha | null>(null);
  const [mensagemAlteracao, setMensagemAlteracao] = useState("");
  const [pedidos, setPedidos] = useState<Ficha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<Etapa>("arteParaCriar");
  const [busca, setBusca] = useState("");

  const [cliente, setCliente] = useState("");
  const [email, setEmail] = useState("");
  const [vendedor, setVendedor] = useState(vendedorParam);
  const [observacao, setObservacao] = useState("");
  const [designer, setDesigner] = useState("");
  const [pedido, setPedido] = useState("");
  const [entrega, setEntrega] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "fichas"),
      (snapshot) => {
        const lista: Ficha[] = [];
        snapshot.forEach((item) => {
          const dados = item.data() as Ficha;
          if (dados.venda) {
            lista.push({ id: item.id, ...dados });
          }
        });
        setPedidos(lista);
        setCarregando(false);
      },
      (error) => {
        console.error("Erro onSnapshot comercial:", error);
        setCarregando(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (modalAlteracao) setModalAlteracao(false);
        else if (modalAberto) setModalAberto(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalAberto, modalAlteracao]);

  const fichaIdParam = searchParams.get("fichaId");

  useEffect(() => {
    if (fichaIdParam && pedidos.length > 0) {
      const fichaAlvo = pedidos.find((p) => p.id === fichaIdParam);
      if (fichaAlvo) {
        const etapa = etapaDaFicha(fichaAlvo);
        if (etapa) {
          // Mantém a aba alinhada à ficha aberta pelo link de notificação.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setAbaAtiva(etapa);
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
  }, [fichaIdParam, pedidos]);

  async function salvarFicha() {
    if (!cliente) {
      alert("Digite o nome do cliente");
      return;
    }

    if (!entrega) {
      alert("Selecione a data de entrega");
      return;
    }

    try {
      await addDoc(collection(db, "fichas"), {
        cliente,
        email,
        vendedor,
        observacao,
        designer,
        pedido,
        entrega,
        pdfLink: "",
        venda: true,
        vendaData: formatarDataHora(),
        arte: false,
        arteData: "",
        arteAprovada: false,
        alteracaoSolicitada: false,
        historicoAprovacao: [],
        exportacao: false,
        impressao: false,
        prensa: false,
        corte: false,
        costura: false,
        costureiroPaulo: false,
        costureiroCelina: false,
        costuraConcluida: false,
        conferencia: false,
        entregaStatus: false,
        envio: false,
        retirada: false,
        criadoEm: new Date(),
      });

      alert("Ficha salva!");
      setCliente("");
      setEmail("");
      setVendedor(vendedorParam); // Reset back to default seller parameter if present
      setObservacao("");
      setDesigner("");
      setPedido("");
      setEntrega("");
      setModalAberto(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar");
    }
  }

  async function solicitarAlteracao(ficha: Ficha) {
    if (!mensagemAlteracao.trim()) {
      alert("Descreva a alteração solicitada");
      return;
    }

    if (!ficha.id) return;

    try {
      const dataHoraFormatada = formatarDataHora();
      const solicitanteNome = vendedorParam || ficha.vendedor || "Vendedor";

      const novaMensagem: HistoricoAprovacao = {
        dataHora: dataHoraFormatada,
        autor: solicitanteNome,
        mensagem: mensagemAlteracao.trim(),
        tipo: "alteracao",
      };

      const novaAlteracao = {
        id: Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
        descricao: mensagemAlteracao.trim(),
        dataHora: dataHoraFormatada,
        solicitante: solicitanteNome,
        status: "pendente" as const,
      };

      const historico = ficha.historicoAprovacao || [];
      const alteracoes = ficha.alteracoes || [];

      await updateDoc(doc(db, "fichas", ficha.id), {
        arte: false,
        alteracaoSolicitada: true,
        historicoAprovacao: [...historico, novaMensagem],
        alteracoes: [...alteracoes, novaAlteracao],
      });

      setMensagemAlteracao("");
      setFichaAlteracao(null);
      setModalAlteracao(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao solicitar alteração");
    }
  }

  async function aprovarArte(ficha: Ficha) {
    if (!ficha.id) return;

    try {
      const novaMensagem: HistoricoAprovacao = {
        dataHora: formatarDataHora(),
        autor: vendedorParam || ficha.vendedor || "Vendedor",
        mensagem: "Arte aprovada comercialmente.",
        tipo: "aprovacao",
      };

      const historico = ficha.historicoAprovacao || [];

      await updateDoc(doc(db, "fichas", ficha.id), {
        arteAprovada: true,
        alteracaoSolicitada: false,
        historicoAprovacao: [...historico, novaMensagem],
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao aprovar arte");
    }
  }

  function abrirModalAlteracao(ficha: Ficha) {
    setFichaAlteracao(ficha);
    setMensagemAlteracao("");
    setModalAlteracao(true);
  }

  const pedidosDoVendedor = useMemo(() => {
    return vendedorParam
      ? pedidos.filter((ficha) => ficha.vendedor === vendedorParam)
      : pedidos;
  }, [pedidos, vendedorParam]);

  const pedidosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return pedidosDoVendedor.filter((ficha) => {
      const matchBusca =
        !termo || (ficha.cliente || "").toLowerCase().includes(termo);
      const matchEtapa = etapaDaFicha(ficha) === abaAtiva;
      return matchBusca && matchEtapa;
    });
  }, [pedidosDoVendedor, busca, abaAtiva]);

  const contagens = useMemo(() => {
    return ETAPAS.reduce(
      (total, etapa) => ({
        ...total,
        [etapa.id]: pedidosDoVendedor.filter(
          (ficha) => etapaDaFicha(ficha) === etapa.id
        ).length,
      }),
      {} as Record<Etapa, number>
    );
  }, [pedidosDoVendedor]);

  return (
    <main className="min-h-screen bg-black p-3 text-white">
      <div className="max-w-md mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mt-5 mb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">COMERCIAL</h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              {vendedorParam
                ? `Dashboard de ${vendedorParam}`
                : "Acompanhamento de pedidos"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setModalAberto(true)}
              className="bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-250 rounded-xl px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Plus size={14} /> NOVO PEDIDO
            </button>
          </div>
        </div>

        {/* BUSCA */}
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
          {ETAPAS.map((etapa) => {
            const ativo = abaAtiva === etapa.id;
            return (
              <button
                key={etapa.id}
                onClick={() => setAbaAtiva(etapa.id)}
                className={`rounded-xl py-2 px-1 text-[9px] font-bold border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  ativo 
                    ? "bg-zinc-800 border-zinc-700 text-white" 
                    : "bg-zinc-900 border-zinc-800/85 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-300"
                }`}
              >
                <span className="block truncate">{etapa.label}</span>
                <span className="block text-xs mt-0.5 text-zinc-500">
                  ({contagens[etapa.id]})
                </span>
              </button>
            );
          })}
        </div>

        {/* LISTA */}
        <div className="space-y-3">
          {carregando ? (
            <DashboardSkeleton />
          ) : pedidosFiltrados.length > 0 ? (
            pedidosFiltrados.map((ficha) => (
              <div
                key={ficha.id}
                id={`ficha-${ficha.id}`}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg transition-all duration-200 hover:border-zinc-800/80"
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold uppercase break-words leading-tight text-white">
                      {ficha.cliente}
                    </p>
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
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 flex-shrink-0">
                    {ficha.designer || "—"}
                  </span>
                </div>

                {ficha.pedido && (
                  <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1.5">
                    <Calendar size={13} className="text-zinc-500" />
                    Pedido:{" "}
                    <span className="text-white font-medium">
                      {ficha.pedido.split("-").reverse().join("/")}
                    </span>
                  </p>
                )}

                {ficha.entrega && (
                  <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1.5">
                    <Calendar size={13} className="text-zinc-500" />
                    Entrega:{" "}
                    <span className="text-white font-medium">
                      {ficha.entrega.split("-").reverse().join("/")}
                    </span>
                  </p>
                )}

                {ficha.vendedor && (
                  <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1.5">
                    <User size={13} className="text-zinc-500" />
                    Vendedor:{" "}
                    <span className="text-white font-medium">
                      {ficha.vendedor}
                    </span>
                  </p>
                )}

                {ficha.historicoAprovacao && ficha.historicoAprovacao.length > 0 && (
                  <div className="bg-black/50 border border-zinc-900 rounded-xl p-3.5 mt-3 mb-3 space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                    {ficha.historicoAprovacao.map((item, index) => (
                      <div key={index} className="text-xs border-l-2 border-zinc-700 pl-2.5">
                        <p className="text-[10px] text-zinc-500 mb-0.5">
                          {item.dataHora} — {item.autor}
                        </p>
                        <p className="text-zinc-300">{item.mensagem}</p>
                      </div>
                    ))}
                  </div>
                )}

                {etapaDaFicha(ficha) === "aguardandoAprovacao" && (
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-zinc-900/60">
                    <button
                      onClick={() => abrirModalAlteracao(ficha)}
                      className="bg-red-650/15 border border-red-900/50 hover:bg-red-650/25 active:scale-95 transition-all duration-200 text-red-400 rounded-xl p-2.5 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      ✏️ SOLICITAR ALTERAÇÃO
                    </button>
                    <button
                      onClick={() => aprovarArte(ficha)}
                      className="bg-green-650/15 border border-green-900/50 hover:bg-green-650/25 active:scale-95 transition-all duration-200 text-green-400 rounded-xl p-2.5 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      ✅ APROVAR ARTE
                    </button>
                  </div>
                )}

                {ficha.pdfLink && (
                  <a
                    href={ficha.pdfLink}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-center rounded-xl p-2.5 text-xs font-bold mt-3 text-blue-400 hover:text-blue-300"
                  >
                    📄 VER PDF
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-400 text-xs">
              {busca
                ? "Nenhum cliente encontrado"
                : `Nenhum pedido em ${ETAPAS.find((e) => e.id === abaAtiva)?.label}`}
            </div>
          )}
        </div>
      </div>

      {/* MODAL NOVO PEDIDO */}
      {modalAberto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-3 overflow-y-auto"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-zinc-900 rounded-3xl shadow-2xl p-6 mt-10 border border-zinc-800/80 w-full max-w-md animate-[slideDown_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold tracking-tight">NOVO PEDIDO</h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome do Cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-black border border-zinc-750 rounded-xl p-3 text-xs outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white"
              />

              <input
                type="text"
                placeholder="Email, Tel ou Cód cliente"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-zinc-750 rounded-xl p-3 text-xs outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white"
              />

              <select
                value={vendedor}
                onChange={(e) => setVendedor(e.target.value)}
                className="w-full bg-black border border-zinc-750 rounded-xl p-3 text-xs outline-none text-white focus:border-zinc-500"
              >
                <option value="">Selecione o Vendedor</option>
                {VENDEDORES.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Observação"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full bg-black border border-zinc-750 rounded-xl p-3 text-xs outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white"
              />

              <select
                value={designer}
                onChange={(e) => setDesigner(e.target.value)}
                className="w-full bg-black border border-zinc-750 rounded-xl p-3 text-xs outline-none text-white focus:border-zinc-500"
              >
                <option value="">Selecione o Designer</option>
                {DESIGNERS.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Data do Pedido</label>
                <input
                  type="date"
                  value={pedido}
                  onChange={(e) => setPedido(e.target.value)}
                  className="w-full bg-black border border-zinc-750 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Data da Entrega *</label>
                <input
                  type="date"
                  value={entrega}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/-(\d{2})-/, (match, mes) => {
                      return mes === "00" ? "-01-" : match;
                    });
                    setEntrega(valor);
                  }}
                  className="w-full bg-black border border-zinc-750 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              <button
                onClick={salvarFicha}
                className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl p-3 text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                SALVAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SOLICITAR ALTERAÇÃO */}
      {modalAlteracao && fichaAlteracao && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-3 overflow-y-auto"
          onClick={() => setModalAlteracao(false)}
        >
          <div
            className="bg-zinc-900 rounded-3xl shadow-2xl p-6 mt-10 border border-zinc-800 w-full max-w-md animate-[slideDown_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold tracking-tight">SOLICITAR ALTERAÇÃO</h2>
              <button
                onClick={() => setModalAlteracao(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-3 bg-black/35 p-2.5 rounded-xl border border-zinc-800">
              Cliente: <span className="text-white font-extrabold">{fichaAlteracao.cliente}</span>
            </p>

            <textarea
              placeholder="Descreva a alteração solicitada pelo cliente..."
              value={mensagemAlteracao}
              onChange={(e) => setMensagemAlteracao(e.target.value)}
              rows={5}
              className="w-full bg-black border border-zinc-750 rounded-xl p-3 outline-none text-xs text-white resize-none focus:border-zinc-500"
            />

            <button
              onClick={() => solicitarAlteracao(fichaAlteracao)}
              className="w-full bg-red-655 hover:bg-red-700 hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl p-3 text-xs font-bold text-white shadow-lg cursor-pointer mt-4"
            >
              ENVIAR SOLICITAÇÃO
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Comercial() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black p-3 text-white">
          <DashboardSkeleton />
        </main>
      }
    >
      <ComercialContent />
    </Suspense>
  );
}
