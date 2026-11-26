export default function CabecalhoSenagraff({ subtitulo = "DISTRIBUIÇÃO E ACOMPANHAMENTO DE PEDIDOS", compacto = false, fundoClaro = false }: { subtitulo?: string; compacto?: boolean; fundoClaro?: boolean }) {
  return (
    <header className={`relative px-4 text-white ${compacto ? "pb-3 pt-5 sm:pt-6" : "pb-4 pt-6 sm:pt-8"}`}>
      <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 -bottom-20 top-0 bg-gradient-to-b from-blue-700 from-40% via-blue-800 via-65% ${fundoClaro ? "to-white" : "to-slate-800"}`} />
      <p className="relative text-center text-3xl font-bold tracking-tight sm:text-4xl">SENAGRAFF</p>
      <p className={`relative ${compacto ? "mt-0.5" : "mt-2"} text-center text-[10px] font-bold tracking-[0.12em] text-blue-100 sm:text-xs`}>{subtitulo}</p>
    </header>
  );
}
