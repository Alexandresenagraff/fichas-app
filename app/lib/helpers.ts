export type Etapa =
  | "arteParaCriar"
  | "aguardandoAprovacao"
  | "alteracaoSolicitada"
  | "exportacao"
  | "impressao"
  | "prensa"
  | "corte"
  | "costura"
  | "conferencia"
  | "entrega";

export interface HistoricoAprovacao {
  dataHora: string;
  autor: string;
  mensagem: string;
  tipo: "alteracao" | "resposta" | "aprovacao";
}

export interface Ficha {
  id?: string;
  cliente: string;
  email?: string;
  vendedor?: string;
  observacao?: string;
  designer?: string;
  pedido?: string;
  entrega?: string;
  pdfLink?: string;
  venda: boolean;
  vendaData?: string;
  arte: boolean;
  arteData?: string;
  arteAprovada?: boolean;
  alteracaoSolicitada?: boolean;
  historicoAprovacao?: HistoricoAprovacao[];
  exportacao: boolean;
  exportacaoData?: string;
  impressao: boolean;
  impressaoData?: string;
  prensa: boolean;
  prensaData?: string;
  corte: boolean;
  corteData?: string;
  costura: boolean;
  costuraData?: string;
  costureiroPaulo: boolean;
  costureiroCelina: boolean;
  costuraConcluida: boolean;
  conferencia: boolean;
  conferenciaData?: string;
  entregaStatus: boolean;
  entregaData?: string;
  envio: boolean;
  retirada: boolean;
  criadoEm?: Date;
}

export function formatarDataHora(): string {
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, "0");
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const ano = agora.getFullYear();
  const horas = String(agora.getHours()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

export function etapaDaFicha(ficha: Ficha): Etapa {
  if (ficha.entregaStatus) return "entrega";
  if (ficha.conferencia) return "conferencia";
  if (ficha.costuraConcluida) return "conferencia";
  if (ficha.costura) return "costura";
  if (ficha.corte) return "corte";
  if (ficha.prensa) return "prensa";
  if (ficha.impressao) return "impressao";
  if (ficha.exportacao || ficha.arteAprovada) return "exportacao";
  if (ficha.alteracaoSolicitada) return "alteracaoSolicitada";
  if (ficha.arte) return "aguardandoAprovacao";
  return "arteParaCriar";
}

export const VENDEDORES = [
  "PALOMA",
  "MIKELLY",
  "LARISSA",
  "JEFFERSON",
  "JANIELLY",
  "ROSE",
  "CÉSAR",
  "GRAÇA",
  "KELLY",
];

export const DESIGNERS = [
  "ALEXANDRE",
  "LÁZARO",
  "EDIVAN",
  "PAULÃO",
  "DIEGO",
];

export interface EtapaConfig {
  id: Etapa;
  label: string;
  ativo: string;
  inativo: string;
}

export const ETAPAS: EtapaConfig[] = [
  { id: "arteParaCriar", label: "ARTE P/ CRIAR", ativo: "bg-blue-500 text-white", inativo: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" },
  { id: "aguardandoAprovacao", label: "AGUARDANDO APROVAÇÃO", ativo: "bg-yellow-500 text-white", inativo: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" },
  { id: "alteracaoSolicitada", label: "ALTERAÇÃO SOLICITADA", ativo: "bg-red-500 text-white", inativo: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" },
  { id: "exportacao", label: "EXPORTAÇÃO", ativo: "bg-indigo-500 text-white", inativo: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" },
  { id: "impressao", label: "IMPRESSÃO", ativo: "bg-cyan-500 text-white", inativo: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" },
  { id: "prensa", label: "PRENSA", ativo: "bg-amber-500 text-white", inativo: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" },
  { id: "corte", label: "CORTE", ativo: "bg-orange-500 text-white", inativo: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" },
  { id: "costura", label: "COSTURA", ativo: "bg-pink-500 text-white", inativo: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" },
  { id: "conferencia", label: "CONFERÊNCIA", ativo: "bg-teal-500 text-white", inativo: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" },
  { id: "entrega", label: "ENTREGA", ativo: "bg-green-500 text-white", inativo: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" },
];
