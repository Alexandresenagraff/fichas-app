"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  X,
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  Palette,
  Printer,
  Flame,
  Scissors,
  Shirt,
  ClipboardCheck,
  Truck,
  BarChart3,
  Settings,
  Users,
  Database,
  ClipboardList,
} from "lucide-react";
import { VENDEDORES, DESIGNERS } from "../lib/helpers";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [comercialOpen, setComercialOpen] = useState(false);
  const [designersOpen, setDesignersOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Close menus on path changes or click outside
  useEffect(() => {
    if (!isOpen) {
      // Redefine os grupos sempre que o menu é fechado.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setComercialOpen(false);
      setDesignersOpen(false);
      setAdminOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const navigateTo = (url: string) => {
    onClose();
    router.push(url);
  };

  // Structured menu items for ease of future activation
  const adminSubmenuItems = [
    {
      id: "relatorios",
      label: "Relatórios",
      icon: <BarChart3 size={12} />,
      route: "/relatorios",
      disabled: false,
    },
    {
      id: "usuarios",
      label: "Usuários (Em breve)",
      icon: <Users size={12} />,
      disabled: true,
    },
    {
      id: "configuracoes",
      label: "Configurações (Em breve)",
      icon: <Settings size={12} />,
      disabled: true,
    },
    {
      id: "backup",
      label: "Backup (Em breve)",
      icon: <Database size={12} />,
      disabled: true,
    },
    {
      id: "logs",
      label: "Logs (Em breve)",
      icon: <ClipboardList size={12} />,
      disabled: true,
    },
  ];

  return (
    <>
      {/* Backdrop to close sidebar */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-16 right-4 w-52 bg-zinc-900/95 border border-zinc-800 text-white p-3 z-50 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-[slideDown_0.2s_ease-out] scrollbar-thin scrollbar-thumb-zinc-800"
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
          <h2 className="font-bold text-zinc-400 text-xs tracking-wider uppercase">
            SETORES
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
            title="Fechar menu"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {/* COMERCIAL */}
          <div className="relative">
            <button
              onClick={() => setComercialOpen(!comercialOpen)}
              className={`w-full flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-zinc-800 ${
                comercialOpen ? "bg-zinc-800/50 text-white" : "text-zinc-300 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={14} className="text-zinc-400" />
                COMERCIAL
              </span>
              {comercialOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {comercialOpen && (
              <div className="mt-1 ml-2 pl-2 border-l border-zinc-800 space-y-1 animate-[slideDown_0.15s_ease-out]">
                <button
                  onClick={() => navigateTo("/comercial")}
                  className="block w-full text-left py-1.5 px-2 rounded-lg text-[11px] text-blue-400 hover:bg-zinc-800/40 hover:text-blue-300 font-medium transition"
                >
                  ▸ Dashboard Geral
                </button>
                {VENDEDORES.map((vendedor) => (
                  <button
                    key={vendedor}
                    onClick={() => navigateTo(`/comercial?vendedor=${vendedor}`)}
                    className="block w-full text-left py-1.5 px-2 rounded-lg text-[11px] text-zinc-400 hover:bg-zinc-800/40 hover:text-white transition"
                  >
                    ▸ {vendedor}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DESIGNERS */}
          <div className="relative">
            <button
              onClick={() => setDesignersOpen(!designersOpen)}
              className={`w-full flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-zinc-800 ${
                designersOpen ? "bg-zinc-800/50 text-white" : "text-zinc-300 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Palette size={14} className="text-zinc-400" />
                DESIGNERS
              </span>
              {designersOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {designersOpen && (
              <div className="mt-1 ml-2 pl-2 border-l border-zinc-800 space-y-1 animate-[slideDown_0.15s_ease-out]">
                <button
                  onClick={() => navigateTo("/arte")}
                  className="block w-full text-left py-1.5 px-2 rounded-lg text-[11px] text-amber-400 hover:bg-zinc-800/40 hover:text-amber-300 font-medium transition"
                >
                  ▸ Geral Arte
                </button>
                {DESIGNERS.map((designer) => (
                  <button
                    key={designer}
                    onClick={() => navigateTo(`/arte?designer=${normalizarNome(designer)}`)}
                    className="block w-full text-left py-1.5 px-2 rounded-lg text-[11px] text-zinc-400 hover:bg-zinc-800/40 hover:text-white transition"
                  >
                    ▸ {designer}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* IMPRESSÃO */}
          <button
            onClick={() => navigateTo("/impressao")}
            className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-zinc-800 ${
              pathname === "/impressao" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-zinc-300 hover:text-white"
            }`}
          >
            <Printer size={14} className={pathname === "/impressao" ? "text-cyan-400" : "text-zinc-400"} />
            IMPRESSÃO
          </button>

          {/* PRENSA */}
          <button
            onClick={() => navigateTo("/prensa")}
            className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-zinc-800 ${
              pathname === "/prensa" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-zinc-300 hover:text-white"
            }`}
          >
            <Flame size={14} className={pathname === "/prensa" ? "text-amber-400" : "text-zinc-400"} />
            PRENSA
          </button>

          {/* CORTE */}
          <button
            onClick={() => navigateTo("/corte")}
            className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-zinc-800 ${
              pathname === "/corte" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "text-zinc-300 hover:text-white"
            }`}
          >
            <Scissors size={14} className={pathname === "/corte" ? "text-orange-400" : "text-zinc-400"} />
            CORTE
          </button>

          {/* COSTURA */}
          <button
            onClick={() => navigateTo("/costura")}
            className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-zinc-800 ${
              pathname === "/costura" ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" : "text-zinc-300 hover:text-white"
            }`}
          >
            <Shirt size={14} className={pathname === "/costura" ? "text-pink-400" : "text-zinc-400"} />
            COSTURA
          </button>

          {/* CONFERÊNCIA */}
          <button
            onClick={() => navigateTo("/conferencia")}
            className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-zinc-800 ${
              pathname === "/conferencia" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "text-zinc-300 hover:text-white"
            }`}
          >
            <ClipboardCheck size={14} className={pathname === "/conferencia" ? "text-teal-400" : "text-zinc-400"} />
            CONFERÊNCIA
          </button>

          {/* ENVIO */}
          <button
            onClick={() => navigateTo("/envio")}
            className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-zinc-800 ${
              pathname === "/envio" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-300 hover:text-white"
            }`}
          >
            <Truck size={14} className={pathname === "/envio" ? "text-indigo-400" : "text-zinc-400"} />
            ENVIO / RETIRADA
          </button>

          {/* ADMINISTRAÇÃO */}
          <div className="relative">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className={`w-full flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-zinc-800 cursor-pointer ${
                adminOpen ? "bg-zinc-800/50 text-white animate-pulse-once" : "text-zinc-300 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Settings size={14} className="text-zinc-400" />
                ADMINISTRAÇÃO
              </span>
              {adminOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {adminOpen && (
              <div className="mt-1 ml-2 pl-2 border-l border-zinc-800 space-y-1 animate-[slideDown_0.15s_ease-out]">
                {adminSubmenuItems.map((item) => {
                  if (item.disabled) {
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-[11px] text-zinc-600 font-semibold cursor-not-allowed select-none opacity-50"
                        title="Em breve"
                      >
                        {item.icon}
                        {item.label}
                      </div>
                    );
                  }

                  const isSelected = pathname === item.route;
                  return (
                    <button
                      key={item.id}
                      onClick={() => item.route && navigateTo(item.route)}
                      className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-[11px] font-bold text-left transition duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-zinc-800/60 text-blue-400 border border-zinc-700/35"
                          : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
