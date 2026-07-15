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

export default function Costura() {
  const router = useRouter();
  const [fichas, setFichas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [costureiroFiltro, setCostureiroFiltro] = useState("");
  const [filtroVencidos, setFiltroVencidos] = useState(false);

  async function carregarFichas() {
    try {
      const snapshot = await getDocs(collection(db, "fichas"));
      const lista: any[] = [];

      snapshot.forEach((item) => {
        const dados = item.data();
        if (
          dados.corte &&
          !dados.entregaStatus &&
          dados.venda &&
          dados.entrega
        ) {
          lista.push({ id: item.id, ...dados });
        }
      });

      lista.sort((a, b) => {
        if (a.costuraConcluida !== b.costuraConcluida)
          return a.costuraConcluida ? 1 : -1;
        const dateA = a.pedido ? new Date(a.pedido).getTime() : 0;
        const dateB = b.pedido ? new Date(b.pedido).getTime() : 0;
        return dateB - dateA;
      });

      setFichas(lista);
    } catch (error) {
      console.log(error);
    }
  }

  function estaVencido(ficha: any): boolean {
    if (!ficha.entrega || ficha.costuraConcluida) return false;
    const [ano, mes, dia] = ficha.entrega.split("-").map(Number);
    const hoje = new Date();
    const inicioDeHoje = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dataEntrega = Date.UTC(ano, mes - 1, dia);
    return dataEntrega < inicioDeHoje;
  }

  async function alterarStatus(id: string, campo: string, valorAtual: boolean) {
    try {
      const fichaRef = doc(db, "fichas", id);
      await updateDoc(fichaRef, { [campo]: !valorAtual });

      setFichas((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [campo]: !valorAtual } : item
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
    let matchCostureiro = true;
    if (costureiroFiltro === "paulo") matchCostureiro = ficha.costureiroPaulo;
    if (costureiroFiltro === "celina") matchCostureiro = ficha.costureiroCelina;
    const matchVencidos = !filtroVencidos || estaVencido(ficha);
    return matchBusca && matchCostureiro && matchVencidos;
  });

  const pendentes = fichasFiltradas.filter((f) => !f.costuraConcluida);
  const concluidas = fichasFiltradas.filter((f) => f.costuraConcluida);

  function StatusBadge({ ativo, label }: { ativo: boolean; label: string }) {
    return (
      <span
        className={`text-xs font-bold px-2 py-1 rounded-lg ${
          ativo ? "bg-lime-600 text-white" : "bg-zinc-800 text-zinc-500"
        }`}
      >
        {label}
      </span>
    );
  }

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
              <h1 className="text-2xl font-bold">COSTURA</h1>
              <p className="text-zinc-400 text-xs">
                Pedidos em produção de costura
              </p>
            </div>
          </div>
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
            value={costureiroFiltro}
            onChange={(e) => setCostureiroFiltro(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none"
          >
            <option value="">Todos os Costureiros</option>
            <option value="paulo">PAULO</option>
            <option value="celina">CELINA</option>
          </select>

          <button
            onClick={() => setFiltroVencidos(!filtroVencidos)}
            className={`w-full rounded-xl py-2.5 text-sm font-bold transition ${
              filtroVencidos
                ? "bg-red-600 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
            }`}
          >
            {filtroVencidos ? "🔴 VENCIDOS (ativo)" : "FILTRAR VENCIDOS"}
          </button>
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
              AGUARDANDO COSTURA ({pendentes.length})
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
                    {estaVencido(ficha) && (
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                        VENCIDO
                      </span>
                    )}
                  </div>

                  {ficha.pedido && (
                    <p className="text-sm text-zinc-400 mb-2">
                      Data: <span className="text-white font-semibold">{ficha.pedido.split("-").reverse().join("/")}</span>
                    </p>
                  )}

                  {ficha.entrega && (
                    <p className="text-sm text-zinc-400 mb-3">
                      Entrega: <span className="text-white font-semibold">{ficha.entrega.split("-").reverse().join("/")}</span>
                    </p>
                  )}

                  <div className="flex gap-2 mb-4 flex-wrap">
                    <StatusBadge ativo={ficha.costura} label="ENVIADO" />
                    <StatusBadge ativo={ficha.costureiroPaulo} label="PAULO" />
                    <StatusBadge ativo={ficha.costureiroCelina} label="CELINA" />
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => alterarStatus(ficha.id, "costura", ficha.costura)}
                      className={`w-full rounded-xl py-3 text-sm font-bold transition ${
                        ficha.costura
                          ? "bg-lime-600 hover:bg-lime-700 text-white"
                          : "bg-zinc-800 hover:bg-zinc-700 text-white"
                      }`}
                    >
                      {ficha.costura ? "✅ ENVIADO P/ COSTUREIRO" : "ENVIAR P/ COSTUREIRO"}
                    </button>

                    {ficha.costura && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => alterarStatus(ficha.id, "costureiroPaulo", ficha.costureiroPaulo)}
                          className={`rounded-xl py-2.5 text-sm font-bold transition ${
                            ficha.costureiroPaulo
                              ? "bg-blue-600 text-white"
                              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                          }`}
                        >
                          PAULO
                        </button>
                        <button
                          onClick={() => alterarStatus(ficha.id, "costureiroCelina", ficha.costureiroCelina)}
                          className={`rounded-xl py-2.5 text-sm font-bold transition ${
                            ficha.costureiroCelina
                              ? "bg-pink-600 text-white"
                              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                          }`}
                        >
                          CELINA
                        </button>
                      </div>
                    )}

                    {(ficha.costureiroPaulo || ficha.costureiroCelina) && (
                      <button
                        onClick={() => alterarStatus(ficha.id, "costuraConcluida", ficha.costuraConcluida)}
                        className="w-full bg-lime-600 hover:bg-lime-700 transition rounded-xl py-3 text-sm font-bold"
                      >
                        ✅ COSTURA CONCLUÍDA
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONCLUÍDAS */}
        {concluidas.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-zinc-400 mb-3 px-1">
              COSTURA CONCLUÍDA ({concluidas.length})
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

                  <div className="flex gap-2 mb-3 flex-wrap">
                    {ficha.costureiroPaulo && (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-600 text-white">PAULO</span>
                    )}
                    {ficha.costureiroCelina && (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-pink-600 text-white">CELINA</span>
                    )}
                  </div>

                  {ficha.pedido && (
                    <p className="text-sm text-zinc-400 mb-2">
                      Data: <span className="text-white font-semibold">{ficha.pedido.split("-").reverse().join("/")}</span>
                    </p>
                  )}

                  {ficha.entrega && (
                    <p className="text-sm text-zinc-400 mb-3">
                      Entrega: <span className="text-white font-semibold">{ficha.entrega.split("-").reverse().join("/")}</span>
                    </p>
                  )}

                  <button
                    onClick={() => alterarStatus(ficha.id, "costuraConcluida", ficha.costuraConcluida)}
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
            {busca || costureiroFiltro
              ? "Nenhum pedido encontrado"
              : "Nenhum pedido pendente de costura"}
          </div>
        )}
      </div>
    </main>
  );
}
