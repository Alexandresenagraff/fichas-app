"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import app from "../../firebase/config";

import { addDoc, collection, getFirestore } from "firebase/firestore";

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

function ComercialContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendedorParam = searchParams.get("vendedor") || "";
  const [cliente, setCliente] = useState("");
  const [email, setEmail] = useState("");
  const [vendedor, setVendedor] = useState(vendedorParam);
  const [observacao, setObservacao] = useState("");
  const [designer, setDesigner] = useState("");
  const [pedido, setPedido] = useState("");
  const [entrega, setEntrega] = useState("");

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
      router.push("/fichas");
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
