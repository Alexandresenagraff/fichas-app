"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import app from "../../firebase/config";
import type { Ficha } from "../lib/helpers";

export default function AlertaUrgenciaExtrema() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Ficha[]>([]);
  const [listaAberta, setListaAberta] = useState(false);
  const [posicao, setPosicao] = useState<{ x: number; y: number } | null>(null);
  const arrasto = useRef<{ inicioX: number; inicioY: number; deslocamentoX: number; deslocamentoY: number; moveu: boolean } | null>(null);
  const ignorarClique = useRef(false);

  useEffect(() => {
    const consulta = query(collection(getFirestore(app), "fichas"), where("urgenciaExtrema", "==", true));
    return onSnapshot(consulta, (snapshot) => {
      setPedidos(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as Ficha).filter((ficha) => !ficha.conferencia && !ficha.entregaStatus));
    }, (error) => console.error("Erro ao carregar alertas de urgência extrema:", error));
  }, []);

  function abrirPedido(id: string) {
    setListaAberta(false);
    router.push(`/fichas?fichaId=${encodeURIComponent(id)}`);
  }

  function iniciarArrasto(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    const retangulo = event.currentTarget.getBoundingClientRect();
    arrasto.current = { inicioX: event.clientX, inicioY: event.clientY, deslocamentoX: event.clientX - retangulo.left, deslocamentoY: event.clientY - retangulo.top, moveu: false };
    ignorarClique.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function mover(event: PointerEvent<HTMLButtonElement>) {
    const atual = arrasto.current;
    if (!atual) return;
    if (Math.hypot(event.clientX - atual.inicioX, event.clientY - atual.inicioY) < 8 && !atual.moveu) return;
    atual.moveu = true;
    setPosicao({
      x: Math.max(0, Math.min(window.innerWidth - 64, event.clientX - atual.deslocamentoX)),
      y: Math.max(0, Math.min(window.innerHeight - 64, event.clientY - atual.deslocamentoY)),
    });
  }

  function terminarArrasto() {
    ignorarClique.current = Boolean(arrasto.current?.moveu);
    arrasto.current = null;
  }

  if (pedidos.length === 0) return null;

  return <>
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 shadow-[inset_0_0_50px_8px_rgba(239,68,68,0.25)] motion-safe:animate-pulse" />
    <button type="button" aria-label={`${pedidos.length} ${pedidos.length === 1 ? "pedido com urgência extrema" : "pedidos com urgência extrema"}. Toque para visualizar ou arraste para mover.`} title="Pedidos com urgência extrema" onPointerDown={iniciarArrasto} onPointerMove={mover} onPointerUp={terminarArrasto} onPointerCancel={() => { ignorarClique.current = true; arrasto.current = null; }} onClick={() => {
      if (ignorarClique.current) { ignorarClique.current = false; return; }
      if (pedidos.length === 1 && pedidos[0].id) abrirPedido(pedidos[0].id);
      else setListaAberta(true);
    }} style={posicao ? { left: posicao.x, top: posicao.y } : undefined} className={`fixed z-40 flex h-16 w-16 touch-none select-none items-center justify-center bg-transparent motion-safe:animate-pulse ${posicao ? "" : "bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4"}`}>
      <Image src="/sirene-urgencia.png" alt="" width={64} height={64} unoptimized draggable={false} className="h-16 w-16 object-contain" />
      {pedidos.length > 1 && <span className="absolute -right-1 -top-1 rounded-full bg-white px-1.5 text-xs font-bold text-red-800">{pedidos.length}</span>}
    </button>
    {listaAberta && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={() => setListaAberta(false)}>
      <section role="dialog" aria-modal="true" aria-label="Pedidos com urgência extrema" className="w-full max-w-md rounded-2xl bg-zinc-900 p-4 text-white" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-bold">Pedidos com urgência extrema</h2><button type="button" onClick={() => setListaAberta(false)} aria-label="Fechar lista" className="rounded-lg p-2"><X size={20} /></button></div>
        <div className="max-h-80 space-y-2 overflow-y-auto">{pedidos.map((ficha) => <button key={ficha.id} type="button" onClick={() => ficha.id && abrirPedido(ficha.id)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-zinc-800 px-3 py-2 text-left text-sm"><span>{ficha.cliente || "Cliente não informado"}</span><span className="shrink-0 text-xs text-zinc-300">{ficha.entrega ? ficha.entrega.split("-").reverse().join("/") : ""}</span></button>)}</div>
      </section>
    </div>}
  </>;
}
