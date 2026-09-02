"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, ChevronDown, ChevronRight, ClipboardCheck, ClipboardList, Database, Flame, House, Palette, Printer, Scissors, Settings, Shirt, ShoppingBag, Truck, Users, X } from "lucide-react";
import { DESIGNERS, VENDEDORES } from "../lib/helpers";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function normalizarNome(nome: string): string {
  return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [grupoAberto, setGrupoAberto] = useState<"comercial" | "designers" | "costura" | null>(null);

  if (!isOpen) return null;

  function navegar(url: string) {
    onClose();
    router.push(url);
  }

  const grupos = [
    { id: "comercial" as const, label: "Comercial", Icon: ShoppingBag, items: [{ label: "Visão geral", href: "/comercial" }, ...VENDEDORES.map((vendedor) => ({ label: vendedor, href: `/comercial?vendedor=${vendedor}` }))] },
    { id: "designers" as const, label: "Designers", Icon: Palette, items: [{ label: "Geral Arte", href: "/arte" }, ...DESIGNERS.map((designer) => ({ label: designer, href: `/arte?designer=${normalizarNome(designer)}` }))] },
    { id: "costura" as const, label: "Costura", Icon: Shirt, items: [{ label: "Celina", href: "/costura?costureiro=celina" }, { label: "Paulo", href: "/costura?costureiro=paulo" }] },
  ];
  const setores = [
    { label: "Impressão", href: "/impressao", Icon: Printer },
    { label: "Prensa", href: "/prensa", Icon: Flame },
    { label: "Corte", href: "/corte", Icon: Scissors },
    { label: "Conferência", href: "/conferencia", Icon: ClipboardCheck },
    { label: "Envio / Retirada", href: "/envio", Icon: Truck },
  ];
  const administracao = [
    { label: "Início", href: "/inicio", Icon: House },
    { label: "Pedidos", href: "/fichas", Icon: ClipboardList },
    { label: "Pendências", href: "/pendencias", Icon: ClipboardCheck },
    { label: "Relatórios", href: "/relatorios", Icon: BarChart3 },
    { label: "Configurações", href: "/configuracoes", Icon: Settings },
    { label: "Usuários (em breve)", Icon: Users },
    { label: "Backup (em breve)", Icon: Database },
  ];

  return (
    <>
      <button className="fixed inset-0 z-50 cursor-default bg-slate-950/40 backdrop-blur-[1px]" aria-label="Fechar menu" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label="Menu administrativo" className="fixed inset-x-0 bottom-0 z-[60] max-h-[82vh] overflow-y-auto rounded-t-[2rem] bg-slate-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 text-slate-900 shadow-[0_-20px_50px_rgba(15,23,42,0.22)] animate-[slideUp_0.22s_ease-out] sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[26rem] sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-300 sm:hidden" />
        <header className="mb-4 flex items-center justify-between">
          <div><p className="text-[11px] font-bold tracking-[0.16em] text-blue-600">FICHAS</p><h2 className="text-lg font-bold">Menu do sistema</h2></div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900" title="Fechar menu"><X size={20} /></button>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <p className="px-2 pb-2 pt-1 text-[10px] font-bold tracking-[0.15em] text-slate-400">SETORES</p>
          {grupos.map(({ id, label, Icon, items }) => {
            const aberto = grupoAberto === id;
            const rotaDoGrupo = id === "designers" ? "/arte" : `/${id}`;
            return <div key={id}>
              <button onClick={() => setGrupoAberto(aberto ? null : id)} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${aberto || pathname === rotaDoGrupo ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}>
                <span className="flex items-center gap-3"><Icon size={18} />{label}</span>{aberto ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
              </button>
              {aberto && <div className="mb-1 ml-5 border-l border-blue-100 pl-3">{items.map((item) => <button key={item.href} onClick={() => navegar(item.href)} className="block w-full rounded-lg px-2 py-2 text-left text-xs font-medium text-slate-500 transition hover:bg-blue-50 hover:text-blue-700">{item.label}</button>)}</div>}
            </div>;
          })}
          {setores.map(({ label, href, Icon }) => <button key={href} onClick={() => navegar(href)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${pathname === href ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}><Icon size={18} />{label}</button>)}
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <p className="px-2 pb-2 pt-1 text-[10px] font-bold tracking-[0.15em] text-slate-400">ADMINISTRAÇÃO</p>
          {administracao.map(({ label, href, Icon }) => href ? <button key={href} onClick={() => navegar(href)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${pathname === href ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}><Icon size={18} />{label}</button> : <div key={label} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-300"><Icon size={18} />{label}</div>)}
        </section>
      </aside>
    </>
  );
}
