"use client";

import { useEffect, useState } from "react";

import app from "../../firebase/config";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const db = getFirestore(app);

export default function Home() {

  const [cliente, setCliente] = useState("");
  const [email, setEmail] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [designer, setDesigner] = useState("");
  const [pedido, setPedido] = useState("");
  const [entrega, setEntrega] = useState("");

  const [busca, setBusca] = useState("");
  const [fichas, setFichas] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState("");

  const [menuAberto, setMenuAberto] = useState(false);
const [designersAberto, setDesignersAberto] = useState(false);

const [editCliente, setEditCliente] = useState("");
const [editEmail, setEditEmail] = useState("");
const [editVendedor, setEditVendedor] = useState("");
const [editObservacao, setEditObservacao] = useState("");
const [editDesigner, setEditDesigner] = useState("");
const [editPedido, setEditPedido] = useState("");
const [editEntrega, setEditEntrega] = useState("");

  async function salvarFicha() {

    if (!cliente) {
      alert("Digite o nome do cliente");
      return;
    }

    try {

      await addDoc(collection(db, "fichas"), {
  cliente,
  email,
  vendedor,
  observacao,
  designer,
  pedido,
  entrega,

  pdfLink: "",

        venda: false,
        arte: false,
        exportacao: false,
        impressao: false,
        prensa: false,
        corte: false,
        costura: false,

costureiroPaulo: false,
costureiroCelina: false,

costuraConcluida: false,

conferencia: false,

        entregaStatus: false,
        envio: false,
        retirada: false,

        criadoEm: new Date(),
      });

      alert("Ficha salva!");

      setCliente("");
setEmail("");
setVendedor("");
setObservacao("");
setDesigner("");
setPedido("");
setEntrega("");

    } catch (error) {

      console.log(error);

      alert("Erro ao salvar");
    }
  }

 async function pesquisarFichas(nome: string) {

  if (!nome.trim()) {
    setFichas([]);
    return;
  }

  try {

    const fichasRef = collection(db, "fichas");

    const querySnapshot = await getDocs(fichasRef);

    const lista: any[] = [];

    querySnapshot.forEach((item) => {

      const dados = item.data();

      if (
        dados.cliente
          ?.toLowerCase()
          .includes(nome.toLowerCase())
      ) {

        lista.push({
          id: item.id,
          ...dados,
        });

      }

    });

    setFichas(lista);

  } catch (error) {

    console.log(error);

    alert("Erro ao pesquisar fichas");
  }
}

  async function alterarStatus(
    id: string,
    campo: string,
    valorAtual: boolean
  ) {

    try {

      const fichaRef = doc(db, "fichas", id);

      await updateDoc(fichaRef, {
        [campo]: !valorAtual,
      });

      setFichas((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, [campo]: !valorAtual }
            : item
        )
      );

    } catch (error) {

      console.log(error);

      alert("Erro ao atualizar");
    }
  }

  async function salvarPdfLink(
    id: string,
    link: string
  ) {

    try {

      const fichaRef = doc(db, "fichas", id);

      await updateDoc(fichaRef, {
        pdfLink: link,
      });

      setFichas((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, pdfLink: link }
            : item
        )
      );

      alert("PDF salvo!");

    } catch (error) {

      console.log(error);

      alert("Erro ao salvar PDF");
    }
  }

  async function excluirFicha(id: string) {

    const confirmar = window.confirm(
      "Deseja mesmo excluir esta ficha?"
    );

    if (!confirmar) return;

    try {

      await deleteDoc(doc(db, "fichas", id));

      setFichas((prev) =>
        prev.filter((item) => item.id !== id)
      );

      alert("Ficha excluída com sucesso!");

    } catch (error) {

      console.log(error);

      alert("Erro ao excluir ficha");
    }
  }

  useEffect(() => {

    setFichas([]);

  }, []);
function iniciarEdicao(ficha: any) {
  setEditandoId(ficha.id);

  setEditCliente(ficha.cliente || "");
  setEditEmail(ficha.email || "");
  setEditVendedor(ficha.vendedor || "");
  setEditObservacao(ficha.observacao || "");
  setEditDesigner(ficha.designer || "");
  setEditPedido(ficha.pedido || "");
  setEditEntrega(ficha.entrega || "");
}

async function salvarEdicao() {
  try {

    const fichaRef = doc(db, "fichas", editandoId);

    await updateDoc(fichaRef, {
      cliente: editCliente,
      email: editEmail,
      vendedor: editVendedor,
      observacao: editObservacao,
      designer: editDesigner,
      pedido: editPedido,
      entrega: editEntrega,
    });

    setFichas((prev) =>
      prev.map((item) =>
        item.id === editandoId
          ? {
              ...item,
              cliente: editCliente,
              email: editEmail,
              vendedor: editVendedor,
              observacao: editObservacao,
              designer: editDesigner,
              pedido: editPedido,
              entrega: editEntrega,
            }
          : item
      )
    );

    setEditandoId("");

    alert("Alterações salvas!");

  } catch (error) {

    console.log(error);

    alert("Erro ao salvar alterações");
  }
}
  function StatusToggle({
    label,
    ativo,
    onClick,
  }: {
    label: string;
    ativo: boolean;
    onClick: () => void;
  }) {
    return (

      <div className="flex items-center justify-between w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">

        <span className={`text-sm font-medium transition-all ${
          ativo
            ? "text-lime-400"
            : "text-white"
        }`}>
          {label}
        </span>

        <button
          onClick={onClick}
          role="switch"
          aria-checked={ativo}
          className="relative w-8 h-4 bg-zinc-700 rounded-full"
        >

          <div
            className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
              ativo
                ? "translate-x-4 bg-lime-400"
                : "translate-x-1 bg-red-500"
            }`}
          />

        </button>

      </div>
    );
  }

  return (

    <main
  className="min-h-screen bg-black p-3 text-white relative"
  onClick={() => {
    if (menuAberto) setMenuAberto(false);
    if (designersAberto) setDesignersAberto(false);
  }}
>
   <button
    onClick={(e) => {
      e.stopPropagation();
      setMenuAberto(!menuAberto);
    }}
    className="fixed top-3 right-4 text-white text-xl z-50"
  >
    ☰
  </button>

  {menuAberto && (
  <div
    onClick={(e) => e.stopPropagation()}
    className="fixed top-16 right-4 w-40 bg-zinc-700/90 text-white p-3 z-50 rounded-xl"
  >
    <h2 className="font-bold mb-4">
      SETORES
    </h2>

    <button className="w-full text-left py-2 border-b border-zinc-600 text-xs">
      ▸ COMERCIAL
    </button>

    <button className="w-full text-left py-2 border-b border-zinc-600 text-xs">
      ▸ DESIGNERS
    </button>

    <button className="w-full text-left py-2 border-b border-zinc-600 text-xs">
      ▸ IMPRESSÃO
    </button>
  </div>
)}

  <div className="max-w-md mx-auto">

  </div>

      <div className="max-w-md mx-auto">

        {/* PESQUISA */}
        <div className="bg-zinc-900 rounded-3xl shadow-2xl p-4 mb-5 mt-6 border border-zinc-800">

          <input
            type="text"
            placeholder="🔎 Pesquisar Cliente"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              pesquisarFichas(e.target.value);
            }}
            className="w-full bg-black border border-zinc-700 rounded-2xl p-3 text-sm text-white placeholder-zinc-500 outline-none"
          />

        </div>

        {/* RESULTADOS */}
        {busca && (

          <div className="space-y-4">

            {fichas.length > 0 ? (

              fichas.map((ficha) => (

                <div
                  key={ficha.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 shadow-xl"
                >

  {/* TOPO */}
<div className="mb-5">

  {/* NOME + LIXEIRA */}
  <div className="flex justify-between items-start gap-3 mb-3">

  {editandoId === ficha.id ? (

  <input
    type="text"
    value={editCliente}
    onChange={(e) => setEditCliente(e.target.value)}
    className="flex-1 bg-black border border-zinc-700 rounded-xl p-2 text-white"
  />

) : (

  <p className="text-2xl font-bold break-words leading-tight flex-1 uppercase">
    {ficha.cliente}
  </p>

)}
  <div className="flex gap-2">

    <button
      onClick={() => iniciarEdicao(ficha)}
      className="text-white hover:text-blue-500 transition flex-shrink-0"
      title="Editar ficha"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L12 14l-4 1 1-4 7.5-7.5z"
        />
      </svg>
    </button>

    <button
      onClick={() => excluirFicha(ficha.id)}
      className="text-white hover:text-red-500 transition flex-shrink-0"
      title="Excluir ficha"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"
        />
      </svg>
    </button>

  </div>

</div>

  {/* DATAS */}
  <div className="grid grid-cols-2 gap-4 mb-4">

    <div>
      <p className="text-zinc-400 text-sm">
        Pedido:
      </p>

     {editandoId === ficha.id ? (

  <input
    type="date"
    value={editEntrega}
    onChange={(e) => setEditEntrega(e.target.value)}
    className="w-full bg-black border border-zinc-700 rounded-xl p-2 text-white"
  />

) : (

  <p className="text-base font-semibold">
    {ficha.entrega
      ? ficha.entrega.split("-").reverse().join("/")
      : "-"}
  </p>

)}
    </div>

    <div>
      <p className="text-zinc-400 text-sm">
        Entrega:
      </p>

      <p className="text-base font-semibold">
  {ficha.entrega
    ? ficha.entrega.split("-").reverse().join("/")
    : "-"}
</p>
    </div>

  </div>
{/* IDENTIFICAÇÃO DO CLIENTE */}
<div className="mb-4">

  <p className="text-zinc-400 text-sm">
    Email, Tel ou Cód. Cliente:
  </p>

  <p className="text-sm break-words font-medium">
    {ficha.email || "-"}
  </p>

</div>

{editandoId === ficha.id && (

  <div className="flex gap-2 mt-4">

    <button
      onClick={salvarEdicao}
      className="bg-green-600 px-4 py-2 rounded-xl text-sm font-bold"
    >
      💾 SALVAR
    </button>

    <button
      onClick={() => setEditandoId("")}
      className="bg-red-600 px-4 py-2 rounded-xl text-sm font-bold"
    >
      ❌ CANCELAR
    </button>

  </div>

)}
  {/* OBSERVAÇÃO */}
  <div className="mb-4">

    <p className="text-zinc-400 text-sm">
      Observação:
    </p>

    <p className="text-sm break-words">
      {ficha.observacao || "-"}
    </p>

  </div>

  {/* VENDEDOR + DESIGNER */}
  <div className="grid grid-cols-2 gap-4">

    <div>
      <p className="text-zinc-400 text-sm">
        Vendedor:git add .
      </p>

      <p className="text-lg font-bold break-words uppercase">
        {ficha.vendedor || "-"}
      </p>
    </div>

    <div>
      <p className="text-zinc-400 text-sm">
        Designer:
      </p>

      <p className="text-lg font-bold break-words">
        {ficha.designer || "-"}
      </p>
    </div>

  </div>

</div>

                  {/* STATUS */}
                  {/* STATUS */}
<div className="flex flex-col gap-2">

  {/* BARRA DE PROGRESSO */}
  {(() => {

    const etapas = [
  ficha.venda,
  ficha.arte,
  ficha.exportacao,
  ficha.impressao,
  ficha.prensa,
  ficha.corte,
  ficha.costura,
  ficha.costuraConcluida,
  ficha.conferencia,
  ficha.entregaStatus,
];

    const concluidas = etapas.filter(Boolean).length;

    const porcentagem = Math.round(
      (concluidas / etapas.length) * 100
    );

    return (

      <div className="mb-2">

        <div className="relative w-full h-8 bg-black border-2 border-blue-700 rounded-full overflow-hidden shadow-[0_0_10px_rgba(37,99,235,0.5)]">

          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${porcentagem}%`,
              background:
                "linear-gradient(to right, #f59e0b, #fde047)",
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
            {porcentagem}%
          </div>

        </div>

      </div>

    );

  })()}

                    <div className="space-y-2">

                      <StatusToggle
                        label={ficha.venda ? "VENDA FEITA" : "VENDA"}
                        ativo={ficha.venda}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "venda",
                            ficha.venda
                          )
                        }
                      />

                      <StatusToggle
                        label={ficha.arte ? "ARTE CONCLUÍDA" : "ARTE"}
                        ativo={ficha.arte}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "arte",
                            ficha.arte
                          )
                        }
                      />

                      <div className="space-y-2">

                        <StatusToggle
                          label={ficha.exportacao ? "EXPORTADO" : "EXPORTANDO"}
                          ativo={ficha.exportacao}
                          onClick={() =>
                            alterarStatus(
                              ficha.id,
                              "exportacao",
                              ficha.exportacao
                            )
                          }
                        />

                        {ficha.exportacao && (

                          <div className="ml-4 pl-3 border-l border-zinc-700 space-y-3">

                            <input
                              type="text"
                              placeholder="Cole aqui o link do PDF"
                              defaultValue={ficha.pdfLink || ""}
                              onBlur={(e) =>
                                salvarPdfLink(
                                  ficha.id,
                                  e.target.value
                                )
                              }
                              className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm outline-none"
                            />

                            {ficha.pdfLink && (

                              <a
                                href={ficha.pdfLink}
                                target="_blank"
                                className="block bg-green-600 hover:bg-green-700 transition text-center rounded-xl p-3 text-sm font-bold"
                              >
                                VER PDF
                              </a>

                            )}

                          </div>

                        )}

                      </div>

                      <StatusToggle
                        label={ficha.impressao ? "IMPRESSO" : "IMPRESSÃO"}
                        ativo={ficha.impressao}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "impressao",
                            ficha.impressao
                          )
                        }
                      />

                    </div>

                    <div className="space-y-2">

                      <StatusToggle
                        label={ficha.prensa ? "PRENSAGEM CONCLUÍDA" : "NA PRENSA"}
                        ativo={ficha.prensa}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "prensa",
                            ficha.prensa
                          )
                        }
                      />

                      <StatusToggle
                        label={ficha.corte ? "CORTADO" : "CORTE"}
                        ativo={ficha.corte}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "corte",
                            ficha.corte
                          )
                        }
                      />

                      <div className="space-y-2">

                        <StatusToggle
                          label={ficha.costura ? "ENVIADO P/ COSTUREIRO(A)" : "COSTURA"}
                          ativo={ficha.costura}
                          onClick={() =>
                            alterarStatus(
                              ficha.id,
                              "costura",
                              ficha.costura
                            )
                          }
                        />

                        {ficha.costura && (

                          <div className="ml-4 pl-3 border-l border-zinc-700 space-y-2">

                            <StatusToggle
                              label="PAULO"
                              ativo={ficha.costureiroPaulo}
                              onClick={() =>
                                alterarStatus(
                                  ficha.id,
                                  "costureiroPaulo",
                                  ficha.costureiroPaulo
                                )
                              }
                            />

                           <StatusToggle
  label="CELINA"
  ativo={ficha.costureiroCelina}
  onClick={() =>
    alterarStatus(
      ficha.id,
      "costureiroCelina",
      ficha.costureiroCelina
    )
  }
/>

{(ficha.costureiroPaulo || ficha.costureiroCelina) && (
  <StatusToggle
    label={
      ficha.costuraConcluida
        ? "COSTURA CONCLUÍDA"
        : "AGUARDANDO COSTURA"
    }
    ativo={ficha.costuraConcluida}
    onClick={() =>
      alterarStatus(
        ficha.id,
        "costuraConcluida",
        ficha.costuraConcluida
      )
    }
  />
)}

</div>

                        )}

                      </div>

                      <StatusToggle
                        label={
                          ficha.conferencia
                            ? "CONFERIDO E EMBALADO"
                            : "CONFERÊNCIA/RECEPÇÃO"
                        }
                        ativo={ficha.conferencia}
                        onClick={() =>
                          alterarStatus(
                            ficha.id,
                            "conferencia",
                            ficha.conferencia
                          )
                        }
                      />

                      <div className="space-y-2">

                        <StatusToggle
                          label={ficha.entregaStatus ? "ENTREGUE" : "ENTREGA"}
                          ativo={ficha.entregaStatus}
                          onClick={() =>
                            alterarStatus(
                              ficha.id,
                              "entregaStatus",
                              ficha.entregaStatus
                            )
                          }
                        />

                        {ficha.entregaStatus && (

                          <div className="ml-4 pl-3 border-l border-zinc-700 space-y-2">

                            <StatusToggle
                              label="ENVIO"
                              ativo={ficha.envio}
                              onClick={() =>
                                alterarStatus(
                                  ficha.id,
                                  "envio",
                                  ficha.envio
                                )
                              }
                            />

                            <StatusToggle
                              label="RETIRADA"
                              ativo={ficha.retirada}
                              onClick={() =>
                                alterarStatus(
                                  ficha.id,
                                  "retirada",
                                  ficha.retirada
                                )
                              }
                            />

                          </div>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

              ))

            ) : (

              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 text-center text-zinc-400">
                Nenhum cliente encontrado
              </div>

            )}

          </div>

        )}

       {/* FORMULÁRIO */}
<div className="bg-zinc-900 rounded-3xl shadow-2xl p-5 mt-5 border border-zinc-800">

  <h1 className="text-4xl font-bold text-center mb-1">
    CADASTRO
  </h1>

  <p className="text-center text-zinc-400 mb-6">
    Sistema Status de Pedidos
  </p>

  <div className="space-y-4">

    <input
      type="text"
      placeholder="Nome do Cliente"
      value={cliente}
      onChange={(e) => setCliente(e.target.value)}
      className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none"
    />

    <input
      type="email"
      placeholder="Email, Tel ou Cód cliente"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none"
    />

    <select
  value={vendedor}
  onChange={(e) => setVendedor(e.target.value)}
  className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none text-white"
>
  <option value="">Selecione o Vendedor</option>
  <option value="PALOMA">PALOMA</option>
  <option value="MIKELLY">MIKELLY</option>
  <option value="LARISSA">LARISSA</option>
  <option value="JEFFERSON">JEFFERSON</option>
  <option value="JANIELLY">JANIELLY</option>
  <option value="ROSE">ROSE</option>
  <option value="CÉSAR">CÉSAR</option>
  <option value="GRAÇA">GRAÇA</option>
  <option value="KELLY">KELLY</option>
</select>

    <input
      type="text"
      placeholder="Observação"
      value={observacao}
      onChange={(e) => setObservacao(e.target.value)}
      className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none"
    />

   <select
  value={designer}
  onChange={(e) => setDesigner(e.target.value)}
  className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none text-white"
>
  <option value="">Selecione o Designer</option>
  <option value="ALEXANDRE">ALEXANDRE</option>
  <option value="LÁZARO">LÁZARO</option>
  <option value="EDIVAN">EDIVAN</option>
  <option value="PAULÃO">PAULÃO</option>
</select>

    <div>

      <label className="text-sm text-zinc-400">
        Data do Pedido
      </label>

      <input
        type="date"
        value={pedido}
        onChange={(e) => setPedido(e.target.value)}
        className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none"
      />

    </div>

    <div>

      <label className="text-sm text-zinc-400">
        Data da Entrega
      </label>

      <input
        type="date"
        value={entrega}
        onChange={(e) => setEntrega(e.target.value)}
        className="w-full bg-black border border-zinc-700 rounded-2xl p-3 outline-none"
      />

    </div>

    <button
      onClick={salvarFicha}
      className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-2xl p-3 font-bold"
    >
        SALVAR
    </button>

  </div>

</div>

      </div>

    </main>

  );
}