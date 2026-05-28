"use client";

import { useEffect, useState } from "react";

import app from "../firebase/config";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const db = getFirestore(app);

export default function Home() {

  const [cliente, setCliente] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [costureiro1, setCostureiro1] = useState("");
  const [costureiro2, setCostureiro2] = useState("");
  const [pedido, setPedido] = useState("");
  const [entrega, setEntrega] = useState("");
  const [pdfLink, setPdfLink] = useState("");

  const [busca, setBusca] = useState("");
  const [fichas, setFichas] = useState<any[]>([]);

  async function salvarFicha() {

    if (!cliente) {
      alert("Digite o nome do cliente");
      return;
    }

    try {

      await addDoc(collection(db, "fichas"), {
        cliente,
        vendedor,
        costureiro1,
        costureiro2,
        pedido,
        entrega,
        pdfLink,

        venda: false,
        arte: false,
        exportacao: false,
        impressao: false,
        prensa: false,
        costura: false,
        conferencia: false,
        entregue: false,

        criadoEm: new Date(),
      });

      alert("Ficha salva!");

      carregarFichas();

      setCliente("");
      setVendedor("");
      setCostureiro1("");
      setCostureiro2("");
      setPedido("");
      setEntrega("");
      setPdfLink("");

    } catch (error) {

      console.log(error);

      alert("Erro ao salvar");
    }
  }

  async function carregarFichas() {

    try {

      const querySnapshot = await getDocs(collection(db, "fichas"));

      const lista: any[] = [];

      querySnapshot.forEach((item) => {

        lista.push({
          id: item.id,
          ...item.data(),
        });

      });

      setFichas(lista);

    } catch (error) {

      console.log(error);
    }
  }

  async function alterarStatus(id, campo, valorAtual) {

    try {

      const fichaRef = doc(db, "fichas", id);

      await updateDoc(fichaRef, {
        [campo]: !valorAtual,
      });

      setFichas((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, [campo]: !valorAtual }
            : item
        )
      );

    } catch (error) {

      console.log(error);

      alert("Erro ao atualizar");
    }
  }

  useEffect(() => {

    carregarFichas();

  }, []);

  const fichasFiltradas = busca
    ? fichas.filter((ficha) =>
        ficha.cliente
          ?.toLowerCase()
          .includes(busca.toLowerCase())
      )
    : [];

function StatusToggle({
  label,
  ativo,
  onClick,
}: {
  label: string;
  ativo: boolean;
  onClick: () => void;
}) {

    return (

      <div className="flex items-center justify-between mb-3">

        <span className="text-white text-xl">
          {label}
        </span>

        <button
          onClick={onClick}
          className={`w-28 h-12 rounded-xl transition relative ${
            ativo
              ? "bg-zinc-500"
              : "bg-zinc-500"
          }`}
        >

          <div
            className={`absolute top-1 w-10 h-10 rounded-lg transition-all ${
              ativo
                ? "bg-lime-400 left-16"
                : "bg-red-500 left-1"
            }`}
          />

        </button>

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-zinc-950 p-3 text-white">

      <div className="max-w-md mx-auto">

        {/* PESQUISA */}
        <div className="bg-zinc-900 rounded-3xl shadow-2xl p-5 mb-5 border border-zinc-700">

          <input
            type="text"
            placeholder="🔎 Pesquisar Cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-4 text-white placeholder-zinc-500"
          />

        </div>

        {/* RESULTADOS */}
        {busca && (

          <div className="space-y-4">

            {fichasFiltradas.length > 0 ? (

              fichasFiltradas.map((ficha) => (

                <div
                  key={ficha.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5"
                >

                  <div className="grid grid-cols-2 gap-4 mb-5">

                    <div>

                      <p className="text-3xl font-bold">
                        {ficha.cliente}
                      </p>

                      <p className="text-zinc-300 mt-2">
                        Pedido: {ficha.pedido}
                      </p>

                    </div>

                    <div>

                      <p className="text-xl">
                        Vendedor: {ficha.vendedor}
                      </p>

                      <p className="text-zinc-300 mt-2">
                        Entrega: {ficha.entrega}
                      </p>

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <StatusToggle
                        label="VENDA"
                        ativo={ficha.venda}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "venda",
                            ficha.venda
                          )
                        }
                      />

                      <StatusToggle
                        label="ARTE"
                        ativo={ficha.arte}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "arte",
                            ficha.arte
                          )
                        }
                      />

                      <StatusToggle
                        label="EXPOR."
                        ativo={ficha.exportacao}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "exportacao",
                            ficha.exportacao
                          )
                        }
                      />

                      <StatusToggle
                        label="IMPRE."
                        ativo={ficha.impressao}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "impressao",
                            ficha.impressao
                          )
                        }
                      />

                    </div>

                    <div>

                      <StatusToggle
                        label="PRENSA"
                        ativo={ficha.prensa}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "prensa",
                            ficha.prensa
                          )
                        }
                      />

                      <StatusToggle
                        label="COSTU."
                        ativo={ficha.costura}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "costura",
                            ficha.costura
                          )
                        }
                      />

                      <StatusToggle
                        label="CONFER."
                        ativo={ficha.conferencia}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "conferencia",
                            ficha.conferencia
                          )
                        }
                      />

                      <StatusToggle
                        label="ENTREGUE"
                        ativo={ficha.entregue}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "entregue",
                            ficha.entregue
                          )
                        }
                      />

                    </div>

                  </div>

                  {/* PDF */}
                  {ficha.pdfLink && (

                    <a
                      href={ficha.pdfLink}
                      target="_blank"
                      className="block mt-5 bg-green-600 hover:bg-green-700 transition text-center rounded-2xl p-4 font-bold"
                    >
                      VER PDF
                    </a>

                  )}

                </div>

              ))

            ) : (

              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 text-center text-zinc-400">
                Nenhum cliente encontrado
              </div>

            )}

          </div>

        )}

        {/* FORMULÁRIO */}
        <div className="bg-zinc-900 rounded-3xl shadow-2xl p-5 mt-5 border border-zinc-700">

          <h1 className="text-4xl font-bold text-center mb-1">
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
              className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-4"
            />

            <input
              type="text"
              placeholder="Nome do Vendedor"
              value={vendedor}
              onChange={(e) => setVendedor(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-4"
            />

            <input
              type="text"
              placeholder="Costureiro 1"
              value={costureiro1}
              onChange={(e) => setCostureiro1(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-4"
            />

            <input
              type="text"
              placeholder="Costureiro 2"
              value={costureiro2}
              onChange={(e) => setCostureiro2(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-4"
            />

            <div>

              <label className="text-sm text-zinc-400">
                Data do Pedido
              </label>

              <input
                type="date"
                value={pedido}
                onChange={(e) => setPedido(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-4"
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
                className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-4"
              />

            </div>

            <div>

              <label className="text-sm text-zinc-400">
                Link do PDF
              </label>

              <input
                type="text"
                placeholder="Cole aqui o link do PDF"
                value={pdfLink}
                onChange={(e) => setPdfLink(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-4"
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

      </div>

    </main>
  );
}