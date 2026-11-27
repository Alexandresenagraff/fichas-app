"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, ChevronDown, ChevronRight, ClipboardCheck, Database, Flame, Palette, Printer, Scissors, Settings, Shirt, ShoppingBag, Truck, Users, X } from "lucide-react";
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
  const [administracaoAberta, setAdministracaoAberta] = useState(false);

  function navegar(url: string) {
    onClose();
    router.push(url);
  }

  const grupos = [
    { id: "comercial" as const, label: "Comercial", Icon: ShoppingBag, items: VENDEDORES.map((vendedor) => ({ label: vendedor, href: `/comercial?vendedor=${vendedor}` })) },
    { id: "designers" as const, label: "Designers", Icon: Palette, items: DESIGNERS.map((designer) => ({ label: designer, href: `/arte?designer=${normalizarNome(designer)}` })) },
  ];
  const setores = [
    { label: "Impressão", href: "/impressao", Icon: Printer },
    { label: "Prensa", href: "/prensa", Icon: Flame },
    { label: "Corte", href: "/corte", Icon: Scissors },
    { label: "Conferência", href: "/conferencia", Icon: ClipboardCheck },
    { label: "Envio / Retirada", href: "/envio", Icon: Truck },
  ];
  const costura = { id: "costura" as const, label: "Costura", Icon: Shirt, items: [{ label: "Celina", href: "/costura?costureiro=celina" }, { label: "Paulo", href: "/costura?costureiro=paulo" }] };
  const menuSetores = [...grupos, ...setores.slice(0, 3), costura, ...setores.slice(3)];
  const administracao = [
    { label: "Relatórios", href: "/relatorios", Icon: BarChart3 },
    { label: "Configurações", href: "/configuracoes", Icon: Settings },
    { label: "Usuários (em breve)", Icon: Users },
    { label: "Backup (em breve)", Icon: Database },
  ];

  return (
    <>
      <button className={`fixed inset-0 z-50 cursor-default bg-slate-950/40 backdrop-blur-[1px] transition-opacity duration-300 motion-reduce:transition-none ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-label="Fechar menu" onClick={onClose} tabIndex={isOpen ? 0 : -1} aria-hidden={!isOpen} />
      <aside role="dialog" aria-modal="true" aria-label="Menu administrativo" aria-hidden={!isOpen} inert={!isOpen} className={`fixed bottom-2 right-2 z-[60] w-[min(78vw,19rem)] max-h-[75vh] overflow-y-auto rounded-3xl bg-slate-50/20 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 text-slate-900 transition-transform duration-300 ease-out motion-reduce:transition-none sm:bottom-4 sm:right-4 sm:w-[26rem] sm:max-h-[82vh] sm:px-4 sm:pt-2 ${isOpen ? "translate-y-0" : "pointer-events-none translate-y-[110%]"}`}>
        <div className="mx-auto mb-1 h-1.5 w-10 rounded-full bg-slate-300 sm:hidden" />
        <header className="mb-1 flex items-center justify-between px-2">
          <span className="text-lg font-bold tracking-wide text-white">SETORES</span>
          <button onClick={onClose} className="rounded-xl p-2 text-white transition hover:bg-white/10" title="Fechar menu" aria-label="Fechar menu"><X size={20} /></button>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {menuSetores.map((item) => {
            if (!("items" in item)) {
              const { label, href, Icon } = item;
              return <button key={href} onClick={() => navegar(href)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${pathname === href ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}><Icon size={18} />{label}</button>;
            }
            const { id, label, Icon, items } = item;
            const aberto = grupoAberto === id;
            const rotaDoGrupo = id === "designers" ? "/arte" : `/${id}`;
            return <div key={id}>
              <button onClick={() => setGrupoAberto(aberto ? null : id)} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${aberto || pathname === rotaDoGrupo ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}>
                <span className="flex items-center gap-3"><Icon size={18} />{label}</span>{aberto ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
              </button>
              {aberto && <div className="mb-1 ml-5 border-l border-blue-100 pl-3">{items.map((item) => <button key={item.href} onClick={() => navegar(item.href)} className="block w-full rounded-lg px-2 py-2 text-left text-xs font-medium text-slate-500 transition hover:bg-blue-50 hover:text-blue-700">{item.label}</button>)}</div>}
            </div>;
          })}
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <button type="button" onClick={() => setAdministracaoAberta((aberta) => !aberta)} aria-expanded={administracaoAberta} aria-controls="menu-administracao" className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${administracaoAberta ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}>
            <span className="flex items-center gap-3"><Settings size={18} />Administração</span>
            {administracaoAberta ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
          </button>
          {administracaoAberta && <div id="menu-administracao" className="mb-1 ml-5 border-l border-blue-100 pl-3">
            {administracao.map(({ label, href, Icon }) => href ? <button key={href} onClick={() => navegar(href)} className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-xs font-medium transition ${pathname === href ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"}`}><Icon size={16} />{label}</button> : <div key={label} className="flex items-center gap-3 rounded-xl px-2 py-2 text-xs font-medium text-slate-300"><Icon size={16} />{label}</div>)}
          </div>}
        </section>
      </aside>
    </>
  );
}
