"use client";

import { useState, useEffect } from "react";

import app from "../../firebase/config";

import {
  getFirestore,
  collection,
  getDocs,
} from "firebase/firestore";

const db = getFirestore(app);

export default function Cliente() {

  const [email, setEmail] = useState("");
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

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

  console.log("EMAIL SALVO:", emailSalvo);

  if (emailSalvo) {
    setEmail(emailSalvo);
  }

}, []);

useEffect(() => {

  const emailSalvo =
    localStorage.getItem("clienteEmail");

  if (emailSalvo) {
    setEmail(emailSalvo);
  }

}, []);



return (
    <main className="min-h-screen bg-zinc-100 text-white">

      <div className="w-full">

        <div className="bg-blue-900 px-4 py-8">

  <h2 className="text-center text-lg font-medium mb-1">
    Veja aqui o Status do seu Pedido!
  </h2>

  <div className="flex items-center bg-white rounded-full px-4 py-3 mb-4">

    <span className="text-black text-xl mr-3">
      🔍
    </span>

    <input
      type="text"
      placeholder="Digite seu código"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full bg-transparent text-black outline-none"
    />

  </div>

  <button
    onClick={buscarPedido}
    className="block mx-auto bg-blue-700 hover:bg-blue-800 px-8 py-2 rounded-xl font-medium"
  >
    CONSULTAR
  </button>

</div>

          {pedidos.length > 0 && (

          <div className="mt-8 space-y-6">
  {pedidos.map((pedido, index) => (
    <div
      key={index}
      className="bg-white border border-zinc-300 rounded-2xl p-4 shadow-md"
    >

           <h2 className="text-xl font-bold mb-4 text-black">
   {pedido.cliente} - Pedido {index + 1}
</h2>
<div className="mb-4 text-sm text-zinc-700">

  <p>
    <strong>Pedido:</strong> {pedido.pedido ? pedido.pedido.split("-").reverse().join("/") : "-"}
  </p>

  <p>
    <strong>Entrega prevista:</strong> {pedido.entrega ? pedido.entrega.split("-").reverse().join("/") : "-"}
  </p>

</div>

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

            <div className="space-y-2 text-sm">

  <p className="border border-zinc-700 rounded-xl p-2">
  {pedido.venda
    ? "✅ COMPRA REALIZADA"
    : "🟡 COMPRA - Aguarde..."}
</p>

<p className="border border-zinc-700 rounded-xl p-2">
  {pedido.arte
    ? "✅ ARTE APROVADA"
    : "🟡 TRABALHANDO NO LAYOUT - Aguarde..."}
</p>

<p className="border border-zinc-700 rounded-xl p-2">
  {pedido.exportacao
    ? "✅ APLICADO NO MOLDE"
    : "🟡 APLICANDO NOS MOLDES - Aguarde..."}
</p>

<p className="border border-zinc-700 rounded-xl p-2">
  {pedido.impressao
    ? "✅ IMPRESSO"
    : "🟡 IMPRIMINDO - Aguarde..."}
</p>

<p className="border border-zinc-700 rounded-xl p-2">
  {pedido.prensa
    ? "✅ PRENSAGEM CONCLUÍDA"
    : "🟡 PRENSAGEM - Aguarde..."}
</p>

<p className="border border-zinc-700 rounded-xl p-2">
  {pedido.corte
    ? "✅ CORTE CONCLUÍDO"
    : "🟡 CORTANDO - Aguarde..."}
</p>

<p className="border border-zinc-700 rounded-xl p-2">
  {pedido.costuraConcluida
    ? "✅ COSTURA CONCLUÍDA"
    : "🟡 COSTURANDO - Aguarde..."}
</p>

<p className="border border-zinc-700 rounded-xl p-2">
  {pedido.conferencia
    ? "✅ CONFERIDO"
    : "🟡 CONFERINDO O PEDIDO - Aguarde..."}
</p>

<p className="border border-zinc-700 rounded-xl p-2">
  {pedido.entregaStatus
    ? "✅ PEDIDO DESPACHADO"
    : "🟡 EMBALANDO - Aguarde..."}
</p>

</div>

          </div>

        ))}

      </div>

        )}

      </div>

    </main>
  );
}