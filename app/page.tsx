"use client";

import { useEffect, useState } from "react";

import app from "../firebase/config";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

const db = getFirestore(app);

export default function Home() {

  const [cliente, setCliente] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [costureiro1, setCostureiro1] = useState("");
  const [costureiro2, setCostureiro2] = useState("");
  const [pedido, setPedido] = useState("");
  const [entrega, setEntrega] = useState("");

  const [pdf, setPdf] = useState<any>(null);

  const [busca, setBusca] = useState("");
  const [fichas, setFichas] = useState<any[]>([]);

  async function salvarFicha() {

    if (!cliente) {
      alert("Digite o nome do cliente");
      return;
    }

    let pdfUrl = "";

    if (pdf) {
      pdfUrl = URL.createObjectURL(pdf);
    }

    try {

      await addDoc(collection(db, "fichas"), {
        cliente,
        vendedor,
        costureiro1,
        costureiro2,
        pedido,
        entrega,
        pdfUrl,
        criadoEm: new Date(),
      });

      alert("Ficha salva com sucesso!");

      carregarFichas();

      setCliente("");
      setVendedor("");
      setCostureiro1("");
      setCostureiro2("");
      setPedido("");
      setEntrega("");
      setPdf(null);

    } catch (error) {
      console.log(error);
      alert("Erro ao salvar");
    }
  }

  async function carregarFichas() {

    const querySnapshot = await getDocs(collection(db, "fichas"));

    const lista: any[] = [];

    querySnapshot.forEach((doc) => {
      lista.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    setFichas(lista);
  }

  useEffect(() => {
    carregarFichas();
  }, []);

  const fichasFiltradas = fichas.filter((ficha) =>
    ficha.cliente?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-zinc-900 p-3 text-white">

      <div className="max-w-md mx-auto">

        {/* PESQUISA */}
        <div className="bg-zinc-800 rounded-3xl shadow-2xl p-5 mb-5 border border-zinc-700">

          <input
            type="text"
            placeholder="🔍 Pesquisar Cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-600 rounded-2xl p-4 mb-2 text-white placeholder-zinc-500"
          />

        </div>

        {/* FORMULÁRIO */}
        <div className="bg-zinc-800 rounded-3xl shadow-2xl p-5 mb-5 border border-zinc-700">

          <h1 className="text-4xl font-bold text-center mb-1 text-white">
            FICHAS
          </h1>

          <p className="text-center text-zinc-400 mb-6">
            Sistema de Sublimação
          </p>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Nome do Cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-600 rounded-2xl p-4 text-white placeholder-zinc-500"
            />

            <input
              type="text"
              placeholder="Nome do Vendedor"
              value={vendedor}
              onChange={(e) => setVendedor(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-600 rounded-2xl p-4 text-white placeholder-zinc-500"
            />

            <input
              type="text"
              placeholder="Costureiro 1"
              value={costureiro1}
              onChange={(e) => setCostureiro1(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-600 rounded-2xl p-4 text-white placeholder-zinc-500"
            />

            <input
              type="text"
              placeholder="Costureiro 2"
              value={costureiro2}
              onChange={(e) => setCostureiro2(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-600 rounded-2xl p-4 text-white placeholder-zinc-500"
            />

            <div>
              <label className="text-sm text-zinc-400">
                Data do Pedido
              </label>

              <input
                type="date"
                value={pedido}
                onChange={(e) => setPedido(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-600 rounded-2xl p-4 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Data da Entrega
              </label>

              <input
                type="date"
                value={entrega}
                onChange={(e) => setEntrega(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-600 rounded-2xl p-4 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Anexar PDF da Ficha
              </label>

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdf(e.target.files?.[0])}
                className="w-full bg-zinc-900 border border-zinc-600 rounded-2xl p-3 text-white"
              />
            </div>

            <button
              onClick={salvarFicha}
              className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-2xl p-4 font-bold"
            >
              SALVAR FICHA
            </button>

          </div>
        </div>

        {/* LISTA */}
        <div className="bg-zinc-800 rounded-3xl shadow-2xl p-5 border border-zinc-700">

          <div className="space-y-3">

            {fichasFiltradas.map((ficha) => (

              <div
                key={ficha.id}
                className="border border-zinc-700 bg-zinc-900 rounded-2xl p-4"
              >
                <h2 className="font-bold text-lg text-white">
                  {ficha.cliente}
                </h2>

                <p className="text-zinc-300">
                  Vendedor: {ficha.vendedor}
                </p>

                <p className="text-zinc-300">
                  Costureiro 1: {ficha.costureiro1}
                </p>

                <p className="text-zinc-300">
                  Costureiro 2: {ficha.costureiro2}
                </p>

                <p className="text-zinc-300">
                  Pedido: {ficha.pedido}
                </p>

                <p className="text-zinc-300">
                  Entrega: {ficha.entrega}
                </p>

                {ficha.pdfUrl && (
                  <a
                    href={ficha.pdfUrl}
                    target="_blank"
                    className="block mt-3 bg-green-600 hover:bg-green-700 transition text-center rounded-2xl p-3 font-bold"
                  >
                    VER PDF
                  </a>
                )}

              </div>

            ))}

          </div>

        </div>

      </div>

    </main>
  );
}