"use client";

import { useEffect, useState } from "react";

import app from "../../firebase/config";

import { formatarDataHora } from "../lib/helpers";

import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const db = getFirestore(app);

type FiltroPedidos = "urgentes" | "atrasados" | "noPrazo" | "finalizados";

export default function Home() {

  const [busca, setBusca] = useState("");
  const [fichas, setFichas] = useState<any[]>([]);
  const [resumoPedidos, setResumoPedidos] = useState<any[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroPedidos | null>(null);
  const [editandoId, setEditandoId] = useState("");
  
  const [pedidosAbertos, setPedidosAbertos] = useState<string[]>([]);

  const [menuAberto, setMenuAberto] = useState(false);
const [designersAberto, setDesignersAberto] = useState(false);
const [vendedoresAberto, setVendedoresAberto] = useState(false);

const [editCliente, setEditCliente] = useState("");
const [editEmail, setEditEmail] = useState("");
const [editVendedor, setEditVendedor] = useState("");
const [editObservacao, setEditObservacao] = useState("");
const [editDesigner, setEditDesigner] = useState("");
const [editPedido, setEditPedido] = useState("");
const [editEntrega, setEditEntrega] = useState("");

 async function pesquisarFichas(nome: string) {

  if (!nome.trim()) {
    setFichas([]);
    return;
  }

  try {

    const fichasRef = collection(db, "fichas");

    const querySnapshot = await getDocs(fichasRef);

    const lista: any[] = [];

    querySnapshot.forEach((item) => {

      const dados = item.data();

      if (
        dados.cliente
          ?.toLowerCase()
          .includes(nome.toLowerCase())
      ) {

        lista.push({
          id: item.id,
          ...dados,
        });

      }

    });

    setFichas(lista);

  } catch (error) {

    console.log(error);

    alert("Erro ao pesquisar fichas");
  }
}

function categoriaDaFicha(ficha: any): FiltroPedidos {
  if (ficha.entregaStatus) {
    return "finalizados";
  }

  if (!ficha.entrega) {
    return "noPrazo";
  }

  const [ano, mes, dia] = ficha.entrega.split("-").map(Number);
  const hoje = new Date();
  const inicioDeHoje = Date.UTC(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );
  const dataDeEntrega = Date.UTC(ano, mes - 1, dia);
  const diasRestantes = Math.round(
    (dataDeEntrega - inicioDeHoje) / (1000 * 60 * 60 * 24)
  );

  if (diasRestantes < 0) {
    return "atrasados";
  }

  return diasRestantes <= 12 ? "urgentes" : "noPrazo";
}

function statusAtual(ficha: any) {
  if (ficha.entregaStatus) return "ENTREGUE";
  if (ficha.conferencia) return "CONFERIDO E EMBALADO";
  if (ficha.costuraConcluida) return "COSTURA CONCLUÍDA";
  if (ficha.costura) return "EM COSTURA";
  if (ficha.corte) return "CORTADO";
  if (ficha.prensa) return "NA PRENSA";
  if (ficha.impressao) return "IMPRESSO";
  if (ficha.exportacao) return "EXPORTADO";
  if (ficha.arte) return "ARTE CONCLUÍDA";
  if (ficha.venda) return "VENDA FEITA";

  return "AGUARDANDO VENDA";
}

async function carregarResumoPedidos() {
  try {
    const querySnapshot = await getDocs(collection(db, "fichas"));
    const lista: any[] = [];

    querySnapshot.forEach((item) => {
      lista.push({ id: item.id, ...item.data() });
    });

    setResumoPedidos(lista);
  } catch (error) {
    console.log(error);
  }
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

function selecionarFiltro(filtro: FiltroPedidos) {
  if (filtroAtivo === filtro) {
    setFiltroAtivo(null);
    setFichas([]);
    return;
  }

  setBusca("");
  setFichas(
    resumoPedidos.filter((ficha) => categoriaDaFicha(ficha) === filtro)
  );
  setPedidosAbertos([]);
  setFiltroAtivo(filtro);
}

  async function alterarStatus(
    id: string,
    campo: string,
    valorAtual: boolean
  ) {

    try {

      const fichaRef = doc(db, "fichas", id);

      const campoDataHora = campoData(campo);
      const atualizacao: any = { [campo]: !valorAtual };
      if (campoDataHora) {
        atualizacao[campoDataHora] = !valorAtual ? formatarDataHora() : "";
      }
      await updateDoc(fichaRef, atualizacao);

      setFichas((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, [campo]: !valorAtual, ...(campoDataHora ? { [campoDataHora]: atualizacao[campoDataHora] } : {}) }
            : item
        )
      );

      carregarResumoPedidos();

    } catch (error) {

      console.log(error);

      alert("Erro ao atualizar");
    }
  }

  async function salvarPdfLink(
    id: string,
    link: string
  ) {

    try {

      const fichaRef = doc(db, "fichas", id);

      await updateDoc(fichaRef, {
        pdfLink: link,
      });

      setFichas((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, pdfLink: link }
            : item
        )
      );

      alert("PDF salvo!");

    } catch (error) {

      console.log(error);

      alert("Erro ao salvar PDF");
    }
  }

  async function excluirFicha(id: string) {

    const confirmar = window.confirm(
      "Deseja mesmo excluir esta ficha?"
    );

    if (!confirmar) return;

    try {

      await deleteDoc(doc(db, "fichas", id));

      setFichas((prev) =>
        prev.filter((item) => item.id !== id)
      );

      alert("Ficha excluída com sucesso!");

    } catch (error) {

      console.log(error);

      alert("Erro ao excluir ficha");
    }
  }

  useEffect(() => {

    carregarResumoPedidos();

  }, []);
function iniciarEdicao(ficha: any) {
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

    await updateDoc(fichaRef, {
      cliente: editCliente,
      email: editEmail,
      vendedor: editVendedor,
      observacao: editObservacao,
      designer: editDesigner,
      pedido: editPedido,
      entrega: editEntrega,
    });

    setFichas((prev) =>
      prev.map((item) =>
        item.id === editandoId
          ? {
              ...item,
              cliente: editCliente,
              email: editEmail,
              vendedor: editVendedor,
              observacao: editObservacao,
              designer: editDesigner,
              pedido: editPedido,
              entrega: editEntrega,
            }
          : item
      )
    );

    setEditandoId("");

    alert("Alterações salvas!");

 } catch (error) {

  console.log(error);

  alert("Erro ao salvar alterações");
}
}

function alternarPedido(id: string) {

  if (pedidosAbertos.includes(id)) {

    setPedidosAbertos(
      pedidosAbertos.filter(
        (item) => item !== id
      )
    );

  } else {

    setPedidosAbertos([
      ...pedidosAbertos,
      id
    ]);

  }

}



function StatusToggle({
  label,
  ativo,
  data,
  onClick,
}: {
    label: string;
    ativo: boolean;
    data?: string;
    onClick: () => void;
  }) {
    return (

      <div className="flex items-center justify-between w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">

        <span className={`text-sm font-medium transition-all ${
          ativo
            ? "text-lime-400"
            : "text-white"
        }`}>
          {label}
        </span>

        {data && (
          <span className="text-sm text-white font-normal flex-shrink-0">
            {data}
          </span>
        )}

        <button
          onClick={onClick}
          role="switch"
          aria-checked={ativo}
          className="relative w-8 h-4 bg-zinc-700 rounded-full"
        >

          <div
            className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
              ativo
                ? "translate-x-4 bg-lime-400"
                : "translate-x-1 bg-red-500"
            }`}
          />

        </button>

      </div>
    );
  }

  const filtros = [
    { id: "urgentes" as const, label: "URGENTES", cor: "amber" },
    { id: "atrasados" as const, label: "ATRASADOS", cor: "red" },
    { id: "noPrazo" as const, label: "NO PRAZO", cor: "blue" },
    { id: "finalizados" as const, label: "FINALIZADOS", cor: "green" },
  ];

  const contagens = filtros.reduce(
    (total, filtro) => ({
      ...total,
      [filtro.id]: resumoPedidos.filter(
        (ficha) => categoriaDaFicha(ficha) === filtro.id
      ).length,
    }),
    {} as Record<FiltroPedidos, number>
  );

  return (

    <main
  className="min-h-screen bg-black p-3 text-white relative"
  onClick={() => {
    if (menuAberto) setMenuAberto(false);
    if (designersAberto) setDesignersAberto(false);
    if (vendedoresAberto) setVendedoresAberto(false);
  }}
>
   <button
    onClick={(e) => {
      e.stopPropagation();
      setMenuAberto(!menuAberto);
    }}
    className="fixed top-4 right-4 text-white text-2xl z-50"
  >
    ☰
  </button>

  {menuAberto && (
  <div
    onClick={(e) => e.stopPropagation()}
    className="fixed top-16 right-4 w-40 bg-zinc-700/90 text-white p-3 z-50 rounded-xl"
  >
    <h2 className="font-bold mb-4">
  SETORES
</h2>

<div className="space-y-3">

  <div className="relative">

  {vendedoresAberto && (
  <div
    onClick={(e) => e.stopPropagation()}
    className="absolute top-0 -left-40 w-40 bg-zinc-800/90 text-white p-4 rounded-xl shadow-xl z-50"
  >
    <h3 className="font-bold text-sm mb-4">
      VENDEDORES
    </h3>

    <div className="space-y-3 text-xs">

      <button
        onClick={() => {
          setMenuAberto(false);
          setVendedoresAberto(false);
          window.location.href = "/comercial?vendedor=PALOMA";
        }}
        className="block w-full text-left border-b border-zinc-600 pb-2"
      >
        ▸ PALOMA
      </button>

      <button
        onClick={() => {
          setMenuAberto(false);
          setVendedoresAberto(false);
          window.location.href = "/comercial?vendedor=MIKELLY";
        }}
        className="block w-full text-left border-b border-zinc-600 pb-2"
      >
        ▸ MIKELLY
      </button>

      <button
        onClick={() => {
          setMenuAberto(false);
          setVendedoresAberto(false);
          window.location.href = "/comercial?vendedor=LARISSA";
        }}
        className="block w-full text-left border-b border-zinc-600 pb-2"
      >
        ▸ LARISSA
      </button>

      <button
        onClick={() => {
          setMenuAberto(false);
          setVendedoresAberto(false);
          window.location.href = "/comercial?vendedor=JEFFERSON";
        }}
        className="block w-full text-left border-b border-zinc-600 pb-2"
      >
        ▸ JEFFERSON
      </button>

      <button
        onClick={() => {
          setMenuAberto(false);
          setVendedoresAberto(false);
          window.location.href = "/comercial?vendedor=JANIELLY";
        }}
        className="block w-full text-left border-b border-zinc-600 pb-2"
      >
        ▸ JANIELLY
      </button>

      <button
        onClick={() => {
          setMenuAberto(false);
          setVendedoresAberto(false);
          window.location.href = "/comercial?vendedor=ROSE";
        }}
        className="block w-full text-left border-b border-zinc-600 pb-2"
      >
        ▸ ROSE
      </button>

      <button
        onClick={() => {
          setMenuAberto(false);
          setVendedoresAberto(false);
          window.location.href = "/comercial?vendedor=CÉSAR";
        }}
        className="block w-full text-left border-b border-zinc-600 pb-2"
      >
        ▸ CÉSAR
      </button>

      <button
        onClick={() => {
          setMenuAberto(false);
          setVendedoresAberto(false);
          window.location.href = "/comercial?vendedor=GRAÇA";
        }}
        className="block w-full text-left border-b border-zinc-600 pb-2"
      >
        ▸ GRAÇA
      </button>

      <button
        onClick={() => {
          setMenuAberto(false);
          setVendedoresAberto(false);
          window.location.href = "/comercial?vendedor=KELLY";
        }}
        className="block w-full text-left"
      >
        ▸ KELLY
      </button>

    </div>
  </div>
)}

<button
  onClick={() => setVendedoresAberto(!vendedoresAberto)}
  className="w-full text-left py-2 border-b border-zinc-600 text-xs"
>
  {vendedoresAberto ? "▾ COMERCIAL" : "▸ COMERCIAL"}
</button>

</div>

  <div>

  {designersAberto && (
  <div
    onClick={(e) => e.stopPropagation()}
    className="absolute top-0 -left-40 w-40 bg-zinc-800/90 text-white p-4 rounded-xl shadow-xl"
  >
    <h3 className="font-bold text-sm mb-4">
      DESIGNERS
    </h3>

    <div className="space-y-3 text-xs">

      <button
        onClick={() => {
          setMenuAberto(false);
          setDesignersAberto(false);
          window.location.href = "/arte?designer=LAZARO";
        }}
        className="block w-full text-left border-b border-zinc-600 pb-2"
      >
        ▸ LÁZARO
      </button>

      <button
        onClick={() => {
          setMenuAberto(false);
          setDesignersAberto(false);
          window.location.href = "/arte?designer=EDIVAN";
        }}
        className="block w-full text-left border-b border-zinc-600 pb-2"
      >
        ▸ EDIVAN
      </button>

      <button
        onClick={() => {
          setMenuAberto(false);
          setDesignersAberto(false);
          window.location.href = "/arte?designer=ALEXANDRE";
        }}
        className="block w-full text-left border-b border-zinc-600 pb-2"
      >
        ▸ ALEXANDRE
      </button>

      <button
        onClick={() => {
          setMenuAberto(false);
          setDesignersAberto(false);
          window.location.href = "/arte?designer=PAULAO";
        }}
        className="block w-full text-left"
      >
        ▸ PAULÃO
      </button>

    </div>
  </div>
)}

<button
  onClick={() => setDesignersAberto(!designersAberto)}
  className="w-full text-left py-2 border-b border-zinc-600 text-xs"
>
  {designersAberto ? "▾ DESIGNERS" : "▸ DESIGNERS"}
</button>

</div>

  <button
    onClick={() => {
      setMenuAberto(false);
      window.location.href = "/impressao";
    }}
    className="w-full text-left py-2 border-b border-zinc-600 text-xs"
  >
    ▸ IMPRESSÃO
  </button>

  <button
    onClick={() => {
      setMenuAberto(false);
      window.location.href = "/prensa";
    }}
    className="w-full text-left py-2 border-b border-zinc-600 text-xs"
  >
    ▸ PRENSA
  </button>

  <button
    onClick={() => {
      setMenuAberto(false);
      window.location.href = "/corte";
    }}
    className="w-full text-left py-2 border-b border-zinc-600 text-xs"
  >
    ▸ CORTE
  </button>

  <button
    onClick={() => {
      setMenuAberto(false);
      window.location.href = "/costura";
    }}
    className="w-full text-left py-2 border-b border-zinc-600 text-xs"
  >
    ▸ COSTURA
  </button>

  <button
    onClick={() => {
      setMenuAberto(false);
      window.location.href = "/conferencia";
    }}
    className="w-full text-left py-2 border-b border-zinc-600 text-xs"
  >
    ▸ CONFERÊNCIA
  </button>

  <button
    onClick={() => {
      setMenuAberto(false);
      window.location.href = "/envio";
    }}
    className="w-full text-left py-2 border-b border-zinc-600 text-xs"
  >
    ▸ ENVIO
  </button>

   <button
    onClick={() => {
      setMenuAberto(false);
      window.location.href = "/adm";
    }}
    className="w-full text-left py-2 border-b border-zinc-600 text-xs"
  >
    ▸ ADMINISTRAÇÃO
  </button>

</div>

</div>
)}

  <div className="max-w-md mx-auto">

  </div>

      <div className="max-w-md mx-auto">

        <div className="flex items-center justify-between mt-12 mb-3 px-1">
          <h1 className="text-xl font-bold text-white">PEDIDOS</h1>
          <button
            onClick={() => window.location.href = "/comercial"}
            className="bg-blue-600 hover:bg-blue-700 transition rounded-full px-4 py-2 text-sm font-bold text-white"
          >
            + Novo
          </button>
        </div>

        {/* PESQUISA */}
        <div className="bg-zinc-900 rounded-3xl shadow-2xl p-4 mb-5 border border-zinc-800">

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={filtroAtivo ? `🔎 Filtro: ${filtros.find(f => f.id === filtroAtivo)?.label}` : "🔎 Pesquisar Cliente"}
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setFiltroAtivo(null);
                pesquisarFichas(e.target.value);
              }}
              className={`flex-1 bg-black border rounded-2xl p-3 text-sm text-white placeholder-zinc-500 outline-none ${
                filtroAtivo
                  ? "border-blue-500 placeholder-blue-300"
                  : "border-zinc-700"
              }`}
            />

            <button
              onClick={() => {
                carregarResumoPedidos();
                setBusca("");
                setFiltroAtivo(null);
                setFichas([]);
              }}
              className="bg-zinc-800 hover:bg-zinc-700 transition rounded-2xl px-3 text-white text-lg flex-shrink-0"
              title="Atualizar pedidos"
            >
              ↻
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {filtros.map((filtro) => {
              const ativo = filtroAtivo === filtro.id;
              const estilo = {
                amber: ativo
                  ? "bg-amber-400 text-black"
                  : "bg-amber-600 text-white hover:bg-amber-500",
                red: ativo
                  ? "bg-red-400 text-black"
                  : "bg-red-700 text-white hover:bg-red-600",
                blue: ativo
                  ? "bg-blue-400 text-black"
                  : "bg-blue-700 text-white hover:bg-blue-600",
                green: ativo
                  ? "bg-green-400 text-black"
                  : "bg-green-700 text-white hover:bg-green-600",
              }[filtro.cor];

              return (
                <button
                  key={filtro.id}
                  onClick={() => selecionarFiltro(filtro.id)}
                  aria-pressed={ativo}
                  className={`rounded-full px-3 py-2 text-xs font-bold transition ${estilo}`}
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

            {fichas.length > 0 ? (

              fichas.map((ficha) => (

                <div
                  key={ficha.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 shadow-xl"
                >

  {/* TOPO */}
<div className="mb-5">

  {/* NOME + LIXEIRA */}
  <div className="flex justify-between items-start gap-3 mb-3">

  {editandoId === ficha.id ? (

  <input
    type="text"
    value={editCliente}
    onChange={(e) => setEditCliente(e.target.value)}
    className="flex-1 bg-black border border-zinc-700 rounded-xl p-2 text-white"
  />

) : (

  <p className="text-2xl font-bold break-words leading-tight flex-1 uppercase">
    {ficha.cliente}
  </p>

)}
  <div className="flex gap-2">

    <button
      onClick={() => iniciarEdicao(ficha)}
      className="text-white hover:text-blue-500 transition flex-shrink-0"
      title="Editar ficha"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L12 14l-4 1 1-4 7.5-7.5z"
        />
      </svg>
    </button>

    <button
      onClick={() => excluirFicha(ficha.id)}
      className="text-white hover:text-red-500 transition flex-shrink-0"
      title="Excluir ficha"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"
        />
      </svg>
    </button>

  </div>

</div>

  {/* DATAS */}
  <div className="grid grid-cols-2 gap-4 mb-4">

    <div>
      <p className="text-zinc-400 text-sm">
        Pedido:
      </p>

     {editandoId === ficha.id ? (

  <input
    type="date"
    value={editPedido}
    onChange={(e) => setEditPedido(e.target.value)}
    className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-white"
  />

) : (

  <p className="text-base font-semibold">
    {ficha.pedido
      ? ficha.pedido.split("-").reverse().join("/")
      : "-"}
  </p>

)}
    </div>

    <div>
      <p className="text-zinc-400 text-sm">
        Entrega:
      </p>

      <p className="text-base font-semibold">
  {ficha.entrega
    ? ficha.entrega.split("-").reverse().join("/")
    : "-"}
</p>
    </div>

  </div>
  
  <button
  onClick={() => alternarPedido(ficha.id)}
  className="w-full bg-blue-800 hover:bg-blue-900 transition rounded-full py-3 mb-4 font-medium"
  aria-expanded={pedidosAbertos.includes(ficha.id)}
  aria-controls={`detalhes-${ficha.id}`}
>
  {pedidosAbertos.includes(ficha.id)
    ? "RECOLHER"
    : "VISUALIZAR"}
</button>

<p className="mb-4 text-center text-xs font-semibold text-zinc-400">
  STATUS ATUAL: <span className="text-lime-400">{statusAtual(ficha)}</span>
</p>

{pedidosAbertos.includes(ficha.id) && (
<div id={`detalhes-${ficha.id}`} className="animate-[slideDown_0.25s_ease-out]">

{/* IDENTIFICAÇÃO DO CLIENTE */}
<div className="mb-4">

  <p className="text-zinc-400 text-sm">
    Email, Tel ou Cód. Cliente:
  </p>

  <p className="text-sm break-words font-medium">
    {ficha.email || "-"}
  </p>

</div>

{editandoId === ficha.id && (

  <div className="flex gap-2 mt-4">

    <button
      onClick={salvarEdicao}
      className="bg-green-600 px-4 py-2 rounded-xl text-sm font-bold"
    >
      💾 SALVAR
    </button>

    <button
      onClick={() => setEditandoId("")}
      className="bg-red-600 px-4 py-2 rounded-xl text-sm font-bold"
    >
      ❌ CANCELAR
    </button>

  </div>

)}
  {/* OBSERVAÇÃO */}
  <div className="mb-4">

    <p className="text-zinc-400 text-sm">
      Observação:
    </p>

    <p className="text-sm break-words">
      {ficha.observacao || "-"}
    </p>

  </div>

  {/* VENDEDOR + DESIGNER */}
  <div className="grid grid-cols-2 gap-4">

    <div>
      <p className="text-zinc-400 text-sm">
        Vendedor:git add .
      </p>

      <p className="text-lg font-bold break-words uppercase">
        {ficha.vendedor || "-"}
      </p>
    </div>

    <div>
      <p className="text-zinc-400 text-sm">
        Designer:
      </p>

      <p className="text-lg font-bold break-words">
        {ficha.designer || "-"}
      </p>
    </div>

  </div>

</div>
)}

</div>

                  {/* STATUS */}
                  {/* STATUS */}
{pedidosAbertos.includes(ficha.id) && (
<div className="flex flex-col gap-2">

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

    const porcentagem = Math.round(
      (concluidas / etapas.length) * 100
    );

    return (

      <div className="mb-2">

        <div className="relative w-full h-8 bg-black border-2 border-blue-700 rounded-full overflow-hidden shadow-[0_0_10px_rgba(37,99,235,0.5)]">

          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${porcentagem}%`,
              background:
                "linear-gradient(to right, #f59e0b, #fde047)",
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
            {porcentagem}%
          </div>

        </div>

      </div>

    );

  })()}

                    <div className="space-y-2">

                      <StatusToggle
                        label={ficha.venda ? "VENDA FEITA" : "VENDA"}
                        ativo={ficha.venda}
                        data={ficha.vendaData}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "venda",
                            ficha.venda
                          )
                        }
                      />

                      <StatusToggle
                        label={ficha.arte ? "ARTE CONCLUÍDA" : "ARTE"}
                        ativo={ficha.arte}
                        data={ficha.arteData}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "arte",
                            ficha.arte
                          )
                        }
                      />

                      <div className="space-y-2">

                        <StatusToggle
                          label={ficha.exportacao ? "EXPORTADO" : "EXPORTANDO"}
                          ativo={ficha.exportacao}
                          data={ficha.exportacaoData}
                          onClick={() =>
                            alterarStatus(
                              ficha.id,
                              "exportacao",
                              ficha.exportacao
                            )
                          }
                        />

                        {ficha.exportacao && (

                          <div className="ml-4 pl-3 border-l border-zinc-700 space-y-3">

                            <input
                              type="text"
                              placeholder="Cole aqui o link do PDF"
                              defaultValue={ficha.pdfLink || ""}
                              onBlur={(e) =>
                                salvarPdfLink(
                                  ficha.id,
                                  e.target.value
                                )
                              }
                              className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm outline-none"
                            />

                            {ficha.pdfLink && (

                              <a
                                href={ficha.pdfLink}
                                target="_blank"
                                className="block bg-green-600 hover:bg-green-700 transition text-center rounded-xl p-3 text-sm font-bold"
                              >
                                VER PDF
                              </a>

                            )}

                          </div>

                        )}

                      </div>

                      <StatusToggle
                        label={ficha.impressao ? "IMPRESSO" : "IMPRESSÃO"}
                        ativo={ficha.impressao}
                        data={ficha.impressaoData}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "impressao",
                            ficha.impressao
                          )
                        }
                      />

                    </div>

                    <div className="space-y-2">

                      <StatusToggle
                        label={ficha.prensa ? "PRENSAGEM CONCLUÍDA" : "NA PRENSA"}
                        ativo={ficha.prensa}
                        data={ficha.prensaData}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "prensa",
                            ficha.prensa
                          )
                        }
                      />

                      <StatusToggle
                        label={ficha.corte ? "CORTADO" : "CORTE"}
                        ativo={ficha.corte}
                        data={ficha.corteData}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "corte",
                            ficha.corte
                          )
                        }
                      />

                      <div className="space-y-2">

                        <StatusToggle
                          label={ficha.costura ? "ENVIADO P/ COSTUREIRO(A)" : "COSTURA"}
                          ativo={ficha.costura}
                          data={ficha.costuraData}
                          onClick={() =>
                            alterarStatus(
                              ficha.id,
                              "costura",
                              ficha.costura
                            )
                          }
                        />

                        {ficha.costura && (

                          <div className="ml-4 pl-3 border-l border-zinc-700 space-y-2">

                            <StatusToggle
                              label="PAULO"
                              ativo={ficha.costureiroPaulo}
                              onClick={() =>
                                alterarStatus(
                                  ficha.id,
                                  "costureiroPaulo",
                                  ficha.costureiroPaulo
                                )
                              }
                            />

                           <StatusToggle
  label="CELINA"
  ativo={ficha.costureiroCelina}
  onClick={() =>
    alterarStatus(
      ficha.id,
      "costureiroCelina",
      ficha.costureiroCelina
    )
  }
/>

{(ficha.costureiroPaulo || ficha.costureiroCelina) && (
  <StatusToggle
    label={
      ficha.costuraConcluida
        ? "COSTURA CONCLUÍDA"
        : "AGUARDANDO COSTURA"
    }
    ativo={ficha.costuraConcluida}
    onClick={() =>
      alterarStatus(
        ficha.id,
        "costuraConcluida",
        ficha.costuraConcluida
      )
    }
  />
)}

</div>

                        )}

                      </div>

                      <StatusToggle
                        label={
                          ficha.conferencia
                            ? "CONFERIDO E EMBALADO"
                            : "CONFERÊNCIA/RECEPÇÃO"
                        }
                        ativo={ficha.conferencia}
                        data={ficha.conferenciaData}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "conferencia",
                            ficha.conferencia
                          )
                        }
                      />

                      <div className="space-y-2">

                        <StatusToggle
                          label={ficha.entregaStatus ? "ENTREGUE" : "ENTREGA"}
                          ativo={ficha.entregaStatus}
                          data={ficha.entregaData}
                          onClick={() =>
                            alterarStatus(
                              ficha.id,
                              "entregaStatus",
                              ficha.entregaStatus
                            )
                          }
                        />

                        {ficha.entregaStatus && (

                          <div className="ml-4 pl-3 border-l border-zinc-700 space-y-2">

                            <StatusToggle
                              label="ENVIO"
                              ativo={ficha.envio}
                              onClick={() =>
                                alterarStatus(
                                  ficha.id,
                                  "envio",
                                  ficha.envio
                                )
                              }
                            />

                            <StatusToggle
                              label="RETIRADA"
                              ativo={ficha.retirada}
                              onClick={() =>
                                alterarStatus(
                                  ficha.id,
                                  "retirada",
                                  ficha.retirada
                                )
                              }
                            />

                          </div>

                        )}

                      </div>

                    </div>

                  </div>

                )}

                </div>

              ))

            ) : (

              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 text-center text-zinc-400">
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
