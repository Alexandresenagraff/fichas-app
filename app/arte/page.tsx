"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import app from "../../firebase/config";

import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const db = getFirestore(app);

export default function Arte() {
  const router = useRouter();
  const [fichas, setFichas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [designerFiltro, setDesignerFiltro] = useState("");

  async function carregarFichas() {
    try {
      const snapshot = await getDocs(collection(db, "fichas"));
      const lista: any[] = [];

      const designersArte = ["ALEXANDRE", "LÁZARO", "EDIVAN", "PAULÃO", "DIEGO"];

      snapshot.forEach((item) => {
        const dados = item.data();
        if (
          dados.venda &&
          !dados.entregaStatus &&
          dados.designer &&
          designersArte.includes(dados.designer.toUpperCase())
        ) {
          lista.push({ id: item.id, ...dados });
        }
      });

      lista.sort((a, b) => {
        // Completed go to the bottom
        if (a.arte !== b.arte) return a.arte ? 1 : -1;
        // Within each group, newest first
        const dateA = a.pedido ? new Date(a.pedido).getTime() : 0;
        const dateB = b.pedido ? new Date(b.pedido).getTime() : 0;
        return dateB - dateA;
      });

      setFichas(lista);
    } catch (error) {
      console.log(error);
    }
  }

  function estaAtrasado(ficha: any): boolean {
    if (!ficha.entrega || ficha.arte) return false;
    const [ano, mes, dia] = ficha.entrega.split("-").map(Number);
    const hoje = new Date();
    const inicioDeHoje = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dataEntrega = Date.UTC(ano, mes - 1, dia);
    return dataEntrega < inicioDeHoje;
  }

  async function concluirArte(id: string) {
    try {
      const fichaRef = doc(db, "fichas", id);
      const agora = new Date();
      const dia = String(agora.getDate()).padStart(2, "0");
      const mes = String(agora.getMonth() + 1).padStart(2, "0");
      const ano = agora.getFullYear();
      const horas = String(agora.getHours()).padStart(2, "0");
      const minutos = String(agora.getMinutes()).padStart(2, "0");
      const arteData = `${dia}/${mes}/${ano} ${horas}:${minutos}`;
      await updateDoc(fichaRef, { arte: true, arteData });

      setFichas((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, arte: true, arteData } : item
        )
      );
    } catch (error) {
      console.log(error);
      alert("Erro ao atualizar");
    }
  }

  async function desfazerArte(id: string) {
    try {
      const fichaRef = doc(db, "fichas", id);
      await updateDoc(fichaRef, { arte: false, arteData: "" });

      setFichas((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, arte: false, arteData: "" } : item
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

  const fichasFiltradas = fichas.filter((ficha) => {
    const matchBusca = ficha.cliente?.toLowerCase().includes(busca.toLowerCase());
    const matchDesigner = !designerFiltro || ficha.designer?.toUpperCase() === designerFiltro;
    return matchBusca && matchDesigner;
  });

  const pendentes = fichasFiltradas.filter((f) => !f.arte);
  const concluidas = fichasFiltradas
    .filter((f) => f.arte)
    .sort((a, b) => {
      const dateA = a.pedido ? new Date(a.pedido).getTime() : 0;
      const dateB = b.pedido ? new Date(b.pedido).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <main className="min-h-screen bg-black text-white p-3">
      <div className="max-w-md mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5 mt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/fichas")}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition text-lg"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold">ARTE</h1>
              <p className="text-zinc-400 text-xs">
                Pedidos aguardando aprovação de arte
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/fichas")}
            className="bg-blue-600 hover:bg-blue-700 transition rounded-full px-4 py-2 text-sm font-bold"
          >
            + Novo
          </button>
        </div>

        {/* PESQUISA */}
        <div className="bg-zinc-900 rounded-2xl p-3 mb-4 border border-zinc-800 space-y-3">
          <input
            type="text"
            placeholder="🔎 Pesquisar Cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white placeholder-zinc-500 outline-none"
          />

          <select
            value={designerFiltro}
            onChange={(e) => setDesignerFiltro(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none"
          >
            <option value="">Todos os Designers</option>
            <option value="ALEXANDRE">ALEXANDRE</option>
            <option value="LÁZARO">LÁZARO</option>
            <option value="EDIVAN">EDIVAN</option>
            <option value="PAULÃO">PAULÃO</option>
            <option value="DIEGO">DIEGO</option>
          </select>
        </div>

        {/* CONTADORES */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{pendentes.length}</p>
            <p className="text-xs text-zinc-400">PENDENTES</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-lime-400">{concluidas.length}</p>
            <p className="text-xs text-zinc-400">CONCLUÍDAS</p>
          </div>
        </div>

        {/* PENDENTES */}
        {pendentes.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-zinc-400 mb-3 px-1">
              AGUARDANDO ARTE ({pendentes.length})
            </h2>
            <div className="space-y-3">
              {pendentes.map((ficha) => (
                <div
                  key={ficha.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xl font-bold uppercase break-words flex-1">
                      {ficha.cliente}
                    </p>
                    {estaAtrasado(ficha) && (
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                        ATRASADO
                      </span>
                    )}
                  </div>

                  {ficha.designer && (
                    <p className="text-sm text-zinc-400 mb-2">
                      Designer: <span className="text-white font-semibold">{ficha.designer}</span>
                    </p>
                  )}

                  {ficha.pedido && (
                    <p className="text-sm text-zinc-400 mb-2">
                      Data: <span className="text-white font-semibold">{ficha.pedido.split("-").reverse().join("/")}</span>
                    </p>
                  )}

                  {ficha.entrega && (
                    <p className="text-sm text-zinc-400 mb-2">
                      Entrega: <span className="text-white font-semibold">{ficha.entrega.split("-").reverse().join("/")}</span>
                    </p>
                  )}

                  {ficha.observacao && (
                    <p className="text-sm text-zinc-500 mb-4 break-words">
                      Obs: {ficha.observacao}
                    </p>
                  )}

                  <div className="mb-4">
                    {ficha.pdfLink ? (
                      <a
                        href={ficha.pdfLink}
                        target="_blank"
                        className="block bg-blue-800 hover:bg-blue-900 transition text-center rounded-xl p-3 text-sm font-bold"
                      >
                        📄 VER MOLDE (PDF)
                      </a>
                    ) : (
                      <p className="text-xs text-zinc-600 text-center bg-zinc-900 rounded-xl p-3">
                        Molde ainda não disponível
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => concluirArte(ficha.id)}
                    className="w-full bg-lime-600 hover:bg-lime-700 transition rounded-xl py-3 text-sm font-bold"
                  >
                    ✅ ARTE CONCLUÍDA
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONCLUÍDAS */}
        {concluidas.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-zinc-400 mb-3 px-1">
              ARTE CONCLUÍDA ({concluidas.length})
            </h2>
            <div className="space-y-3">
              {concluidas.map((ficha) => (
                <div
                  key={ficha.id}
                  className="bg-zinc-950 border border-lime-800/30 rounded-2xl p-5 shadow-lg opacity-70"
                >
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xl font-bold uppercase break-words text-lime-400">
                      {ficha.cliente}
                    </p>
                    <span className="text-lime-400 text-xs font-bold flex-shrink-0 ml-2">
                      ✅ OK
                    </span>
                  </div>

                  {ficha.designer && (
                    <p className="text-sm text-zinc-400 mb-2">
                      Designer: <span className="text-white font-semibold">{ficha.designer}</span>
                    </p>
                  )}

                  {ficha.pedido && (
                    <p className="text-sm text-zinc-400 mb-2">
                      Data: <span className="text-white font-semibold">{ficha.pedido.split("-").reverse().join("/")}</span>
                    </p>
                  )}

                  {ficha.entrega && (
                    <p className="text-sm text-zinc-400 mb-2">
                      Entrega: <span className="text-white font-semibold">{ficha.entrega.split("-").reverse().join("/")}</span>
                    </p>
                  )}

                  {ficha.pdfLink && (
                    <a
                      href={ficha.pdfLink}
                      target="_blank"
                      className="block bg-zinc-800 hover:bg-zinc-700 transition text-center rounded-xl p-3 text-xs font-medium mb-4"
                    >
                      📄 VER MOLDE
                    </a>
                  )}

                  <button
                    onClick={() => desfazerArte(ficha.id)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 transition rounded-xl py-2 text-xs font-medium text-zinc-400"
                  >
                    DESFAZER
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {fichasFiltradas.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center text-zinc-400 mt-4">
            {busca
              ? "Nenhum cliente encontrado"
              : "Nenhum pedido pendente de arte"}
          </div>
        )}
      </div>
    </main>
  );
}
