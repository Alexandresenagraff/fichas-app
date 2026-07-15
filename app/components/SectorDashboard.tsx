"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";

import app from "../../firebase/config";

import { getFirestore, collection, onSnapshot } from "firebase/firestore";

import { Ficha, categoriaDaFicha } from "../lib/helpers";

const db = getFirestore(app);

interface SectorDashboardProps {
  title: string;
  description: string;
  entryCondition: (ficha: Ficha) => boolean;
  pendingCondition: (ficha: Ficha) => boolean;
  completedCondition: (ficha: Ficha) => boolean;
  actionRenderer: (ficha: Ficha) => React.ReactNode;
}

function SectorDashboardContent({
  title,
  description,
  entryCondition,
  pendingCondition,
  completedCondition,
  actionRenderer,
}: SectorDashboardProps) {
  const router = useRouter();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);

  useEffect(() => {
    setCarregando(true);
    const unsubscribe = onSnapshot(
      collection(db, "fichas"),
      (snapshot) => {
        const lista: Ficha[] = [];
        snapshot.forEach((item) => {
          const dados = item.data() as Ficha;
          if (dados.venda && entryCondition(dados)) {
            lista.push({ id: item.id, ...dados });
          }
        });
        setFichas(lista);
        setCarregando(false);
        setAtualizadoEm(new Date());
      },
      (error) => {
        console.log(error);
        setCarregando(false);
      }
    );
    return () => unsubscribe();
  }, [entryCondition]);

  const fichasFiltradas = fichas.filter((ficha) => {
    const termo = busca.trim().toLowerCase();
    return !termo || (ficha.cliente || "").toLowerCase().includes(termo);
  });

  const pendentes = fichasFiltradas.filter((f) => pendingCondition(f));
  const concluidas = fichasFiltradas.filter((f) => completedCondition(f));

  const contagem = {
    urgentes: pendentes.filter((f) => categoriaDaFicha(f) === "urgentes").length,
    atrasados: pendentes.filter((f) => categoriaDaFicha(f) === "atrasados").length,
    noPrazo: pendentes.filter((f) => categoriaDaFicha(f) === "noPrazo").length,
    finalizados: concluidas.length,
  };

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
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-zinc-400 text-xs">{description}</p>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="bg-zinc-800 hover:bg-zinc-700 transition rounded-full w-10 h-10 flex items-center justify-center text-sm"
            title="Atualizar"
          >
            ↻
          </button>
        </div>

        {/* PESQUISA */}
        <div className="bg-zinc-900 rounded-2xl p-3 mb-4 border border-zinc-800 relative">
          <input
            type="text"
            placeholder="🔎 Pesquisar Cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-xl p-3 pr-10 text-sm text-white placeholder-zinc-500 outline-none"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-sm"
              title="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        {/* CONTADORES */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{contagem.urgentes}</p>
            <p className="text-xs text-zinc-400">URGENTES</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{contagem.atrasados}</p>
            <p className="text-xs text-zinc-400">ATRASADOS</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{contagem.noPrazo}</p>
            <p className="text-xs text-zinc-400">NO PRAZO</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{contagem.finalizados}</p>
            <p className="text-xs text-zinc-400">FINALIZADOS</p>
          </div>
        </div>

        {/* LISTA */}
        <div className="space-y-3">
          {carregando ? (
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center text-zinc-400">
              Carregando pedidos...
            </div>
          ) : pendentes.length > 0 ? (
            pendentes.map((ficha) => (
              <div
                key={ficha.id}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xl font-bold uppercase break-words flex-1">
                    {ficha.cliente}
                  </p>
                  {ficha.entrega && categoriaDaFicha(ficha) === "atrasados" && (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                      ATRASADO
                    </span>
                  )}
                  {ficha.entrega && categoriaDaFicha(ficha) === "urgentes" && (
                    <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                      URGENTE
                    </span>
                  )}
                </div>

                {ficha.vendedor && (
                  <p className="text-sm text-zinc-400 mb-2">
                    Vendedor: <span className="text-white font-semibold">{ficha.vendedor}</span>
                  </p>
                )}

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

                {actionRenderer(ficha)}
              </div>
            ))
          ) : (
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center text-zinc-400">
              {busca
                ? "Nenhum cliente encontrado"
                : "Nenhum pedido aguardando ação deste setor"}
            </div>
          )}
        </div>

        {atualizadoEm && (
          <p className="text-center text-zinc-600 text-xs mt-4">
            Atualizado em {atualizadoEm.toLocaleTimeString()}
          </p>
        )}
      </div>
    </main>
  );
}

export default function SectorDashboard(props: SectorDashboardProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white p-3">
          <div className="max-w-md mx-auto">
            <p className="text-zinc-400 text-center mt-12">Carregando...</p>
          </div>
        </main>
      }
    >
      <SectorDashboardContent {...props} />
    </Suspense>
  );
}
