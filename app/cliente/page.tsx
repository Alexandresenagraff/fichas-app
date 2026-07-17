"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import app from "../../firebase/config";

import {
  getFirestore,
  collection,
  getDocs,
} from "firebase/firestore";

const db = getFirestore(app);

export default function Cliente() {

  const router = useRouter();
  const [email, setEmail] = useState("");
const [pedidos, setPedidos] = useState<any[]>([]);
const [pedidoAberto, setPedidoAberto] = useState<number | null>(null);

  async function buscarPedido() {

  if (!email.trim()) {
    setPedidos([]);
    alert("Digite seu e-mail, telefone ou código.");
    return;
  }

  try {

    const snapshot = await getDocs(
      collection(db, "fichas")
    );

    const encontrados: any[] = [];

    snapshot.forEach((doc) => {

      const dados = doc.data();

      if (
        dados.email?.toLowerCase() ===
        email.toLowerCase()
      ) {
        encontrados.push(dados);
      }

    });

    setPedidos(encontrados);

    if (encontrados.length > 0) {
      localStorage.setItem(
        "clienteEmail",
        email
      );
    }

  } catch (error) {

    console.log(error);

  }
}

function calcularPorcentagem(pedido: any) {

  const etapas = [
    pedido.venda,
    pedido.arte,
    pedido.exportacao,
    pedido.impressao,
    pedido.prensa,
    pedido.corte,
    pedido.costuraConcluida,
    pedido.conferencia,
    pedido.entregaStatus,
  ];

  const concluidas = etapas.filter(Boolean).length;

  return Math.round(
    (concluidas / etapas.length) * 100
  );
}
useEffect(() => {

  const emailSalvo =
    localStorage.getItem("clienteEmail");

  if (emailSalvo) {
    setEmail(emailSalvo);
  }

}, []);



return (
    <main className="min-h-screen bg-white text-black">

      <div className="w-full max-w-2xl mx-auto">

        <div className="bg-gradient-to-br from-blue-900 to-blue-800 px-4 py-8 relative shadow-lg header-shine">

  <button
    onClick={() => router.push("/")}
    className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white text-lg"
  >
    ←
  </button>

  <h2 className="text-center text-xl sm:text-2xl font-bold mb-4 px-2 tracking-wide">
    Acompanhe seu Pedido
  </h2>

  <p className="text-center text-blue-200 text-sm mb-5">
    Digite seu código, e-mail ou telefone para consultar
  </p>

  <div className="flex items-center bg-white rounded-full px-5 py-3 mb-5 shadow-md">

    <span className="text-zinc-400 text-xl mr-3">
      🔍
    </span>

    <input
      type="text"
      placeholder="Digite seu código"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full bg-transparent text-black text-lg outline-none placeholder-zinc-400"
    />

  </div>

  <button
    onClick={buscarPedido}
    className="relative overflow-hidden block mx-auto bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 text-white font-bold px-10 py-3 rounded-2xl transition shadow-lg"
  >
    <span className="relative z-10">CONSULTAR</span>
    <span className="shine"></span>
  </button>

</div>

          {pedidos.length > 0 && (

          <div className="mt-8 px-4 sm:px-6 space-y-6 pb-12">
  {pedidos.map((pedido, index) => (
    <div
      key={index}
      className="bg-white border border-zinc-300 rounded-2xl p-5 sm:p-6 shadow-md overflow-hidden"
    >

           <h2 className="text-lg sm:text-xl font-bold mb-2 text-black break-words text-center">
   {pedido.cliente} - Pedido {index + 1}
</h2>

<div className="mb-2 text-xs sm:text-sm text-zinc-700 break-words">

  <p>
    <strong>Pedido:</strong> {pedido.pedido ? pedido.pedido.split("-").reverse().join("/") : "-"}
  </p>

  <p>
    <strong>Entrega prevista:</strong> {pedido.entrega ? pedido.entrega.split("-").reverse().join("/") : "-"}
  </p>

</div>
<button
  onClick={() =>
    setPedidoAberto(
      pedidoAberto === index ? null : index
    )
  }
  className="relative overflow-hidden w-full bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] text-white font-bold rounded-full py-3 mt-2 mb-3 transition shadow-md"
>
  <span className="relative z-10">
    {pedidoAberto === index ? "RECOLHER" : "VISUALIZAR"}
  </span>
  <span className="shine"></span>
</button>
{pedidoAberto === index && (
<>

<div className="w-full bg-zinc-800 rounded-full h-8 overflow-hidden mb-6">

  <div
    className="h-full flex items-center justify-center font-bold text-white transition-all duration-500"
    style={{
      width: `${calcularPorcentagem(pedido)}%`,
      background:
        "linear-gradient(90deg, #eab308 0%, #22c55e 100%)",
   }}
  >
    {calcularPorcentagem(pedido)}%
  </div>

</div>

<div className="space-y-3 text-sm sm:text-base">

  <div className={`flex items-center gap-3 rounded-xl border-l-4 px-4 py-3.5 shadow-sm ${
    pedido.venda ? "border-lime-500 bg-lime-50" : "border-zinc-300 bg-zinc-50"
  }`}>
    <span className="text-lg">{pedido.venda ? "✅" : "⚪"}</span>
    <span className={`font-medium ${pedido.venda ? "text-lime-700" : "text-zinc-500"}`}>COMPRA REALIZADA</span>
  </div>

  <div className={`flex items-center gap-3 rounded-xl border-l-4 px-4 py-3.5 shadow-sm ${
    pedido.arte ? "border-lime-500 bg-lime-50" : "border-zinc-300 bg-zinc-50"
  }`}>
    <span className="text-lg">{pedido.arte ? "✅" : "⚪"}</span>
    <span className={`font-medium ${pedido.arte ? "text-lime-700" : "text-zinc-500"}`}>ARTE APROVADA</span>
  </div>

  <div className={`flex items-center gap-3 rounded-xl border-l-4 px-4 py-3.5 shadow-sm ${
    pedido.exportacao ? "border-lime-500 bg-lime-50" : "border-zinc-300 bg-zinc-50"
  }`}>
    <span className="text-lg">{pedido.exportacao ? "✅" : "⚪"}</span>
    <span className={`font-medium ${pedido.exportacao ? "text-lime-700" : "text-zinc-500"}`}>APLICADO NO MOLDE</span>
  </div>

  <div className={`flex items-center gap-3 rounded-xl border-l-4 px-4 py-3.5 shadow-sm ${
    pedido.impressao ? "border-lime-500 bg-lime-50" : "border-zinc-300 bg-zinc-50"
  }`}>
    <span className="text-lg">{pedido.impressao ? "✅" : "⚪"}</span>
    <span className={`font-medium ${pedido.impressao ? "text-lime-700" : "text-zinc-500"}`}>IMPRESSO</span>
  </div>

  <div className={`flex items-center gap-3 rounded-xl border-l-4 px-4 py-3.5 shadow-sm ${
    pedido.prensa ? "border-lime-500 bg-lime-50" : "border-zinc-300 bg-zinc-50"
  }`}>
    <span className="text-lg">{pedido.prensa ? "✅" : "⚪"}</span>
    <span className={`font-medium ${pedido.prensa ? "text-lime-700" : "text-zinc-500"}`}>PRENSAGEM CONCLUÍDA</span>
  </div>

  <div className={`flex items-center gap-3 rounded-xl border-l-4 px-4 py-3.5 shadow-sm ${
    pedido.corte ? "border-lime-500 bg-lime-50" : "border-zinc-300 bg-zinc-50"
  }`}>
    <span className="text-lg">{pedido.corte ? "✅" : "⚪"}</span>
    <span className={`font-medium ${pedido.corte ? "text-lime-700" : "text-zinc-500"}`}>CORTE CONCLUÍDO</span>
  </div>

  <div className={`flex items-center gap-3 rounded-xl border-l-4 px-4 py-3.5 shadow-sm ${
    pedido.costuraConcluida ? "border-lime-500 bg-lime-50" : "border-zinc-300 bg-zinc-50"
  }`}>
    <span className="text-lg">{pedido.costuraConcluida ? "✅" : "⚪"}</span>
    <span className={`font-medium ${pedido.costuraConcluida ? "text-lime-700" : "text-zinc-500"}`}>COSTURA CONCLUÍDA</span>
  </div>

  <div className={`flex items-center gap-3 rounded-xl border-l-4 px-4 py-3.5 shadow-sm ${
    pedido.conferencia ? "border-lime-500 bg-lime-50" : "border-zinc-300 bg-zinc-50"
  }`}>
    <span className="text-lg">{pedido.conferencia ? "✅" : "⚪"}</span>
    <span className={`font-medium ${pedido.conferencia ? "text-lime-700" : "text-zinc-500"}`}>CONFERIDO</span>
  </div>

  <div className={`flex items-center gap-3 rounded-xl border-l-4 px-4 py-3.5 shadow-sm ${
    pedido.entregaStatus ? "border-lime-500 bg-lime-50" : "border-zinc-300 bg-zinc-50"
  }`}>
    <span className="text-lg">{pedido.entregaStatus ? "✅" : "⚪"}</span>
    <span className={`font-medium ${pedido.entregaStatus ? "text-lime-700" : "text-zinc-500"}`}>PEDIDO DESPACHADO</span>
  </div>

</div>

{pedido.pdfLink && (
  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center shadow-sm">
    <a
      href={pedido.pdfLink}
      target="_blank"
      className="inline-flex items-center gap-2 text-blue-700 font-bold hover:text-blue-800 transition text-sm sm:text-base"
    >
      📄 VISUALIZAR MOLDE (PDF)
    </a>
  </div>
)}

</>
)}

</div>

))}

          </div>

        )}

      </div>

    </main>
  );
}