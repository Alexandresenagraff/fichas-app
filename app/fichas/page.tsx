"use client";

import { useEffect, useState, useMemo } from "react";
import { Menu, RotateCw, Pencil, Trash2, Save, X, Eye, EyeOff, Plus, ChevronDown, ChevronUp } from "lucide-react";

import app from "../../firebase/config";
import { formatarDataHora, categoriaDaFicha, Ficha, CategoriaPedido as FiltroPedidos } from "../lib/helpers";
import Sidebar from "../components/Sidebar";
import StatusToggle from "../components/StatusToggle";
import { CardSkeleton } from "../components/Skeleton";

import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const db = getFirestore(app);

function statusAtual(ficha: Ficha): { completed: string; next: string; finalizado?: boolean } {
  if (ficha.entregaStatus) {
    if (ficha.retirada) {
      return { completed: "DISPONÍVEL PARA RETIRADA", next: "PEDIDO FINALIZADO", finalizado: true };
    }
    return { completed: "ENVIADO AO DESTINATÁRIO", next: "PEDIDO FINALIZADO", finalizado: true };
  }
  if (ficha.conferencia) return { completed: "CONFERIDO E EMBALADO", next: "AGUARDANDO ENVIO" };
  if (ficha.costuraConcluida) return { completed: "COSTURA CONCLUÍDA", next: "AGUARDANDO CONFERÊNCIA" };
  if (ficha.corte) return { completed: "CORTADO", next: "AGUARDANDO COSTURA" };
  if (ficha.prensa) return { completed: "PRENSAGEM CONCLUÍDA", next: "AGUARDANDO CORTE" };
  if (ficha.impressao) return { completed: "IMPRESSO", next: "AGUARDANDO PRENSAGEM" };
  if (ficha.exportacao) return { completed: "EXPORTADO", next: "AGUARDANDO IMPRESSÃO" };
  if (ficha.arte) return { completed: "ARTE CONCLUÍDA", next: "AGUARDANDO EXPORTAÇÃO" };
  if (ficha.venda) return { completed: "VENDA REALIZADA", next: "AGUARDANDO ARTE" };
  return { completed: "AGUARDANDO VENDA", next: "" };
}

function campoData(campo: string): string {
  const mapa: Record<string, string> = {
    venda: "vendaData",
    arte: "arteData",
    exportacao: "exportacaoData",
    impressao: "impressaoData",
    prensa: "prensaData",
    corte: "corteData",
    costura: "costuraData",
    conferencia: "conferenciaData",
    entregaStatus: "entregaData",
  };
  return mapa[campo] || "";
}

export default function Home() {
  const [busca, setBusca] = useState("");
  const [resumoPedidos, setResumoPedidos] = useState<Ficha[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroPedidos | null>(null);
  const [editandoId, setEditandoId] = useState("");
  const [carregando, setCarregando] = useState(true);
  
  const [pedidosAbertos, setPedidosAbertos] = useState<string[]>([]);
  const [menuAberto, setMenuAberto] = useState(false);

  const [editCliente, setEditCliente] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editVendedor, setEditVendedor] = useState("");
  const [editObservacao, setEditObservacao] = useState("");
  const [editDesigner, setEditDesigner] = useState("");
  const [editPedido, setEditPedido] = useState("");
  const [editEntrega, setEditEntrega] = useState("");

  async function carregarResumoPedidos() {
    try {
      const querySnapshot = await getDocs(collection(db, "fichas"));
      const lista: Ficha[] = [];
      querySnapshot.forEach((item) => {
        lista.push({ id: item.id, ...item.data() } as Ficha);
      });
      setResumoPedidos(lista);
    } catch (error) {
      console.error("Erro ao carregar fichas:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarResumoPedidos();
  }, []);

  // Optimized client-side filtering for fast query feedback and optimized DB reads
  const fichasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    
    if (filtroAtivo) {
      return resumoPedidos.filter((ficha) => categoriaDaFicha(ficha) === filtroAtivo);
    }
    
    if (!termo) return [];
    
    return resumoPedidos.filter((ficha) =>
      (ficha.cliente || "").toLowerCase().includes(termo)
    );
  }, [busca, filtroAtivo, resumoPedidos]);

  function selecionarFiltro(filtro: FiltroPedidos) {
    if (filtroAtivo === filtro) {
      setFiltroAtivo(null);
      return;
    }
    setBusca("");
    setPedidosAbertos([]);
    setFiltroAtivo(filtro);
  }

  async function alterarStatus(id: string, campo: keyof Ficha, valorAtual: boolean) {
    try {
      const fichaRef = doc(db, "fichas", id);
      const campoDataHora = campoData(String(campo));
      const atualizacao: Partial<Ficha> = { [campo]: !valorAtual };
      
      if (campoDataHora) {
        atualizacao[campoDataHora as keyof Ficha] = (!valorAtual ? formatarDataHora() : "") as any;
      }
      
      await updateDoc(fichaRef, atualizacao);

      setResumoPedidos((prev) =>
        prev.map((item) =>
          item.id === id
            ? { 
                ...item, 
                [campo]: !valorAtual, 
                ...(campoDataHora ? { [campoDataHora]: atualizacao[campoDataHora as keyof Ficha] } : {}) 
              }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar");
    }
  }

  async function salvarPdfLink(id: string, link: string) {
    try {
      const fichaRef = doc(db, "fichas", id);
      await updateDoc(fichaRef, { pdfLink: link });

      setResumoPedidos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, pdfLink: link } : item))
      );
      alert("PDF salvo!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar PDF");
    }
  }

  async function excluirFicha(id: string) {
    const confirmar = window.confirm("Deseja mesmo excluir esta ficha?");
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, "fichas", id));
      setResumoPedidos((prev) => prev.filter((item) => item.id !== id));
      alert("Ficha excluída com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir ficha");
    }
  }

  function iniciarEdicao(ficha: Ficha) {
    if (!ficha.id) return;
    setEditandoId(ficha.id);
    setEditCliente(ficha.cliente || "");
    setEditEmail(ficha.email || "");
    setEditVendedor(ficha.vendedor || "");
    setEditObservacao(ficha.observacao || "");
    setEditDesigner(ficha.designer || "");
    setEditPedido(ficha.pedido || "");
    setEditEntrega(ficha.entrega || "");
  }

  async function salvarEdicao() {
    try {
      const fichaRef = doc(db, "fichas", editandoId);
      const data = {
        cliente: editCliente,
        email: editEmail,
        vendedor: editVendedor,
        observacao: editObservacao,
        designer: editDesigner,
        pedido: editPedido,
        entrega: editEntrega,
      };
      await updateDoc(fichaRef, data);

      setResumoPedidos((prev) =>
        prev.map((item) => (item.id === editandoId ? { ...item, ...data } : item))
      );
      setEditandoId("");
      alert("Alterações salvas!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar alterações");
    }
  }

  function alternarPedido(id: string) {
    setPedidosAbertos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const filtros = [
    { id: "urgentes" as const, label: "URGENTES", cor: "amber" },
    { id: "atrasados" as const, label: "ATRASADOS", cor: "red" },
    { id: "noPrazo" as const, label: "NO PRAZO", cor: "blue" },
    { id: "finalizados" as const, label: "FINALIZADOS", cor: "green" },
  ];

  const contagens = useMemo(() => {
    return filtros.reduce(
      (total, filtro) => ({
        ...total,
        [filtro.id]: resumoPedidos.filter(
          (ficha) => categoriaDaFicha(ficha) === filtro.id
        ).length,
      }),
      {} as Record<FiltroPedidos, number>
    );
  }, [resumoPedidos]);

  return (
    <main className="min-h-screen bg-black p-3 text-white relative">
      <button
        onClick={() => setMenuAberto(!menuAberto)}
        className="fixed top-4 right-4 text-white p-2.5 bg-zinc-900/90 border border-zinc-800 hover:bg-zinc-800 active:scale-95 transition-all duration-200 rounded-xl z-40 cursor-pointer shadow-lg"
        title="Menu"
      >
        <Menu size={22} />
      </button>

      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />

      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mt-12 mb-4 px-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">PEDIDOS</h1>
          <button
            onClick={() => window.location.href = "/comercial"}
            className="bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg"
          >
            <Plus size={14} /> Novo
          </button>
        </div>

        {/* PESQUISA */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-xl p-4 mb-5">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={filtroAtivo ? `Filtro ativo: ${filtros.find(f => f.id === filtroAtivo)?.label}` : "🔎 Pesquisar Cliente"}
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setFiltroAtivo(null);
              }}
              className={`flex-1 bg-black border rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none transition-all ${
                filtroAtivo
                  ? "border-blue-500 placeholder-blue-300 focus:ring-1 focus:ring-blue-500"
                  : "border-zinc-700 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              }`}
            />

            <button
              onClick={() => {
                setBusca("");
                setFiltroAtivo(null);
                carregarResumoPedidos();
              }}
              className="bg-zinc-850 border border-zinc-800 hover:bg-zinc-800 active:scale-95 transition-all duration-150 rounded-xl px-3 text-zinc-400 hover:text-white"
              title="Atualizar pedidos"
            >
              <RotateCw size={15} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {filtros.map((filtro) => {
              const ativo = filtroAtivo === filtro.id;
              const estilo = {
                amber: ativo
                  ? "bg-amber-400 text-black border-amber-400"
                  : "bg-amber-950/20 text-amber-400 border-amber-900/50 hover:bg-amber-950/40",
                red: ativo
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-red-950/20 text-red-400 border-red-900/50 hover:bg-red-950/40",
                blue: ativo
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-blue-950/20 text-blue-400 border-blue-900/50 hover:bg-blue-950/40",
                green: ativo
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-green-950/20 text-green-400 border-green-900/50 hover:bg-green-950/40",
              }[filtro.cor];

              return (
                <button
                  key={filtro.id}
                  onClick={() => selecionarFiltro(filtro.id)}
                  aria-pressed={ativo}
                  className={`rounded-xl px-3 py-2 text-[10px] font-bold border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${estilo}`}
                >
                  {filtro.label} ({contagens[filtro.id]})
                </button>
              );
            })}
          </div>
        </div>

        {/* RESULTADOS */}
        {(busca || filtroAtivo) && (
          <div className="space-y-4">
            {carregando ? (
              <div className="space-y-3">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : fichasFiltradas.length > 0 ? (
              fichasFiltradas.map((ficha) => {
                if (!ficha.id) return null;
                const isAberto = pedidosAbertos.includes(ficha.id);
                return (
                  <div
                    key={ficha.id}
                    className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4.5 shadow-xl transition-all duration-200 hover:border-zinc-800/80"
                  >
                    {/* TOPO */}
                    <div className="mb-4">
                      {/* NOME + LIXEIRA */}
                      <div className="flex justify-between items-start gap-3 mb-3">
                        {editandoId === ficha.id ? (
                          <input
                            type="text"
                            value={editCliente}
                            onChange={(e) => setEditCliente(e.target.value)}
                            className="flex-1 bg-black border border-zinc-700 rounded-xl p-2 text-sm text-white focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none"
                          />
                        ) : (
                          <p className="text-xl font-extrabold break-words leading-tight flex-1 uppercase text-white">
                            {ficha.cliente}
                          </p>
                        )}
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => iniciarEdicao(ficha)}
                            className="text-zinc-500 hover:text-blue-400 active:scale-90 transition-all duration-150 p-1"
                            title="Editar ficha"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => excluirFicha(ficha.id || "")}
                            className="text-zinc-500 hover:text-red-500 active:scale-90 transition-all duration-150 p-1"
                            title="Excluir ficha"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* DATAS */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-zinc-500 text-[10px] font-bold tracking-wider">
                            PEDIDO:
                          </p>
                          {editandoId === ficha.id ? (
                            <input
                              type="date"
                              value={editPedido}
                              onChange={(e) => setEditPedido(e.target.value)}
                              className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-xs text-white outline-none"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-zinc-300">
                              {ficha.pedido
                                ? ficha.pedido.split("-").reverse().join("/")
                                : "-"}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-zinc-500 text-[10px] font-bold tracking-wider">
                            ENTREGA:
                          </p>
                          {editandoId === ficha.id ? (
                            <input
                              type="date"
                              value={editEntrega}
                              onChange={(e) => setEditEntrega(e.target.value)}
                              className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-xs text-white outline-none"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-zinc-300">
                              {ficha.entrega
                                ? ficha.entrega.split("-").reverse().join("/")
                                : "-"}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => alternarPedido(ficha.id || "")}
                        className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-[0.99] transition-all duration-200 rounded-xl py-2.5 mb-4 text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5"
                        aria-expanded={isAberto}
                        aria-controls={`detalhes-${ficha.id}`}
                      >
                        {isAberto ? (
                          <>
                            <EyeOff size={14} /> RECOLHER
                          </>
                        ) : (
                          <>
                            <Eye size={14} /> VISUALIZAR
                          </>
                        )}
                      </button>

                      <div className="mb-2 text-center text-xs font-semibold space-y-1">
                        <p className="text-lime-400 flex items-center justify-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-lime-400 rounded-full inline-block animate-pulse"></span>
                          {statusAtual(ficha).completed}
                        </p>
                        {statusAtual(ficha).next && (
                          <p className={statusAtual(ficha).finalizado ? "text-blue-400" : "text-yellow-400"}>
                            {statusAtual(ficha).finalizado ? "🔵" : "🟡"} {statusAtual(ficha).next}
                          </p>
                        )}
                      </div>

                      {isAberto && (
                        <div id={`detalhes-${ficha.id}`} className="animate-[slideDown_0.2s_ease-out] border-t border-zinc-900 pt-4 space-y-3">
                          {/* IDENTIFICAÇÃO DO CLIENTE */}
                          <div>
                            <p className="text-zinc-500 text-[10px] font-bold tracking-wider">
                              Email, Tel ou Cód. Cliente:
                            </p>
                            {editandoId === ficha.id ? (
                              <input
                                type="text"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-xs text-white outline-none"
                              />
                            ) : (
                              <p className="text-sm font-medium text-zinc-300 break-words">
                                {ficha.email || "-"}
                              </p>
                            )}
                          </div>

                          {editandoId === ficha.id && (
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={salvarEdicao}
                                className="bg-green-600 hover:bg-green-700 transition rounded-xl px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                              >
                                <Save size={14} /> SALVAR
                              </button>
                              <button
                                onClick={() => setEditandoId("")}
                                className="bg-zinc-800 hover:bg-zinc-700 transition rounded-xl px-4 py-2 text-xs font-bold text-zinc-300 cursor-pointer"
                              >
                                <X size={14} /> CANCELAR
                              </button>
                            </div>
                          )}

                          {/* OBSERVAÇÃO */}
                          <div>
                            <p className="text-zinc-500 text-[10px] font-bold tracking-wider">
                              Observação:
                            </p>
                            {editandoId === ficha.id ? (
                              <input
                                type="text"
                                value={editObservacao}
                                onChange={(e) => setEditObservacao(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-xs text-white outline-none"
                              />
                            ) : (
                              <p className="text-sm text-zinc-400 break-words">
                                {ficha.observacao || "-"}
                              </p>
                            )}
                          </div>

                          {/* VENDEDOR + DESIGNER */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-zinc-500 text-[10px] font-bold tracking-wider">
                                VENDEDOR:
                              </p>
                              {editandoId === ficha.id ? (
                                <input
                                  type="text"
                                  value={editVendedor}
                                  onChange={(e) => setEditVendedor(e.target.value)}
                                  className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-xs text-white outline-none"
                                />
                              ) : (
                                <p className="text-sm font-bold uppercase text-zinc-300">
                                  {ficha.vendedor || "-"}
                                </p>
                              )}
                            </div>

                            <div>
                              <p className="text-zinc-500 text-[10px] font-bold tracking-wider">
                                DESIGNER:
                              </p>
                              {editandoId === ficha.id ? (
                                <input
                                  type="text"
                                  value={editDesigner}
                                  onChange={(e) => setEditDesigner(e.target.value)}
                                  className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-xs text-white outline-none"
                                />
                              ) : (
                                <p className="text-sm font-bold text-zinc-300 uppercase">
                                  {ficha.designer || "-"}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* STATUS */}
                    {isAberto && (
                      <div className="flex flex-col gap-2.5 border-t border-zinc-900 pt-4">
                        {/* BARRA DE PROGRESSO */}
                        {(() => {
                          const etapas = [
                            ficha.venda,
                            ficha.arte,
                            ficha.exportacao,
                            ficha.impressao,
                            ficha.prensa,
                            ficha.corte,
                            ficha.costura,
                            ficha.costuraConcluida,
                            ficha.conferencia,
                            ficha.entregaStatus,
                          ];
                          const concluidas = etapas.filter(Boolean).length;
                          const porcentagem = Math.round((concluidas / etapas.length) * 100);

                          return (
                            <div className="mb-2">
                              <div className="relative w-full h-6 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${porcentagem}%`,
                                    background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-[11px] tracking-wider">
                                  {porcentagem}% CONCLUÍDO
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="space-y-2">
                          <StatusToggle
                            label={ficha.venda ? "VENDA FEITA" : "VENDA"}
                            ativo={!!ficha.venda}
                            data={ficha.vendaData}
                            onClick={() => alterarStatus(ficha.id || "", "venda", !!ficha.venda)}
                          />

                          <StatusToggle
                            label={ficha.arte ? "ARTE CONCLUÍDA" : "ARTE"}
                            ativo={!!ficha.arte}
                            data={ficha.arteData}
                            onClick={() => alterarStatus(ficha.id || "", "arte", !!ficha.arte)}
                          />

                          <div className="space-y-2">
                            <StatusToggle
                              label={ficha.exportacao ? "EXPORTADO" : "EXPORTANDO"}
                              ativo={!!ficha.exportacao}
                              data={ficha.exportacaoData}
                              onClick={() => alterarStatus(ficha.id || "", "exportacao", !!ficha.exportacao)}
                            />

                            {ficha.exportacao && (
                              <div className="ml-4 pl-3 border-l border-zinc-800 space-y-2 animate-[slideDown_0.15s_ease-out]">
                                {ficha.pdfLink ? (
                                  <a
                                    href={ficha.pdfLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center rounded-xl p-2.5 text-xs font-bold text-white shadow-md"
                                  >
                                    📄 VER PDF
                                  </a>
                                ) : (
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      placeholder="Cole o link do PDF aqui"
                                      className="flex-1 bg-black border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none focus:border-zinc-700"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          salvarPdfLink(ficha.id || "", e.currentTarget.value);
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        if (input) salvarPdfLink(ficha.id || "", input.value);
                                      }}
                                      className="bg-indigo-650 hover:bg-indigo-700 hover:scale-105 active:scale-95 text-white text-[10px] font-bold py-2 px-3.5 rounded-lg transition-all"
                                    >
                                      SALVAR
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <StatusToggle
                            label={ficha.impressao ? "IMPRESSO" : "IMPRESSÃO"}
                            ativo={!!ficha.impressao}
                            data={ficha.impressaoData}
                            onClick={() => alterarStatus(ficha.id || "", "impressao", !!ficha.impressao)}
                          />
                        </div>

                        <div className="space-y-2">
                          <StatusToggle
                            label={ficha.prensa ? "PRENSAGEM CONCLUÍDA" : "NA PRENSA"}
                            ativo={!!ficha.prensa}
                            data={ficha.prensaData}
                            onClick={() => alterarStatus(ficha.id || "", "prensa", !!ficha.prensa)}
                          />

                          <StatusToggle
                            label={ficha.corte ? "CORTADO" : "CORTE"}
                            ativo={!!ficha.corte}
                            data={ficha.corteData}
                            onClick={() => alterarStatus(ficha.id || "", "corte", !!ficha.corte)}
                          />

                          <div className="space-y-2">
                            <StatusToggle
                              label={ficha.costura ? "ENVIADO P/ COSTUREIRO(A)" : "COSTURA"}
                              ativo={!!ficha.costura}
                              data={ficha.costuraData}
                              onClick={() => alterarStatus(ficha.id || "", "costura", !!ficha.costura)}
                            />

                            {ficha.costura && (
                              <div className="ml-4 pl-3 border-l border-zinc-800 space-y-2 animate-[slideDown_0.15s_ease-out]">
                                <StatusToggle
                                  label="PAULO"
                                  ativo={!!ficha.costureiroPaulo}
                                  onClick={() => alterarStatus(ficha.id || "", "costureiroPaulo", !!ficha.costureiroPaulo)}
                                />

                                <StatusToggle
                                  label="CELINA"
                                  ativo={!!ficha.costureiroCelina}
                                  onClick={() => alterarStatus(ficha.id || "", "costureiroCelina", !!ficha.costureiroCelina)}
                                />

                                {(ficha.costureiroPaulo || ficha.costureiroCelina) && (
                                  <StatusToggle
                                    label={ficha.costuraConcluida ? "COSTURA CONCLUÍDA" : "AGUARDANDO COSTURA"}
                                    ativo={!!ficha.costuraConcluida}
                                    onClick={() => alterarStatus(ficha.id || "", "costuraConcluida", !!ficha.costuraConcluida)}
                                  />
                                )}
                              </div>
                            )}
                          </div>

                          <StatusToggle
                            label={ficha.conferencia ? "CONFERIDO E EMBALADO" : "CONFERÊNCIA/RECEPÇÃO"}
                            ativo={!!ficha.conferencia}
                            data={ficha.conferenciaData}
                            onClick={() => alterarStatus(ficha.id || "", "conferencia", !!ficha.conferencia)}
                          />

                          <div className="space-y-2">
                            <StatusToggle
                              label={ficha.entregaStatus ? "ENTREGUE" : "ENTREGA"}
                              ativo={!!ficha.entregaStatus}
                              data={ficha.entregaData}
                              onClick={() => alterarStatus(ficha.id || "", "entregaStatus", !!ficha.entregaStatus)}
                            />

                            {ficha.entregaStatus && (
                              <div className="ml-4 pl-3 border-l border-zinc-800 space-y-2 animate-[slideDown_0.15s_ease-out]">
                                <StatusToggle
                                  label="ENVIO"
                                  ativo={!!ficha.envio}
                                  onClick={() => alterarStatus(ficha.id || "", "envio", !!ficha.envio)}
                                />

                                <StatusToggle
                                  label="RETIRADA"
                                  ativo={!!ficha.retirada}
                                  onClick={() => alterarStatus(ficha.id || "", "retirada", !!ficha.retirada)}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center text-zinc-400 text-xs">
                {filtroAtivo
                  ? "Nenhum pedido encontrado neste filtro"
                  : "Nenhum cliente encontrado"}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
