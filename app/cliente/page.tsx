"use client";

import { useState } from "react";

import app from "../../firebase/config";

import {
  getFirestore,
  collection,
  getDocs,
} from "firebase/firestore";

const db = getFirestore(app);

export default function Cliente() {

  const [email, setEmail] = useState("");
  const [pedido, setPedido] = useState<any>(null);

  async function buscarPedido() {

    try {

      const snapshot = await getDocs(
        collection(db, "fichas")
      );

      let encontrado = null;

      snapshot.forEach((doc) => {

        const dados = doc.data();

        if (
          dados.email?.toLowerCase() ===
          email.toLowerCase()
        ) {
          encontrado = dados;
        }

      });

      setPedido(encontrado);

      if (!encontrado) {
        alert("Nenhum pedido encontrado.");
      }

    } catch (error) {

      console.log(error);

      alert("Erro ao buscar pedido.");
    }
  }

  const etapas = pedido
    ? [
        pedido.venda,
        pedido.arte,
        pedido.exportacao,
        pedido.impressao,
        pedido.prensa,
        pedido.corte,
        pedido.costura,
        pedido.conferencia,
        pedido.entregaStatus,
      ]
    : [];

  const porcentagem = pedido
    ? Math.round(
        (etapas.filter(Boolean).length /
          etapas.length) *
          100
      )
    : 0;

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
          type="email"
          placeholder="Seu email"
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

        {pedido && (

          <div className="mt-8">

            <h2 className="text-xl font-bold mb-4">
              {pedido.cliente}
            </h2>

            <div className="w-full bg-zinc-800 rounded-full h-8 overflow-hidden mb-6">

              <div
                className="bg-yellow-500 h-full"
                style={{
                  width: `${porcentagem}%`,
                }}
              />

            </div>

            <p className="mb-4 font-bold">
              {porcentagem}% concluído
            </p>

            <div className="space-y-2 text-sm">

              <p>{pedido.venda ? "✅" : "⬜"} VENDA</p>
              <p>{pedido.arte ? "✅" : "⬜"} ARTE</p>
              <p>{pedido.exportacao ? "✅" : "⬜"} EXPORTAÇÃO</p>
              <p>{pedido.impressao ? "✅" : "⬜"} IMPRESSÃO</p>
              <p>{pedido.prensa ? "✅" : "⬜"} PRENSA</p>
              <p>{pedido.corte ? "✅" : "⬜"} CORTE</p>
              <p>{pedido.costura ? "✅" : "⬜"} COSTURA</p>
              <p>{pedido.conferencia ? "✅" : "⬜"} CONFERÊNCIA</p>
              <p>{pedido.entregaStatus ? "✅" : "⬜"} ENTREGA</p>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}