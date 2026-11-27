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

function dataPedido(ficha: Ficha) {
  if (ficha.pedido) return ficha.pedido;
  const partes = ficha.vendaData?.split(" ")[0]?.split("/");
  return partes?.length === 3 ? `${partes[2]}-${partes[1]}-${partes[0]}` : "";
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
              const alerta = !ficha.entregaStatus && ficha.urgenciaExtrema && !ficha.conferencia ? "🚨" : categoria === "atrasados" ? "ATRASADO" : categoria === "urgentes" ? "URGENTE" : "";
              return <li key={ficha.id} className="flex items-center gap-2 py-2">
                <span className="shrink-0 text-zinc-500">{String(index + 1).padStart(2, "0")}</span>
                <Link href={`/fichas?fichaId=${encodeURIComponent(ficha.id || "")}`} className="min-w-0 flex-1 break-words font-semibold text-white hover:underline">{ficha.cliente || "Sem nome"}</Link>
                <span className="max-w-[43%] shrink-0 text-right text-[10px] font-semibold leading-tight text-sky-300">{situacao(ficha)}{alerta && <span className="block text-amber-400">{alerta}</span>}</span>
              </li>;
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
