"use client";

import { useState } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import type { DetalhesComanda as DadosComanda } from "../lib/helpers";
import { processarItensComanda, type ItemComandaRascunho } from "../lib/itensComanda";

export function novaComanda(): DadosComanda {
  return { modelagens: [], tecidos: [], acabamentos: [], golas: [], outroTecido: "" };
}

const grupos = [
  { chave: "modelagens", titulo: "Modelagem", opcoes: ["Padrão", "Slim", "Regata", "G. Polo", "M. longa"] },
  { chave: "tecidos", titulo: "Tecido", opcoes: ["Texturizado", "Dry fit liso", "Performance dry", "PP algodão", "Outro"] },
  { chave: "acabamentos", titulo: "Acabamento", opcoes: ["Patch", "Punho", "Forro reb.", "Selo ouro"] },
  { chave: "golas", titulo: "Gola", opcoes: ["Gola V", "Gola U", "G. Polo", "Polo (V)"] },
] as const;

export default function DetalhesComanda({ valor, onChange, linhas, onLinhasChange, mostrarValores = false }: { valor?: DadosComanda; onChange?: (valor: DadosComanda) => void; linhas?: ItemComandaRascunho[]; onLinhasChange?: (linhas: ItemComandaRascunho[]) => void; mostrarValores?: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [descricaoAberta, setDescricaoAberta] = useState(false);
  const [modelagemAberta, setModelagemAberta] = useState(false);
  const dados = valor || novaComanda();
  const editavel = Boolean(onChange);
  const possuiDados = grupos.some(({ chave }) => (dados[chave] || []).length > 0) || Boolean(dados.outroTecido?.trim()) || Boolean(dados.itens?.length);
  const resultado = processarItensComanda(linhas || []);

  function alternar(chave: typeof grupos[number]["chave"], opcao: string) {
    if (!onChange) return;
    const atuais = dados[chave] || [];
    const selecionados = atuais.includes(opcao) ? atuais.filter((item) => item !== opcao) : [...atuais, opcao];
    onChange({ ...dados, [chave]: selecionados, ...(chave === "tecidos" && opcao === "Outro" && !selecionados.includes("Outro") ? { outroTecido: "" } : {}) });
  }

  function adicionarLinha() {
    onLinhasChange?.([...(linhas || []), { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, quantidade: "", descricao: "", valorUnitario: "" }]);
    setDescricaoAberta(true);
  }

  return <section className="@container rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200">
    <button type="button" onClick={() => setAberto((atual) => !atual)} aria-expanded={aberto} className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 text-left text-xs font-bold ${editavel ? "border border-sky-300/30 bg-sky-300/20 text-sky-100 hover:bg-sky-300/30" : ""}`}>
      <span>{editavel ? "DESCREVER COMANDA" : "DETALHES DA COMANDA"}</span>{aberto ? <EyeOff size={17} aria-label="Recolher detalhes" /> : <Eye size={17} aria-label="Visualizar detalhes" />}
    </button>
    {aberto && <div className="space-y-2 border-t border-zinc-700 p-3">
      {!editavel && !possuiDados && <p className="text-xs text-zinc-400">Nenhum detalhe informado nesta comanda.</p>}
      {editavel && onLinhasChange && <div>
        {!descricaoAberta && !(linhas || []).length ? <button type="button" onClick={adicionarLinha} className="flex min-h-10 items-center gap-1 text-xs font-bold text-blue-300"><Plus size={15} /> INSERIR DESCRIÇÃO</button> : <>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-blue-300">Descrição dos itens</p>
          <div className="space-y-2">{(linhas || []).map((linha, indice) => <div key={linha.id} className="rounded-lg border border-zinc-700 bg-black/30 p-2">
            <div className="flex items-end gap-2">
              <label className="w-16 shrink-0 text-[10px] text-zinc-400">Qtd.<input type="text" inputMode="numeric" value={linha.quantidade} onChange={(event) => onLinhasChange(linhas!.map((item) => item.id === linha.id ? { ...item, quantidade: event.target.value } : item))} className="mt-1 h-10 w-full rounded-lg border border-zinc-700 bg-black px-2 text-xs text-white" /></label>
              <label className="min-w-0 flex-1 text-[10px] text-zinc-400">Valor unitário (opcional)<input type="text" inputMode="decimal" placeholder="R$ 0,00" value={linha.valorUnitario} onChange={(event) => onLinhasChange(linhas!.map((item) => item.id === linha.id ? { ...item, valorUnitario: event.target.value } : item))} className="mt-1 h-10 w-full rounded-lg border border-zinc-700 bg-black px-2 text-xs text-white" /></label>
              <button type="button" onClick={() => onLinhasChange(linhas!.filter((item) => item.id !== linha.id))} aria-label={`Remover linha ${indice + 1}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-red-300"><Trash2 size={16} /></button>
            </div>
            <label className="mt-1 block text-[10px] text-zinc-400">Descrição<textarea rows={2} value={linha.descricao} onChange={(event) => onLinhasChange(linhas!.map((item) => item.id === linha.id ? { ...item, descricao: event.target.value } : item))} placeholder="Ex.: Blusa M masc., Ícaro nº 10" className="mt-1 block w-full resize-y rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-xs text-white" /></label>
          </div>)}</div>
          <button type="button" onClick={adicionarLinha} className="mt-1 flex min-h-10 items-center gap-1 text-xs font-bold text-blue-300"><Plus size={15} /> ADICIONAR LINHA</button>
          {(linhas || []).length > 0 && !resultado.erro && resultado.soma === null && <p className="text-xs text-zinc-400">Sem todos os valores unitários, informe o total do pedido manualmente.</p>}
          {resultado.soma !== null && <p className="text-xs text-zinc-300">Soma dos itens: <strong>{(resultado.soma / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></p>}
        </>}
      </div>}
      {!editavel && Boolean(dados.itens?.length) && <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-blue-300">Descrição dos itens</p>
        <ul className="space-y-1">{dados.itens!.map((item, indice) => <li key={indice} className="rounded-lg bg-black/30 px-2 py-1.5 text-xs text-zinc-200"><span className="font-bold">{item.quantidade} × </span><span className="whitespace-pre-wrap break-words">{item.descricao}</span>{mostrarValores && item.valorUnitarioCentavos != null && <span className="block text-zinc-400">Unitário: {(item.valorUnitarioCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>}</li>)}</ul>
      </div>}
      <section className="rounded-lg border border-zinc-700 bg-zinc-950/50">
        <button type="button" onClick={() => setModelagemAberta((atual) => !atual)} aria-expanded={modelagemAberta} className="flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left text-xs font-bold text-zinc-200">
          <span>MODELAGEM, TECIDO E ACABAMENTO</span>{modelagemAberta ? <EyeOff size={16} aria-label="Recolher opções" /> : <Eye size={16} aria-label="Visualizar opções" />}
        </button>
        {modelagemAberta && <div className="border-t border-zinc-700 p-2">
          {editavel && <p className="mb-2 text-xs text-zinc-400">Marque todas as opções que se aplicam ao pedido.</p>}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 @lg:grid-cols-4">
            {grupos.map(({ chave, titulo, opcoes }) => <fieldset key={chave} className="min-w-0">
              <legend className="mb-1 text-[10px] font-bold uppercase tracking-wide text-blue-300">{titulo}</legend>
              {opcoes.map((opcao) => <label key={opcao} className={`flex min-h-7 items-center gap-1.5 text-xs ${editavel ? "cursor-pointer" : ""}`}>
                <input type="checkbox" aria-label={opcao} checked={(dados[chave] || []).includes(opcao)} onChange={() => alternar(chave, opcao)} disabled={!editavel} className="h-4 w-4 shrink-0 accent-blue-500" />
                <span className="min-w-0">{opcao === "Performance dry" ? "Perfor. Dry" : opcao === "PP algodão" ? "PP alg." : opcao}</span>
              </label>)}
              {chave === "tecidos" && (dados.tecidos || []).includes("Outro") && (editavel
                ? <label className="mt-1 block text-xs text-zinc-400">Qual tecido?<input type="text" value={dados.outroTecido || ""} onChange={(event) => onChange?.({ ...dados, outroTecido: event.target.value })} className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-2 py-2 text-xs text-white" /></label>
                : dados.outroTecido?.trim() && <p className="mt-1 break-words text-xs text-zinc-300">{dados.outroTecido}</p>)}
            </fieldset>)}
          </div>
        </div>}
      </section>
    </div>}
  </section>;
}
