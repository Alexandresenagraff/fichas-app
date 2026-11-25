"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, House, ListTodo, Menu, UserRound } from "lucide-react";
import Sidebar from "./Sidebar";

const primaryItems = [
  { label: "Início", href: "/inicio", Icon: House },
  { label: "Pedidos", href: "/fichas", Icon: ClipboardList },
  { label: "Pendências", href: "/pendencias", Icon: ListTodo },
  { label: "Acesso VIP", href: "/", Icon: UserRound },
];

export default function AdminNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <nav
        aria-label="Navegação administrativa principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pt-1 shadow-[0_-10px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl [padding-bottom:max(0.25rem,env(safe-area-inset-bottom))] sm:pt-2 sm:[padding-bottom:max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1">
          {primaryItems.map(({ label, href, Icon }) => {
            const ativo = pathname === href;
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-semibold transition-all active:scale-95 sm:min-h-14 sm:gap-1 ${
                  ativo ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                }`}
                aria-current={ativo ? "page" : undefined}
              >
                <Icon size={19} strokeWidth={ativo ? 2.5 : 2} />
                <span>{label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setMenuAberto(true)}
            className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-semibold text-slate-500 transition-all hover:bg-slate-100 hover:text-blue-700 active:scale-95 sm:min-h-14 sm:gap-1"
            aria-label="Abrir menu de setores"
          >
            <Menu size={20} />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
    </>
  );
}
