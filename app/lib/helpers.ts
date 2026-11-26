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

export interface Alteracao {
  id: string;
  descricao: string;
  dataHora: string;
  solicitante: string;
  status: "pendente" | "concluida";
  concluidoPor?: string;
  concluidoEm?: string;
  respostaDesigner?: string;
}

export interface Ficha {
  id?: string;
  cliente: string;
  empresa?: string;
  email?: string;
  vendedor?: string;
  urgenciaExtrema?: boolean;
  valorTotalCentavos?: number;
  pagamentos?: { valorCentavos: number; data: string }[];
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
  alteracoes?: Alteracao[];
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

export type Costureiro = "paulo" | "celina";

export function porcentagemPedido(ficha: Ficha): number {
  const etapas = [ficha.venda, ficha.arte, ficha.exportacao, ficha.impressao, ficha.prensa, ficha.corte, ficha.costuraConcluida, ficha.conferencia, ficha.entregaStatus];
  return Math.round((etapas.filter(Boolean).length / etapas.length) * 100);
}

export function atribuicaoDoCostureiro(costureiro: Costureiro) {
  return {
    costureiroPaulo: costureiro === "paulo",
    costureiroCelina: costureiro === "celina",
  };
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

export function etapaDaFicha(ficha: Ficha): Etapa | null {
  if (ficha.entregaStatus) return null;
  if (ficha.conferencia) return "entrega";
  if (ficha.costuraConcluida) return "conferencia";
  if (ficha.costura) return "costura";
  if (ficha.corte) return "costura";
  if (ficha.prensa) return "corte";
  if (ficha.impressao) return "prensa";
  if (ficha.exportacao) return "impressao";
  if (ficha.arteAprovada) return "exportacao";
  if (ficha.alteracaoSolicitada) return "alteracaoSolicitada";
  if (ficha.arte) return "aguardandoAprovacao";
  return "arteParaCriar";
}

export function validarAlteracaoEtapa(ficha: Ficha, campo: keyof Ficha, ativar: boolean): string | null {
  const etapas: Array<{ campo: keyof Ficha; nome: string; requisito?: keyof Ficha; requisitoNome?: string }> = [
    { campo: "venda", nome: "venda" },
    { campo: "arte", nome: "arte", requisito: "venda", requisitoNome: "a venda" },
    { campo: "arteAprovada", nome: "aprovação da arte", requisito: "arte", requisitoNome: "a arte" },
    { campo: "exportacao", nome: "exportação", requisito: "arteAprovada", requisitoNome: "a aprovação da arte" },
    { campo: "impressao", nome: "impressão", requisito: "exportacao", requisitoNome: "a exportação" },
    { campo: "prensa", nome: "prensa", requisito: "impressao", requisitoNome: "a impressão" },
    { campo: "corte", nome: "corte", requisito: "prensa", requisitoNome: "a prensa" },
    { campo: "costura", nome: "envio para costura", requisito: "corte", requisitoNome: "o corte" },
    { campo: "costuraConcluida", nome: "costura concluída", requisito: "corte", requisitoNome: "o corte" },
    { campo: "conferencia", nome: "conferência", requisito: "costuraConcluida", requisitoNome: "a conclusão da costura" },
    { campo: "entregaStatus", nome: "entrega", requisito: "conferencia", requisitoNome: "a conferência" },
  ];
  const indice = etapas.findIndex((etapa) => etapa.campo === campo);
  if (indice < 0) {
    if (ativar && (campo === "envio" || campo === "retirada") && !ficha.entregaStatus) return "Conclua a entrega antes de selecionar envio ou retirada.";
    return null;
  }
  const etapa = etapas[indice];
  if (ativar && etapa.requisito && !ficha[etapa.requisito]) return `Conclua ${etapa.requisitoNome} antes de marcar ${etapa.nome}.`;
  if (ativar && campo === "arte" && ficha.alteracaoSolicitada) return "Conclua a alteração solicitada na área do designer antes de avançar.";
  if (!ativar) {
    const posteriores = etapas.slice(indice + 1).filter((item) => !(campo === "costura" && item.campo === "costuraConcluida" && !ficha.costura));
    const posterior = posteriores.find((item) => Boolean(ficha[item.campo]));
    if (posterior) return `Não é possível desfazer ${etapa.nome} enquanto ${posterior.nome} estiver concluída. Desfaça as etapas posteriores primeiro.`;
  }
  return null;
}

export type CategoriaPedido = "urgentes" | "atrasados" | "noPrazo" | "finalizados";

export function categoriaDaFicha(ficha: Ficha): CategoriaPedido {
  if (ficha.entregaStatus) {
    return "finalizados";
  }

  if (!ficha.entrega) {
    return "noPrazo";
  }

  const [ano, mes, dia] = ficha.entrega.split("-").map(Number);
  const hoje = new Date();
  const inicioDeHoje = Date.UTC(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );
  const dataDeEntrega = Date.UTC(ano, mes - 1, dia);
  const diasRestantes = Math.round(
    (dataDeEntrega - inicioDeHoje) / (1000 * 60 * 60 * 24)
  );

  if (diasRestantes < 0) {
    return "atrasados";
  }

  return diasRestantes <= 12 ? "urgentes" : "noPrazo";
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
