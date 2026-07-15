"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import app from "../../firebase/config";

import { addDoc, collection, getFirestore, getDocs } from "firebase/firestore";

import {
  formatarDataHora,
  etapaDaFicha,
  ETAPAS,
  VENDEDORES,
  DESIGNERS,
  type Ficha,
  type Etapa,
} from "../lib/helpers";

const db = getFirestore(app);

function ComercialContent() {
  const searchParams = useSearchParams();
  const vendedorParam = searchParams.get("vendedor") || "";

  const [modalAberto, setModalAberto] = useState(false);
  const [pedidos, setPedidos] = useState<Ficha[]>([]);
  const [carregando, setCarregando] = useState(true);
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
      const lista: Ficha[] = [];
      snapshot.forEach((item) => {
        const dados = item.data() as Ficha;
        if (dados.venda) {
          lista.push({ id: item.id, ...dados });
        }
      });
      setPedidos(lista);
    } catch (error) {
      console.log(error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && modalAberto) {
        setModalAberto(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalAberto]);

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
    const matchBusca =
      !termo || (ficha.cliente || "").toLowerCase().includes(termo);
    const matchEtapa = etapaDaFicha(ficha) === abaAtiva;
    return matchBusca && matchEtapa;
  });

  const contagens = ETAPAS.reduce(
    (total, etapa) => ({
      ...total,
      [etapa.id]: pedidosDoVendedor.filter(
        (ficha) => etapaDaFicha(ficha) === etapa.id
      ).length,
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
        <div className="bg-zinc-900 rounded-2xl p-3 mb-4 border border-zinc-800 relative">
          <input
            type="text"
            placeholder="🔎 Pesquisar Cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-xl p-3 pr-10 text-sm text-white placeholder-zinc-500 outline-none"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-sm"
              title="Limpar busca"
            >
              ✕
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
                className={`rounded-xl py-2.5 text-[10px] font-bold transition text-center ${
                  ativo ? etapa.ativo : etapa.inativo
                }`}
              >
                {etapa.label}
                <span className="block text-xs mt-0.5">
                  ({contagens[etapa.id]})
                </span>
              </button>
            );
          })}
        </div>

        {/* LISTA */}
        <div className="space-y-3">
          {carregando ? (
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center text-zinc-400">
              Carregando pedidos...
            </div>
          ) : pedidosFiltrados.length > 0 ? (
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
                    Pedido:{" "}
                    <span className="text-white font-semibold">
                      {ficha.pedido.split("-").reverse().join("/")}
                    </span>
                  </p>
                )}

                {ficha.entrega && (
                  <p className="text-xs text-zinc-400 mb-1">
                    Entrega:{" "}
                    <span className="text-white font-semibold">
                      {ficha.entrega.split("-").reverse().join("/")}
                    </span>
                  </p>
                )}

                {ficha.vendedor && (
                  <p className="text-xs text-zinc-400 mb-2">
                    Vendedor:{" "}
                    <span className="text-white font-semibold">
                      {ficha.vendedor}
                    </span>
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
                : `Nenhum pedido em ${ETAPAS.find((e) => e.id === abaAtiva)?.label}`}
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
                className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none"
              />

              <select
                value={designer}
                onChange={(e) => setDesigner(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none text-white"
              >
                <option value="">Selecione o Designer</option>
                {DESIGNERS.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
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
    <Suspense
      fallback={
        <main className="min-h-screen bg-black p-3 text-white">
          <p className="text-zinc-400 text-center mt-12">Carregando...</p>
        </main>
      }
    >
      <ComercialContent />
    </Suspense>
  );
}
