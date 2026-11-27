"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { DetalhesComanda as DadosComanda } from "../lib/helpers";

export function novaComanda(): DadosComanda {
  return { modelagens: [], tecidos: [], acabamentos: [], golas: [], outroTecido: "" };
}

const grupos = [
  { chave: "modelagens", titulo: "Modelagem", opcoes: ["Padrão", "Slim", "Regata", "G. Polo", "M. longa"] },
  { chave: "tecidos", titulo: "Tecido", opcoes: ["Texturizado", "Dry fit liso", "Performance dry", "PP algodão", "Outro"] },
  { chave: "acabamentos", titulo: "Acabamento", opcoes: ["Patch", "Punho", "Forro reb.", "Selo ouro"] },
  { chave: "golas", titulo: "Gola", opcoes: ["Gola V", "Gola U", "G. Polo", "Polo (V)"] },
] as const;

export default function DetalhesComanda({ valor, onChange }: { valor?: DadosComanda; onChange?: (valor: DadosComanda) => void }) {
  const [aberto, setAberto] = useState(false);
  const dados = valor || novaComanda();
  const editavel = Boolean(onChange);
  const possuiDados = grupos.some(({ chave }) => (dados[chave] || []).length > 0) || Boolean(dados.outroTecido?.trim());

  function alternar(chave: typeof grupos[number]["chave"], opcao: string) {
    if (!onChange) return;
    const atuais = dados[chave] || [];
    const selecionados = atuais.includes(opcao) ? atuais.filter((item) => item !== opcao) : [...atuais, opcao];
    onChange({ ...dados, [chave]: selecionados, ...(chave === "tecidos" && opcao === "Outro" && !selecionados.includes("Outro") ? { outroTecido: "" } : {}) });
  }

  return <section className="rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200">
    <button type="button" onClick={() => setAberto((atual) => !atual)} aria-expanded={aberto} className="flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left text-xs font-bold">
      <span>DETALHES DA COMANDA</span>{aberto ? <EyeOff size={17} aria-label="Recolher detalhes" /> : <Eye size={17} aria-label="Visualizar detalhes" />}
    </button>
    {aberto && <div className="space-y-3 border-t border-zinc-700 p-3">
      {editavel && <p className="text-xs text-zinc-400">Marque todas as opções que se aplicam ao pedido.</p>}
      {!editavel && !possuiDados ? <p className="text-xs text-zinc-400">Nenhum detalhe informado nesta comanda.</p> : <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4">
        {grupos.map(({ chave, titulo, opcoes }) => <fieldset key={chave} className="min-w-0">
          <legend className="mb-1 text-[10px] font-bold uppercase tracking-wide text-blue-300">{titulo}</legend>
          {opcoes.map((opcao) => <label key={opcao} className={`flex min-h-8 items-center gap-2 text-xs ${editavel ? "cursor-pointer" : ""}`}>
            <input type="checkbox" checked={(dados[chave] || []).includes(opcao)} onChange={() => alternar(chave, opcao)} disabled={!editavel} className="h-4 w-4 shrink-0 accent-blue-500" />
            <span>{opcao}</span>
          </label>)}
          {chave === "tecidos" && (dados.tecidos || []).includes("Outro") && (editavel
            ? <label className="mt-1 block text-xs text-zinc-400">Qual tecido?<input type="text" value={dados.outroTecido || ""} onChange={(event) => onChange?.({ ...dados, outroTecido: event.target.value })} className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-2 py-2 text-xs text-white" /></label>
            : dados.outroTecido?.trim() && <p className="mt-1 break-words text-xs text-zinc-300">{dados.outroTecido}</p>)}
        </fieldset>)}
      </div>}
    </div>}
  </section>;
}
