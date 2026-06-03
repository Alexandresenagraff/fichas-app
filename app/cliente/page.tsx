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
      if (encontrados.length === 0) {
        
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
    pedido.costura,
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
    <main className="min-h-screen bg-black text-white p-6">

      <div className="max-w-md mx-auto bg-zinc-900 rounded-3xl p-6 border border-zinc-800">

        <h1 className="text-3xl font-bold text-center mb-2">
          Área do Cliente
        </h1>

        <p className="text-center text-zinc-400 mb-6">
          Consulte seu pedido
        </p>

        <input
          type="text"
          placeholder="Seu e-mail, telefone ou código"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full bg-black border border-zinc-700 rounded-2xl p-3 mb-4"
        />

        <button
          onClick={buscarPedido}
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-2xl p-3 font-bold"
        >
          CONSULTAR
        </button>

        {pedidos.length > 0 && (

          <div className="mt-8 space-y-6">
  {pedidos.map((pedido, index) => (
    <div
      key={index}
      className="border border-zinc-700 rounded-2xl p-4"
    >

           <h2 className="text-xl font-bold mb-4">
   {pedido.cliente} - Pedido {index + 1}
</h2>
<div className="mb-4 text-sm text-zinc-300">

  <p>
    <strong>Pedido:</strong> {pedido.pedido ? pedido.pedido.split("-").reverse().join("/") : "-"}
  </p>

  <p>
    <strong>Entrega prevista:</strong> {pedido.entrega ? pedido.entrega.split("-").reverse().join("/") : "-"}
  </p>

</div>

            <div className="w-full bg-zinc-800 rounded-full h-8 overflow-hidden mb-6">

              <div
                className="bg-yellow-500 h-full"
                style={{
                  width: `${calcularPorcentagem(pedido)}%`,
                }}
              />

            </div>

            <p className="mb-4 font-bold">
              {calcularPorcentagem(pedido)}% concluído
            </p>

            <div className="space-y-2 text-sm">

  <p>{pedido.venda ? "✅" : "⬜"} VENDA CONCLUIDA</p>

  <p>{pedido.arte ? "✅" : "⬜"} ARTE APROVADA</p>

  <p>{pedido.exportacao ? "✅" : "⬜"} APLICAÇÃO NO MOLDE</p>

  <p>{pedido.impressao ? "✅" : "⬜"} IMPRESSÃO</p>

  <p>{pedido.prensa ? "✅" : "⬜"} PRENSAGEM</p>

  <p>{pedido.corte ? "✅" : "⬜"} CORTE</p>

  <p>{pedido.costura ? "✅" : "⬜"} COSTURA</p>

  <p>{pedido.conferencia ? "✅" : "⬜"} CONFERÊNCIA/RECEPÇÃO</p>

  <p>{pedido.entregaStatus ? "✅" : "⬜"} ENVIADO/ENTREGA</p>

</div>

          </div>

        ))}

      </div>

        )}

      </div>

    </main>
  );
}