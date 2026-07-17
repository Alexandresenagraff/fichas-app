"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, CheckCircle2, Circle, FileText } from "lucide-react";

import app from "../../firebase/config";
import {
  getFirestore,
  collection,
  getDocs,
} from "firebase/firestore";
import { Ficha } from "../lib/helpers";
import { DashboardSkeleton } from "../components/Skeleton";

const db = getFirestore(app);

export default function Cliente() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pedidos, setPedidos] = useState<Ficha[]>([]);
  const [pedidoAberto, setPedidoAberto] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function buscarPedido() {
    if (!email.trim()) {
      setPedidos([]);
      alert("Digite seu e-mail, telefone ou código.");
      return;
    }

    setCarregando(true);
    try {
      const snapshot = await getDocs(collection(db, "fichas"));
      const encontrados: Ficha[] = [];

      snapshot.forEach((doc) => {
        const dados = doc.data() as Ficha;
        if (dados.email?.toLowerCase() === email.toLowerCase()) {
          encontrados.push({ id: doc.id, ...dados });
        }
      });

      setPedidos(encontrados);

      if (encontrados.length > 0) {
        localStorage.setItem("clienteEmail", email);
      } else {
        alert("Nenhum pedido encontrado para o código/e-mail informado.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar pedido. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  function calcularPorcentagem(pedido: Ficha) {
    const etapas = [
      pedido.venda,
      pedido.arte,
      pedido.exportacao,
      pedido.impressao,
      pedido.prensa,
      pedido.corte,
      pedido.costuraConcluida,
      pedido.conferencia,
      pedido.entregaStatus,
    ];

    const concluidas = etapas.filter(Boolean).length;
    return Math.round((concluidas / etapas.length) * 100);
  }

  useEffect(() => {
    const emailSalvo = localStorage.getItem("clienteEmail");
    if (emailSalvo) {
      setEmail(emailSalvo);
    }
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 px-4 py-8 relative shadow-lg header-shine text-white">
          <button
            onClick={() => router.push("/")}
            className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-90 text-white text-lg cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft size={18} />
          </button>

          <h2 className="text-center text-xl sm:text-2xl font-bold mb-3 px-2 tracking-wide">
            Acompanhe seu Pedido
          </h2>

          <p className="text-center text-blue-200 text-xs mb-5">
            Digite seu código, e-mail ou telefone para consultar
          </p>

          <div className="flex items-center bg-white rounded-xl px-4 py-3 mb-5 shadow-inner border border-zinc-200/50 max-w-md mx-auto">
            <Search className="text-zinc-400 mr-2.5 flex-shrink-0" size={18} />
            <input
              type="text"
              placeholder="Digite seu código"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  buscarPedido();
                }
              }}
              className="w-full bg-transparent text-black text-sm outline-none placeholder-zinc-400"
            />
          </div>

          <button
            onClick={buscarPedido}
            className="relative overflow-hidden block mx-auto bg-blue-600 hover:bg-blue-750 hover:scale-105 active:scale-95 text-white font-bold px-10 py-3 rounded-xl transition-all duration-200 shadow-lg cursor-pointer text-xs uppercase tracking-wider"
          >
            <span className="relative z-10">CONSULTAR</span>
            <span className="shine"></span>
          </button>
        </div>

        <div className="mt-8 px-4 sm:px-6 space-y-6 pb-12">
          {carregando ? (
            <DashboardSkeleton />
          ) : pedidos.length > 0 ? (
            pedidos.map((pedido, index) => (
              <div
                key={pedido.id || index}
                className="bg-white border border-zinc-200/80 rounded-2xl p-5 sm:p-6 shadow-xs overflow-hidden transition hover:shadow-md duration-200"
              >
                <h2 className="text-lg font-bold mb-3 text-black break-words text-center border-b border-zinc-100 pb-2">
                  {pedido.cliente} - Pedido {index + 1}
                </h2>

                <div className="mb-4 text-xs text-zinc-600 space-y-1">
                  <p>
                    <strong className="text-zinc-800">Pedido:</strong> {pedido.pedido ? pedido.pedido.split("-").reverse().join("/") : "-"}
                  </p>
                  <p>
                    <strong className="text-zinc-800">Entrega prevista:</strong> {pedido.entrega ? pedido.entrega.split("-").reverse().join("/") : "-"}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setPedidoAberto(pedidoAberto === index ? null : index)
                  }
                  className="relative overflow-hidden w-full bg-blue-650 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] text-white font-bold rounded-xl py-3 mb-4 transition duration-200 shadow-sm cursor-pointer text-xs uppercase tracking-wider"
                >
                  <span className="relative z-10">
                    {pedidoAberto === index ? "RECOLHER" : "VISUALIZAR PROGRESSO"}
                  </span>
                  <span className="shine"></span>
                </button>

                {pedidoAberto === index && (
                  <div className="animate-[slideDown_0.2s_ease-out] space-y-4">
                    <div className="w-full bg-zinc-100 border border-zinc-200/60 rounded-full h-6 overflow-hidden mb-6 relative">
                      <div
                        className="h-full flex items-center justify-center font-extrabold text-[10px] text-white transition-all duration-500 ease-out"
                        style={{
                          width: `${calcularPorcentagem(pedido)}%`,
                          background: "linear-gradient(90deg, #eab308 0%, #22c55e 100%)",
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-extrabold text-[10px]">
                        {calcularPorcentagem(pedido)}%
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      {[
                        { key: pedido.venda, label: "COMPRA REALIZADA" },
                        { key: pedido.arte, label: "ARTE CONCLUÍDA" },
                        { key: pedido.exportacao, label: "APLICADO NO MOLDE" },
                        { key: pedido.impressao, label: "IMPRESSO" },
                        { key: pedido.prensa, label: "PRENSAGEM CONCLUÍDA" },
                        { key: pedido.corte, label: "CORTE CONCLUÍDO" },
                        { key: pedido.costuraConcluida, label: "COSTURA CONCLUÍDA" },
                        { key: pedido.conferencia, label: "CONFERIDO" },
                        { key: pedido.entregaStatus, label: "PEDIDO DESPACHADO" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 rounded-xl border-l-4 px-4 py-3 shadow-xs transition-all ${
                            item.key
                              ? "border-lime-500 bg-lime-50/50 text-lime-800"
                              : "border-zinc-300 bg-zinc-50/50 text-zinc-500"
                          }`}
                        >
                          {item.key ? (
                            <CheckCircle2 size={16} className="text-lime-600 flex-shrink-0" />
                          ) : (
                            <Circle size={16} className="text-zinc-300 flex-shrink-0" />
                          )}
                          <span className="font-semibold tracking-wide">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    {pedido.pdfLink && (
                      <div className="mt-5 p-3.5 bg-blue-50 border border-blue-150 rounded-xl text-center shadow-xs">
                        <a
                          href={pedido.pdfLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-700 font-extrabold hover:text-blue-800 transition text-xs tracking-wider"
                        >
                          <FileText size={14} /> VISUALIZAR MOLDE (PDF)
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            email && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center text-zinc-500 text-xs">
                Nenhum pedido encontrado. Verifique os dados digitados e tente novamente.
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}