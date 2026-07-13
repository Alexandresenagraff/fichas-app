"use client";

import { useState } from "react";

import app from "../../firebase/config";

import { addDoc, collection, getFirestore } from "firebase/firestore";

const db = getFirestore(app);

export default function Comercial() {
  const [cliente, setCliente] = useState("");
  const [email, setEmail] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [designer, setDesigner] = useState("");
  const [pedido, setPedido] = useState("");
  const [entrega, setEntrega] = useState("");

  async function salvarFicha() {
    if (!cliente) {
      alert("Digite o nome do cliente");
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
        venda: false,
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
    } catch (error) {
      console.log(error);
      alert("Erro ao salvar");
    }
  }

  return (
    <main className="min-h-screen bg-black p-3 text-white">
      <div className="max-w-md mx-auto">
        <div className="bg-zinc-900 rounded-3xl shadow-2xl p-5 mt-5 border border-zinc-800">
          <h1 className="text-4xl font-bold text-center mb-1">CADASTRO</h1>

          <p className="text-center text-zinc-400 mb-6">
            Sistema Status de Pedidos
          </p>

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
              <label className="text-sm text-zinc-400">Data da Entrega</label>
              <input
                type="date"
                value={entrega}
                onChange={(e) => setEntrega(e.target.value)}
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
    </main>
  );
}
