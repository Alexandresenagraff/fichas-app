"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import app from "../../firebase/config";

import {
  addDoc,
  collection,
  getFirestore,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const db = getFirestore(app);

function formatarDataHora(): string {
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, "0");
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const ano = agora.getFullYear();
  const horas = String(agora.getHours()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

type Etapa =
  | "novo"
  | "arte"
  | "exportacao"
  | "impressao"
  | "prensa"
  | "corte"
  | "costura"
  | "conferencia"
  | "entrega";

const etapas: { id: Etapa; label: string; cor: string }[] = [
  { id: "novo", label: "NOVO PEDIDO", cor: "blue" },
  { id: "arte", label: "ARTE", cor: "purple" },
  { id: "exportacao", label: "EXPORTAÇÃO", cor: "indigo" },
  { id: "impressao", label: "IMPRESSÃO", cor: "cyan" },
  { id: "prensa", label: "PRENSA", cor: "amber" },
  { id: "corte", label: "CORTE", cor: "orange" },
  { id: "costura", label: "COSTURA", cor: "pink" },
  { id: "conferencia", label: "CONFERÊNCIA", cor: "teal" },
  { id: "entrega", label: "ENTREGA", cor: "green" },
];

function etapaDaFicha(ficha: any): Etapa {
  if (ficha.entregaStatus) return "entrega";
  if (ficha.conferencia) return "conferencia";
  if (ficha.costuraConcluida) return "conferencia";
  if (ficha.costura) return "costura";
  if (ficha.corte) return "corte";
  if (ficha.prensa) return "prensa";
  if (ficha.impressao) return "impressao";
  if (ficha.exportacao) return "exportacao";
  if (ficha.arte) return "arte";
  return "novo";
}

function ComercialContent() {
  const searchParams = useSearchParams();
  const vendedorParam = searchParams.get("vendedor") || "";

  const [modalAberto, setModalAberto] = useState(false);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<Etapa>("novo");
  const [busca, setBusca] = useState("");

  const [cliente, setCliente] = useState("");
  const [email, setEmail] = useState("");
  const [vendedor, setVendedor] = useState(vendedorParam);
  const [observacao, setObservacao] = useState("");
  const [designer, setDesigner] = useState("");
  const [pedido, setPedido] = useState("");
  const [entrega, setEntrega] = useState("");

  async function carregarPedidos() {
    try {
      const snapshot = await getDocs(collection(db, "fichas"));
      const lista: any[] = [];
      snapshot.forEach((item) => {
        const dados = item.data();
        if (dados.venda) {
          lista.push({ id: item.id, ...dados });
        }
      });
      setPedidos(lista);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

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
      setVendedor("");
      setObservacao("");
      setDesigner("");
      setPedido("");
      setEntrega("");
      setModalAberto(false);
      carregarPedidos();
    } catch (error) {
      console.log(error);
      alert("Erro ao salvar");
    }
  }

  const pedidosDoVendedor = vendedorParam
    ? pedidos.filter((ficha) => ficha.vendedor === vendedorParam)
    : pedidos;

  const pedidosFiltrados = pedidosDoVendedor.filter((ficha) => {
    const termo = busca.trim().toLowerCase();
    const matchBusca = !termo || (ficha.cliente || "").toLowerCase().includes(termo);
    const matchEtapa = etapaDaFicha(ficha) === abaAtiva;
    return matchBusca && matchEtapa;
  });

  const contagens = etapas.reduce(
    (total, etapa) => ({
      ...total,
      [etapa.id]: pedidosDoVendedor.filter((ficha) => etapaDaFicha(ficha) === etapa.id)
        .length,
    }),
    {} as Record<Etapa, number>
  );

  return (
    <main className="min-h-screen bg-black p-3 text-white">
      <div className="max-w-md mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mt-5 mb-5">
          <div>
            <h1 className="text-2xl font-bold">COMERCIAL</h1>
            <p className="text-zinc-400 text-xs">
              {vendedorParam
                ? `Dashboard de ${vendedorParam}`
                : "Acompanhamento de pedidos"}
            </p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="bg-blue-600 hover:bg-blue-700 transition rounded-full px-4 py-2 text-sm font-bold"
          >
            + NOVO PEDIDO
          </button>
        </div>

        {/* BUSCA */}
        <div className="bg-zinc-900 rounded-2xl p-3 mb-4 border border-zinc-800">
          <input
            type="text"
            placeholder="🔎 Pesquisar Cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white placeholder-zinc-500 outline-none"
          />
        </div>

        {/* ABAS */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {etapas.map((etapa) => {
            const ativo = abaAtiva === etapa.id;
            const corMap: Record<string, string> = {
              blue: ativo ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
              purple: ativo ? "bg-purple-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
              indigo: ativo ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
              cyan: ativo ? "bg-cyan-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
              amber: ativo ? "bg-amber-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
              orange: ativo ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
              pink: ativo ? "bg-pink-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
              teal: ativo ? "bg-teal-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
              green: ativo ? "bg-green-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
            };
            return (
              <button
                key={etapa.id}
                onClick={() => setAbaAtiva(etapa.id)}
                className={`rounded-xl py-2.5 text-[10px] font-bold transition text-center ${corMap[etapa.cor]}`}
              >
                {etapa.label}
                <span className="block text-xs mt-0.5">({contagens[etapa.id]})</span>
              </button>
            );
          })}
        </div>

        {/* LISTA */}
        <div className="space-y-3">
          {pedidosFiltrados.length > 0 ? (
            pedidosFiltrados.map((ficha) => (
              <div
                key={ficha.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-lg font-bold uppercase break-words flex-1">
                    {ficha.cliente}
                  </p>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 flex-shrink-0 ml-2">
                    {ficha.designer || "—"}
                  </span>
                </div>

                {ficha.pedido && (
                  <p className="text-xs text-zinc-400 mb-1">
                    Pedido: <span className="text-white font-semibold">{ficha.pedido.split("-").reverse().join("/")}</span>
                  </p>
                )}

                {ficha.entrega && (
                  <p className="text-xs text-zinc-400 mb-1">
                    Entrega: <span className="text-white font-semibold">{ficha.entrega.split("-").reverse().join("/")}</span>
                  </p>
                )}

                {ficha.vendedor && (
                  <p className="text-xs text-zinc-400 mb-2">
                    Vendedor: <span className="text-white font-semibold">{ficha.vendedor}</span>
                  </p>
                )}

                {ficha.pdfLink && (
                  <a
                    href={ficha.pdfLink}
                    target="_blank"
                    className="block bg-blue-800 hover:bg-blue-900 transition text-center rounded-xl p-2 text-xs font-bold"
                  >
                    📄 VER PDF
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center text-zinc-400">
              {busca
                ? "Nenhum cliente encontrado"
                : `Nenhum pedido em ${etapas.find((e) => e.id === abaAtiva)?.label}`}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-3 overflow-y-auto"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-zinc-900 rounded-3xl shadow-2xl p-5 mt-10 border border-zinc-800 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">NOVO PEDIDO</h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-zinc-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome do Cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none"
              />

              <input
                type="email"
                placeholder="Email, Tel ou Cód cliente"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none"
              />

              <select
                value={vendedor}
                onChange={(e) => setVendedor(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none text-white"
              >
                <option value="">Selecione o Vendedor</option>
                <option value="PALOMA">PALOMA</option>
                <option value="MIKELLY">MIKELLY</option>
                <option value="LARISSA">LARISSA</option>
                <option value="JEFFERSON">JEFFERSON</option>
                <option value="JANIELLY">JANIELLY</option>
                <option value="ROSE">ROSE</option>
                <option value="CÉSAR">CÉSAR</option>
                <option value="GRAÇA">GRAÇA</option>
                <option value="KELLY">KELLY</option>
              </select>

              <input
                type="text"
                placeholder="Observação"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none"
              />

              <select
                value={designer}
                onChange={(e) => setDesigner(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none text-white"
              >
                <option value="">Selecione o Designer</option>
                <option value="ALEXANDRE">ALEXANDRE</option>
                <option value="LÁZARO">LÁZARO</option>
                <option value="EDIVAN">EDIVAN</option>
                <option value="PAULÃO">PAULÃO</option>
                <option value="DIEGO">DIEGO</option>
              </select>

              <div>
                <label className="text-sm text-zinc-400">Data do Pedido</label>
                <input
                  type="date"
                  value={pedido}
                  onChange={(e) => setPedido(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">Data da Entrega *</label>
                <input
                  type="date"
                  value={entrega}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/-(\d{2})-/, (match, mes) => {
                      return mes === "00" ? "-01-" : match;
                    });
                    setEntrega(valor);
                  }}
                  className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none"
                />
              </div>

              <button
                onClick={salvarFicha}
                className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-2xl p-3 font-bold"
              >
                SALVAR
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Comercial() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black p-3 text-white"><p className="text-zinc-400 text-center mt-12">Carregando...</p></main>}>
      <ComercialContent />
    </Suspense>
  );
}
