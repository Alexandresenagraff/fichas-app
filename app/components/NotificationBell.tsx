"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Bell } from "lucide-react";

import app from "../../firebase/config";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { Ficha, Alteracao, etapaDaFicha } from "../lib/helpers";

const db = getFirestore(app);

interface NotificacaoItem {
  fichaId: string;
  cliente: string;
  solicitante: string;
  data: string;
  descricao: string;
}

function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export default function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const designerParam = searchParams.get("designer") || "";
  const vendedorParam = searchParams.get("vendedor") || "";

  // Escutar alterações pendentes em tempo real
  useEffect(() => {
    const designerFiltrado = designerParam ? normalizarNome(designerParam) : "";
    const vendedorFiltrado = vendedorParam ? normalizarNome(vendedorParam) : "";

    const unsubscribe = onSnapshot(
      collection(db, "fichas"),
      (snapshot) => {
        const lista: NotificacaoItem[] = [];
        snapshot.forEach((docSnap) => {
          const ficha = docSnap.data() as Ficha;
          ficha.id = docSnap.id;

          const fichaDesignerNorm = ficha.designer ? normalizarNome(ficha.designer) : "";
          const fichaVendedorNorm = ficha.vendedor ? normalizarNome(ficha.vendedor) : "";

          const isArtePage = pathname.includes("/arte");
          const isComercialPage = pathname.includes("/comercial");

          if (isArtePage) {
            // DESIGNERS: Exibe alterações solicitadas (status = pendente)
            // Filtra por designer selecionado na página, se houver parâmetro
            if (designerFiltrado && fichaDesignerNorm !== designerFiltrado) {
              return;
            }

            if (ficha.alteracaoSolicitada) {
              const pendentes = ficha.alteracoes?.filter((alt) => alt.status === "pendente");
              
              if (pendentes && pendentes.length > 0) {
                pendentes.forEach((alt) => {
                  lista.push({
                    fichaId: ficha.id || "",
                    cliente: ficha.cliente,
                    solicitante: alt.solicitante,
                    data: alt.dataHora,
                    descricao: alt.descricao,
                  });
                });
              } else {
                // Fallback para histórico legado
                const lastAlteracao = ficha.historicoAprovacao
                  ?.filter((h) => h.tipo === "alteracao")
                  .pop();

                lista.push({
                  fichaId: ficha.id || "",
                  cliente: ficha.cliente,
                  solicitante: lastAlteracao?.autor || ficha.vendedor || "Vendedor",
                  data: lastAlteracao?.dataHora || "",
                  descricao: lastAlteracao?.mensagem || "Alteração solicitada",
                });
              }
            }
          } else if (isComercialPage) {
            // VENDEDORES: Exibe fichas em "Aguardando Aprovação"
            // Filtra por vendedor selecionado na página, se houver parâmetro
            if (vendedorFiltrado && fichaVendedorNorm !== vendedorFiltrado) {
              return;
            }

            if (etapaDaFicha(ficha) === "aguardandoAprovacao") {
              // Pega a última alteração resolvida do histórico para mostrar a resposta do designer, se houver
              const lastConcluida = ficha.alteracoes
                ?.filter((alt) => alt.status === "concluida")
                .sort((a, b) => b.dataHora.localeCompare(a.dataHora))[0];

              lista.push({
                fichaId: ficha.id || "",
                cliente: ficha.cliente,
                solicitante: ficha.designer || "Designer",
                data: lastConcluida?.concluidoEm || ficha.arteData || "",
                descricao: lastConcluida?.respostaDesigner
                  ? `Alteração concluída: "${lastConcluida.respostaDesigner}"`
                  : "Arte finalizada e enviada para aprovação.",
              });
            }
          }
        });

        // Ordenar as notificações das mais novas para as mais antigas
        lista.sort((a, b) => {
          return b.data.localeCompare(a.data);
        });

        setNotificacoes(lista);
      },
      (error) => {
        console.error("Erro no onSnapshot do NotificationBell:", error);
      }
    );

    return () => unsubscribe();
  }, [pathname, designerParam, vendedorParam]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPendentes = notificacoes.length;

  const handleNotificacaoClick = (fichaId: string) => {
    setDropdownAberto(false);
    
    let baseRoute = "/fichas";
    if (pathname.includes("/arte")) {
      baseRoute = "/arte";
    } else if (pathname.includes("/comercial")) {
      baseRoute = "/comercial";
    }

    // Mantém os parâmetros de designer/vendedor se existirem
    let queryParams = `?fichaId=${fichaId}`;
    if (pathname.includes("/arte") && designerParam) {
      queryParams += `&designer=${designerParam}`;
    } else if (pathname.includes("/comercial") && vendedorParam) {
      queryParams += `&vendedor=${vendedorParam}`;
    }

    router.push(`${baseRoute}${queryParams}`);
  };

  const isArtePage = pathname.includes("/arte");
  const dropdownTitle = isArtePage ? "ALTERAÇÕES PENDENTES" : "ARTES P/ APROVAR";
  const emptyText = isArtePage ? "Nenhuma alteração pendente" : "Nenhuma arte aguardando aprovação";
  const subTextLabel = isArtePage ? "Solicitado por" : "Designer";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do Sino */}
      <button
        onClick={() => setDropdownAberto(!dropdownAberto)}
        className="relative text-zinc-300 hover:text-white p-2.5 bg-zinc-900/90 border border-zinc-800 hover:bg-zinc-800 active:scale-95 transition-all duration-200 rounded-xl cursor-pointer shadow-lg flex items-center justify-center"
        title="Notificações"
      >
        <Bell size={22} className={totalPendentes > 0 ? "animate-[swing_1.5s_ease-in-out_infinite]" : ""} />
        
        {/* Badge vermelho no estilo WhatsApp/Facebook */}
        {totalPendentes > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center border border-black shadow-md animate-pulse">
            {totalPendentes}
          </span>
        )}
      </button>

      {/* Dropdown de Notificações */}
      {dropdownAberto && (
        <div className="absolute right-0 mt-2.5 w-80 bg-zinc-950/95 border border-zinc-800/80 backdrop-blur-md rounded-2xl shadow-2xl z-50 overflow-hidden animate-[slideDown_0.2s_ease-out]">
          <div className="p-3.5 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between">
            <span className="font-extrabold text-xs tracking-wider uppercase text-zinc-400">
              {dropdownTitle}
            </span>
            {totalPendentes > 0 && (
              <span className="bg-red-500/10 text-red-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                {totalPendentes} item{totalPendentes > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 divide-y divide-zinc-900/50">
            {totalPendentes > 0 ? (
              notificacoes.map((item, index) => {
                const dataExibicao = item.data.split(" ")[0] || "";
                
                return (
                  <button
                    key={`${item.fichaId}-${index}`}
                    onClick={() => handleNotificacaoClick(item.fichaId)}
                    className="w-full text-left p-3.5 hover:bg-zinc-900/60 active:bg-zinc-900 transition-all duration-155 flex flex-col gap-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-white uppercase truncate flex-1">
                        {item.cliente}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-semibold flex-shrink-0">
                        {dataExibicao}
                      </span>
                    </div>

                    <div className="text-[10px] text-zinc-400">
                      {subTextLabel}: <span className="text-zinc-300 font-medium">{item.solicitante}</span>
                    </div>

                    <p className="text-xs text-zinc-400 mt-1 break-words line-clamp-2 italic bg-black/30 px-2 py-1.5 rounded-lg border border-zinc-900/40">
                      "{item.descricao}"
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs font-medium">
                {emptyText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
