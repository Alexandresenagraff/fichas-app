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
  const [pedidos, setPedidos] = useState<any[]>([]);

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

      if (encontrados.length === 0) {
        alert("Nenhum pedido encontrado.");
      }

    } catch (error) {

      console.log(error);

      alert("Erro ao buscar pedido.");
    }
  }

  const etapas = [];

  const porcentagem = 0;

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

        {pedidos.length > 0 && (

          <div className="mt-8">

           <h2 className="text-xl font-bold mb-4">
  Teste
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

              <p>Teste</p>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}