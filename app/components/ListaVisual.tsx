"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { categoriaDaFicha, etapaDaFicha, type Ficha } from "../lib/helpers";

function situacao(ficha: Ficha) {
  if (ficha.entregaStatus) return "FINALIZADO";
  if (ficha.exportacao) return "EM PRODUÇÃO";
  switch (etapaDaFicha(ficha)) {
    case "arteParaCriar": return "À CRIAR";
    case "aguardandoAprovacao": return "EM APROVAÇÃO";
    case "alteracaoSolicitada": return "ALTERAÇÃO SOLICITADA";
    case "exportacao": return "APROVADO";
    default: return "EM PRODUÇÃO";
  }
}

function corSituacao(label: string) {
  switch (label) {
    case "À CRIAR": return "text-red-400";
    case "APROVADO": return "text-emerald-400";
    case "EM APROVAÇÃO": return "text-yellow-400";
    case "ALTERAÇÃO SOLICITADA": return "text-orange-400";
    case "FINALIZADO": return "text-emerald-400";
    default: return "text-sky-300";
  }
}

function dataPedido(ficha: Ficha) {
  if (ficha.pedido) return ficha.pedido;
  const partes = ficha.vendaData?.split(" ")[0]?.split("/");
  return partes?.length === 3 ? `${partes[2]}-${partes[1]}-${partes[0]}` : "";
}

function dataCurta(data?: string) {
  const partes = data?.match(/^\d{4}-(\d{2})-(\d{2})/);
  return partes ? `${partes[2]}/${partes[1]}` : "--/--";
}

export default function ListaVisual({ fichas }: { fichas: Ficha[] }) {
  const [aberta, setAberta] = useState(false);
  const [mes, setMes] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  });
  const id = useId();
  const lista = useMemo(() => fichas
    .filter((ficha) => !mes || dataPedido(ficha).startsWith(`${mes}-`))
    .sort((a, b) => (a.entrega || "9999-99-99").localeCompare(b.entrega || "9999-99-99") || (a.cliente || "").localeCompare(b.cliente || "", "pt-BR")), [fichas, mes]);

  return (
    <section className="mb-3">
      <button type="button" onClick={() => setAberta(!aberta)} aria-expanded={aberta} aria-controls={id} className="flex min-h-11 w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-left text-xs font-bold text-zinc-200">
        <span>LISTA VISUAL</span>{aberta ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
      </button>
      <div id={id} hidden={!aberta} className="mt-2 rounded-xl bg-zinc-900 p-3 text-xs text-zinc-200">
        <label className="flex flex-wrap items-center gap-2 text-zinc-300">Mês do pedido
          <input type="month" value={mes} onChange={(event) => setMes(event.target.value)} className="min-h-10 max-w-full rounded-lg bg-black px-2 text-white" />
        </label>
        <p className="mt-1 text-[10px] text-zinc-400">Por data de entrega mais próxima. Limpe o mês para ver todos.</p>
        {lista.length === 0 ? <p className="py-3 text-zinc-400">Nenhum pedido neste período.</p> : (
          <ol className="mt-2 divide-y divide-zinc-800">
            {lista.map((ficha, index) => {
              const categoria = categoriaDaFicha(ficha);
              const alerta = !ficha.entregaStatus && ficha.urgenciaExtrema && !ficha.conferencia ? "🚨" : categoria === "atrasados" ? "ATRAS." : categoria === "urgentes" ? "URG." : "";
              const status = situacao(ficha);
              return <li key={ficha.id} className="grid grid-cols-[1rem_minmax(0,1fr)_4rem_4.5rem_1.8rem] items-center gap-1 py-1.5">
                <span className="text-zinc-500">{String(index + 1).padStart(2, "0")}</span>
                <Link href={`/fichas?fichaId=${encodeURIComponent(ficha.id || "")}`} title={ficha.cliente || "Sem nome"} className="min-w-0 truncate font-semibold text-white hover:underline">{ficha.cliente || "Sem nome"}</Link>
                <span className="whitespace-nowrap text-left text-[9px] text-zinc-400" aria-label={`Pedido ${dataCurta(dataPedido(ficha))}, entrega ${dataCurta(ficha.entrega)}`}>
                  {dataCurta(dataPedido(ficha))} - {dataCurta(ficha.entrega)}
                </span>
                <span title={status} className={`min-w-0 truncate text-left text-[9px] font-semibold leading-tight ${corSituacao(status)}`}>{status}</span>
                <span title={alerta === "URG." ? "Urgente" : alerta === "ATRAS." ? "Atrasado" : alerta === "🚨" ? "Urgência extrema" : undefined} className={`whitespace-nowrap text-left text-[9px] font-semibold ${categoria === "atrasados" ? "text-red-400" : "text-amber-400"}`}>{alerta}</span>
              </li>;
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
