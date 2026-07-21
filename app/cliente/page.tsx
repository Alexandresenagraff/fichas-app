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
import ClientPdfLink from "../components/ClientPdfLink";

const db = getFirestore(app);

export default function Cliente() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pedidos, setPedidos] = useState<Ficha[]>([]);
  const [pedidoAberto, setPedidoAberto] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);

  const WHATSAPP_NUMERO = "5585991292240";

  function getWhatsAppLink() {
    const base = `https://wa.me/${WHATSAPP_NUMERO}`;
    let pedidoTexto = "";
    
    if (pedidos.length > 0) {
      const idx = pedidoAberto !== null ? pedidoAberto : 0;
      const pedido = pedidos[idx];
      if (pedido && pedido.id) {
        pedidoTexto = `\nPedido: #${pedido.id}`;
      }
    }

    const messaging = `Olá!\n\nGostaria de informações sobre meu pedido.${pedidoTexto}`;
    return `${base}?text=${encodeURIComponent(messaging)}`;
  }

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
      // Restaura o campo com o último identificador informado pelo cliente.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(emailSalvo);
    }
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="w-full max-w-2xl mx-auto">
<div className="bg-gradient-to-br from-neutral-900 via-zinc-900 to-black px-4 py-8 relative shadow-lg text-white">          <button
            onClick={() => router.push("/")}
            className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-90 text-white text-lg cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft size={18} />
          </button>

          <h2 className="text-center text-xl sm:text-2xl font-bold mb-3 px-2 tracking-wide">
            Bem vindo!
          </h2>

          <p className="text-center text-blue-200 text-xs mb-5">
            Aqui você acompanha o status do seu pedido 
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
className="bg-zinc-200 border border-zinc-300 rounded-2xl p-5 sm:p-6 shadow-xs overflow-hidden transition hover:shadow-md duration-200"              >
                <ClientPdfLink
                  pdfLink={pedido.pdfLink}
                  className="block text-lg font-bold mb-3 text-black break-words text-center border-b border-zinc-100 pb-2"
                >
                  {pedido.cliente} - Pedido {index + 1}
                </ClientPdfLink>

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
  className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] text-white font-bold rounded-xl py-3 mb-4 transition duration-200 shadow-sm text-xs uppercase tracking-wider"
>
  {pedidoAberto === index ? "RECOLHER" : "VISUALIZAR PROGRESSO"}
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
                        { key: pedido.arte, label: "ARTE/LAYOUT" },
                        { key: pedido.exportacao, label: "APLICAÇÃO NO MOLDE" },
                        { key: pedido.impressao, label: "IMPRESSÃO" },
                        { key: pedido.prensa, label: "PRENSAGEM" },
                        { key: pedido.corte, label: "CORTE" },
                        { key: pedido.costuraConcluida, label: "COSTURA" },
                        { key: pedido.conferencia, label: "CONFERÊNCIA" },
                        { key: pedido.entregaStatus, label: "ENVIO" },
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

      {/* Botão flutuante do WhatsApp */}
      <a
        href={getWhatsAppLink()}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 z-50 cursor-pointer"
        title="Fale conosco no WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.473 1.332 4.978L2 22l5.22-.1.371.365a9.904 9.904 0 004.819 1.22c5.506 0 9.988-4.482 9.988-9.988S17.518 2 12.012 2zm0 18.294c-1.579 0-3.13-.424-4.483-1.228l-.322-.19-3.333.65.66-3.256-.208-.33a8.212 8.212 0 01-1.26-4.385c0-4.545 3.7-8.243 8.246-8.243 4.545 0 8.243 3.698 8.243 8.243s-3.698 8.243-8.243 8.243zm4.52-6.168c-.247-.123-1.464-.722-1.692-.805-.228-.083-.394-.123-.56.123-.166.247-.64.805-.785.97-.145.166-.29.186-.537.063a6.762 6.762 0 01-1.99-1.228 7.458 7.458 0 01-1.377-1.714c-.145-.247-.015-.38.109-.503.111-.11.247-.29.37-.435.124-.145.166-.247.247-.413.083-.166.04-.31-.02-.435-.06-.123-.56-1.35-.767-1.85-.2-.486-.403-.42-.56-.42h-.478c-.166 0-.435.062-.663.31-.228.247-.87.848-.87 2.067s.89 2.398.992 2.537c.1.139 1.751 2.674 4.24 3.747.592.256 1.055.408 1.417.523.595.19 1.137.163 1.565.1.478-.07 1.464-.598 1.67-1.176.208-.578.208-1.074.145-1.176-.062-.1-.228-.166-.475-.29z"/>
        </svg>
      </a>
    </main>
  );
}
