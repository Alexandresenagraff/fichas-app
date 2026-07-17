"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import app from "../../firebase/config";

import {
  getFirestore,
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

import {
  formatarDataHora,
  etapaDaFicha,
  type Ficha,
  type Etapa,
  type HistoricoAprovacao,
} from "../lib/helpers";

const db = getFirestore(app);

type SecaoArte = "arteParaCriar" | "alteracaoSolicitada" | "aguardandoAprovacao";

function ArteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designerAtivo = searchParams.get("designer") || "";
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoArte>("arteParaCriar");

  useEffect(() => {
    setCarregando(true);
    const unsubscribe = onSnapshot(
      collection(db, "fichas"),
      (snapshot) => {
        const lista: Ficha[] = [];
        snapshot.forEach((item) => {
          const dados = item.data() as Ficha;
          if (
            dados.venda &&
            !dados.entregaStatus &&
            dados.designer
          ) {
            lista.push({ id: item.id, ...dados });
          }
        });

        lista.sort((a, b) => {
          const dateA = a.pedido ? new Date(a.pedido).getTime() : 0;
          const dateB = b.pedido ? new Date(b.pedido).getTime() : 0;
          return dateB - dateA;
        });

        setFichas(lista);
        setCarregando(false);
      },
      (error) => {
        console.log(error);
        setCarregando(false);
      }
    );
    return () => unsubscribe();
  }, []);

  function estaAtrasado(ficha: Ficha): boolean {
    if (!ficha.entrega || ficha.arte) return false;
    const [ano, mes, dia] = ficha.entrega.split("-").map(Number);
    const hoje = new Date();
    const inicioDeHoje = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dataEntrega = Date.UTC(ano, mes - 1, dia);
    return dataEntrega < inicioDeHoje;
  }

  async function concluirArte(id: string) {
    try {
      const fichaRef = doc(db, "fichas", id);
      const arteData = formatarDataHora();
      await updateDoc(fichaRef, {
        arte: true,
        arteAprovada: true,
        exportacao: false,
        arteData,
      });
    } catch (error) {
      console.log(error);
      alert("Erro ao atualizar");
    }
  }

  async function concluirAlteracao(ficha: Ficha) {
    if (!ficha.id) return;

    try {
      const fichaRef = doc(db, "fichas", ficha.id);
      const arteData = formatarDataHora();

      const novaMensagem: HistoricoAprovacao = {
        dataHora: arteData,
        autor: ficha.designer || "Designer",
        mensagem: "Alteração concluída.",
        tipo: "resposta",
      };

      const historico = ficha.historicoAprovacao || [];

      await updateDoc(fichaRef, {
        arte: true,
        alteracaoSolicitada: false,
        arteData,
        historicoAprovacao: [...historico, novaMensagem],
      });
    } catch (error) {
      console.log(error);
      alert("Erro ao atualizar");
    }
  }

  async function desfazerArte(id: string) {
    try {
      const fichaRef = doc(db, "fichas", id);
      await updateDoc(fichaRef, { arte: false, arteData: "" });
    } catch (error) {
      console.log(error);
      alert("Erro ao atualizar");
    }
  }

  const fichasFiltradas = fichas.filter((ficha) => {
    const matchBusca = ficha.cliente?.toLowerCase().includes(busca.toLowerCase());
    const matchDesigner = !designerAtivo || ficha.designer?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === designerAtivo;
    return matchBusca && matchDesigner;
  });

  const arteParaCriar = fichasFiltradas.filter((f) => etapaDaFicha(f) === "arteParaCriar");
  const alteracaoSolicitada = fichasFiltradas.filter((f) => etapaDaFicha(f) === "alteracaoSolicitada");
  const aguardandoAprovacao = fichasFiltradas.filter((f) => etapaDaFicha(f) === "aguardandoAprovacao");

  const secoes: { id: SecaoArte; label: string; lista: Ficha[]; cor: string }[] = [
    { id: "arteParaCriar", label: "ARTE P/ CRIAR", lista: arteParaCriar, cor: "text-amber-400" },
    { id: "alteracaoSolicitada", label: "ALTERAÇÃO SOLICITADA", lista: alteracaoSolicitada, cor: "text-red-400" },
    { id: "aguardandoAprovacao", label: "AGUARDANDO APROVAÇÃO", lista: aguardandoAprovacao, cor: "text-yellow-400" },
  ];

  function renderSecao(ficha: Ficha) {
    const etapa = etapaDaFicha(ficha);

    return (
      <div
        key={ficha.id}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg"
      >
        <div className="flex items-start justify-between mb-3">
          <p className="text-xl font-bold uppercase break-words flex-1">
            {ficha.cliente}
          </p>
          {estaAtrasado(ficha) && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ml-2">
              ATRASADO
            </span>
          )}
        </div>

        {ficha.designer && (
          <p className="text-sm text-zinc-400 mb-2">
            Designer: <span className="text-white font-semibold">{ficha.designer}</span>
          </p>
        )}

        {ficha.vendedor && (
          <p className="text-sm text-zinc-400 mb-2">
            Vendedor: <span className="text-white font-semibold">{ficha.vendedor}</span>
          </p>
        )}

        {ficha.pedido && (
          <p className="text-sm text-zinc-400 mb-2">
            Data: <span className="text-white font-semibold">{ficha.pedido.split("-").reverse().join("/")}</span>
          </p>
        )}

        {ficha.entrega && (
          <p className="text-sm text-zinc-400 mb-2">
            Entrega: <span className="text-white font-semibold">{ficha.entrega.split("-").reverse().join("/")}</span>
          </p>
        )}

        {ficha.observacao && (
          <p className="text-sm text-zinc-500 mb-4 break-words">
            Obs: {ficha.observacao}
          </p>
        )}

        {ficha.historicoAprovacao && ficha.historicoAprovacao.length > 0 && (
          <div className="bg-black/50 rounded-xl p-3 mb-4 space-y-2 max-h-48 overflow-y-auto">
            {ficha.historicoAprovacao.map((item, index) => (
              <div key={index} className="text-xs border-l-2 border-zinc-600 pl-2">
                <p className="text-zinc-500 mb-0.5">
                  {item.dataHora} — {item.autor}
                </p>
                <p className="text-zinc-200">{item.mensagem}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-4">
          {ficha.pdfLink ? (
            <a
              href={ficha.pdfLink}
              target="_blank"
              className="block bg-blue-800 hover:bg-blue-900 transition text-center rounded-xl p-3 text-sm font-bold"
            >
              📄 VER MOLDE (PDF)
            </a>
          ) : (
            <p className="text-xs text-zinc-600 text-center bg-zinc-900 rounded-xl p-3">
              Molde ainda não disponível
            </p>
          )}
        </div>

        {etapa === "arteParaCriar" && (
          <button
            onClick={() => concluirArte(ficha.id || "")}
            className="w-full bg-lime-600 hover:bg-lime-700 transition rounded-xl py-3 text-sm font-bold"
          >
            ✅ ARTE APROVADA
          </button>
        )}

        {etapa === "alteracaoSolicitada" && (
          <button
            onClick={() => concluirAlteracao(ficha)}
            className="w-full bg-red-600 hover:bg-red-700 transition rounded-xl py-3 text-sm font-bold"
          >
            ✅ ALTERAÇÃO CONCLUÍDA
          </button>
        )}

        {etapa === "aguardandoAprovacao" && (
          <button
            onClick={() => desfazerArte(ficha.id || "")}
            className="w-full bg-zinc-800 hover:bg-zinc-700 transition rounded-xl py-2 text-xs font-medium text-zinc-400"
          >
            DESFAZER
          </button>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-3">
      <div className="max-w-md mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5 mt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/fichas")}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition text-lg"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold">ARTE</h1>
              <p className="text-zinc-400 text-xs">
                {designerAtivo ? `Designer: ${designerAtivo}` : "Aprovação de arte"}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/fichas")}
            className="bg-blue-600 hover:bg-blue-700 transition rounded-full px-4 py-2 text-sm font-bold"
          >
            + Novo
          </button>
        </div>

        {/* PESQUISA */}
        <div className="bg-zinc-900 rounded-2xl p-3 mb-4 border border-zinc-800 relative">
          <input
            type="text"
            placeholder="🔎 Pesquisar Cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-xl p-3 pr-10 text-sm text-white placeholder-zinc-500 outline-none"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-sm"
              title="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        {/* ABAS */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {secoes.map((secao) => {
            const ativo = secaoAtiva === secao.id;
            return (
              <button
                key={secao.id}
                onClick={() => setSecaoAtiva(secao.id)}
                className={`rounded-xl py-2.5 text-[10px] font-bold transition text-center ${
                  ativo
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {secao.label}
                <span className={`block text-xs mt-0.5 ${ativo ? "text-white" : secao.cor}`}>
                  ({secao.lista.length})
                </span>
              </button>
            );
          })}
        </div>

        {/* LISTA */}
        <div className="space-y-3">
          {carregando ? (
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center text-zinc-400">
              Carregando pedidos...
            </div>
          ) : secoes.find((s) => s.id === secaoAtiva)?.lista.length ? (
            secoes
              .find((s) => s.id === secaoAtiva)
              ?.lista.map((ficha) => renderSecao(ficha))
          ) : (
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center text-zinc-400">
              {busca
                ? "Nenhum cliente encontrado"
                : `Nenhum pedido em ${secoes.find((s) => s.id === secaoAtiva)?.label}`}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function Arte() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black text-white p-3"><div className="max-w-md mx-auto"><p className="text-zinc-400 text-center mt-12">Carregando...</p></div></main>}>
      <ArteContent />
    </Suspense>
  );
}
