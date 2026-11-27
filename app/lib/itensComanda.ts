import type { ItemComanda } from "./helpers";

export interface ItemComandaRascunho {
  id: string;
  quantidade: string;
  descricao: string;
  valorUnitario: string;
}

export function valorEmCentavos(valor: string): number {
  const texto = valor.trim();
  if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(texto)) return Math.round(Number(texto.replace(/\./g, "").replace(",", ".")) * 100);
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(texto)) return NaN;
  return Math.round(Number(texto.replace(",", ".")) * 100);
}

export function processarItensComanda(linhas: ItemComandaRascunho[]): { itens: ItemComanda[]; soma: number | null; erro: string | null } {
  const itens: ItemComanda[] = [];
  let soma = 0;
  let todosComPreco = linhas.length > 0;
  for (const linha of linhas) {
    const quantidadeTexto = linha.quantidade.trim();
    const quantidade = Number(quantidadeTexto);
    const descricao = linha.descricao.trim();
    if (!/^\d+$/.test(quantidadeTexto) || !Number.isSafeInteger(quantidade) || quantidade <= 0 || !descricao) {
      return { itens: [], soma: null, erro: "Preencha a quantidade e a descrição de cada linha ou remova a linha vazia." };
    }
    const precoTexto = linha.valorUnitario.trim();
    if (!precoTexto) {
      todosComPreco = false;
      itens.push({ quantidade, descricao });
      continue;
    }
    const preco = valorEmCentavos(precoTexto);
    if (!Number.isSafeInteger(preco) || preco < 0 || !Number.isSafeInteger(quantidade * preco) || !Number.isSafeInteger(soma + quantidade * preco)) {
      return { itens: [], soma: null, erro: "Confira o valor unitário e a quantidade de cada linha." };
    }
    soma += quantidade * preco;
    itens.push({ quantidade, descricao, valorUnitarioCentavos: preco });
  }
  return { itens, soma: todosComPreco ? soma : null, erro: null };
}
