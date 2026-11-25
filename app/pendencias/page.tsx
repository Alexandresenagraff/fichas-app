"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Clock3, FileWarning, Palette, Shirt, UserRoundX } from "lucide-react";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import app from "../../firebase/config";
import AdminNavigation from "../components/AdminNavigation";
import CabecalhoSenagraff from "../components/CabecalhoSenagraff";
import ClientPdfLink from "../components/ClientPdfLink";
import { categoriaDaFicha, etapaDaFicha, Ficha } from "../lib/helpers";

const db = getFirestore(app);

type TipoPendencia =
  | "semDesigner"
  | "arteParaCriar"
  | "aguardandoAprovacao"
  | "pdfPendente"
  | "semCostureiro"
  | "urgentes"
  | "atrasados";

const pendencias = [
  { id: "semDesigner", label: "SEM DESIGNER", Icon: UserRoundX, cor: "text-violet-400" },
  { id: "arteParaCriar", label: "À CRIAR", Icon: Palette, cor: "text-blue-400" },
  { id: "aguardandoAprovacao", label: "EM APROVAÇÃO", Icon: Clock3, cor: "text-amber-400" },
  { id: "pdfPendente", label: "PDF PENDENTE", Icon: FileWarning, cor: "text-indigo-400" },
  { id: "semCostureiro", label: "SEM COSTUREIRO", Icon: Shirt, cor: "text-pink-400" },
  { id: "urgentes", label: "URGENTES", Icon: AlertTriangle, cor: "text-orange-400" },
  { id: "atrasados", label: "ATRASADOS", Icon: AlertTriangle, cor: "text-red-400" },
] as const;

function possuiPendencia(ficha: Ficha, tipo: TipoPendencia): boolean {
  if (ficha.entregaStatus) return false;

  switch (tipo) {
    case "semDesigner":
      return ficha.venda && !ficha.designer;
    case "arteParaCriar":
      return Boolean(ficha.designer) && etapaDaFicha(ficha) === "arteParaCriar";
    case "aguardandoAprovacao":
      return etapaDaFicha(ficha) === "aguardandoAprovacao";
    case "pdfPendente":
      return Boolean(ficha.arteAprovada) && !ficha.pdfLink;
    case "semCostureiro":
      return etapaDaFicha(ficha) === "costura" && !ficha.costureiroCelina && !ficha.costureiroPaulo;
    case "urgentes":
      return categoriaDaFicha(ficha) === "urgentes";
    case "atrasados":
      return categoriaDaFicha(ficha) === "atrasados";
  }
}

function PendenciasPage() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<TipoPendencia | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "fichas"),
      (snapshot) => {
        setFichas(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Ficha));
        setCarregando(false);
      },
      (error) => {
        console.error("Erro ao carregar pendências:", error);
        setCarregando(false);
      }
    );

    return unsubscribe;
  }, []);

  const contagens = useMemo(() => {
    return pendencias.reduce<Record<TipoPendencia, number>>((acumulado, pendencia) => {
      acumulado[pendencia.id] = fichas.filter((ficha) => possuiPendencia(ficha, pendencia.id)).length;
      return acumulado;
    }, {} as Record<TipoPendencia, number>);
  }, [fichas]);

  const fichasExibidas = useMemo(() => {
    if (filtroAtivo) {
      return fichas.filter((ficha) => possuiPendencia(ficha, filtroAtivo));
    }

    return fichas.filter((ficha) => pendencias.some((pendencia) => possuiPendencia(ficha, pendencia.id)));
  }, [fichas, filtroAtivo]);

  return (
    <main className="min-h-screen bg-slate-800 px-3 pb-28 pt-4 text-white sm:px-6 sm:pt-7">
      <div className="mx-auto mb-4 max-w-5xl"><CabecalhoSenagraff /></div>
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => window.history.back()}
          className="mb-3 sm:mb-5 flex min-h-10 items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <header className="mb-4 sm:mb-6">
          <p className="text-xs font-bold tracking-widest text-blue-400">ADMINISTRAÇÃO</p>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold">Painel de Pendências</h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">Acompanhe os pedidos que precisam de atenção, sem alterar o fluxo de produção.</p>
        </header>

        <section className="mb-4 sm:mb-8 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Filtros de pendências">
          {pendencias.map(({ id, label, Icon, cor }) => {
            const ativo = filtroAtivo === id;
            return (
              <button
                key={id}
                onClick={() => setFiltroAtivo((atual) => (atual === id ? null : id))}
                className={`flex min-h-12 items-center gap-2 rounded-2xl border px-3 py-2 text-left transition-all ${
                  ativo ? "border-blue-500/60 bg-blue-500/10" : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                <span className={`flex min-w-0 items-center gap-2 text-[11px] sm:text-xs font-bold ${cor}`}>
                  <Icon size={15} className="shrink-0" />
                  {label}
                </span>
                <strong className="shrink-0 text-base text-white">{contagens[id]}</strong>
              </button>
            );
          })}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm sm:text-base font-bold">{filtroAtivo ? pendencias.find((pendencia) => pendencia.id === filtroAtivo)?.label : "TODAS AS PENDÊNCIAS"}</h2>
            {filtroAtivo && (
              <button onClick={() => setFiltroAtivo(null)} className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                Limpar filtro
              </button>
            )}
          </div>

          {carregando ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center text-sm text-zinc-500">Carregando pendências...</div>
          ) : fichasExibidas.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center text-sm text-zinc-500">Nenhuma pendência encontrada.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {fichasExibidas.map((ficha) => (
                <article key={ficha.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 sm:p-4">
                  <ClientPdfLink pdfLink={ficha.pdfLink} className="block truncate text-sm sm:text-base font-bold text-white">
                    {ficha.cliente || "Cliente não informado"}
                  </ClientPdfLink>
                  <div className="mt-2 sm:mt-3 space-y-1 text-xs text-zinc-400">
                    {ficha.empresa && <p>Empresa: <span className="text-zinc-300">{ficha.empresa}</span></p>}
                    {ficha.pedido && <p>Pedido: <span className="text-zinc-300">{ficha.pedido}</span></p>}
                    {ficha.designer && <p>Designer: <span className="text-zinc-300">{ficha.designer}</span></p>}
                    {ficha.entrega && <p>Entrega: <span className="text-zinc-300">{ficha.entrega}</span></p>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      <AdminNavigation />
    </main>
  );
}

export default PendenciasPage;
