import { useMemo } from "react";
import { Flame } from "lucide-react";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const CONVIDADOS_ORDER = ["<20","20-50","50-100","100-150","150+","Não informado"];

function getColor(value, min, max) {
  if (value === null || value === undefined) return { bg: "bg-muted/30", text: "text-muted-foreground", label: "—" };
  const ratio = max === min ? 0.5 : (value - min) / (max - min);
  if (ratio >= 0.75) return { bg: "bg-green-500", text: "text-white", label: value.toFixed(1) };
  if (ratio >= 0.5)  return { bg: "bg-green-200", text: "text-green-900", label: value.toFixed(1) };
  if (ratio >= 0.25) return { bg: "bg-orange-200", text: "text-orange-900", label: value.toFixed(1) };
  return { bg: "bg-red-400", text: "text-white", label: value.toFixed(1) };
}

function Cell({ value, min, max, size = "md" }) {
  const { bg, text, label } = getColor(value, min, max);
  const sz = size === "sm" ? "h-8 text-xs" : "h-10 text-xs";
  return (
    <div className={`${bg} ${text} ${sz} flex items-center justify-center rounded font-semibold transition-all`}>
      {label}
    </div>
  );
}

export default function HeatMapCalor({ avaliacoes }) {
  // ── Heatmap 1: NPS médio por Mês × Dia da Semana ─────────────────
  const heatMesDia = useMemo(() => {
    const grid = Array.from({ length: 12 }, () => Array(7).fill(null).map(() => []));
    avaliacoes.forEach(a => {
      if (!a.data_festa || a.nps_geral == null) return;
      const d = new Date(a.data_festa + "T12:00:00");
      const mes = d.getMonth();    // 0-11
      const dia = d.getDay();      // 0=Dom
      grid[mes][dia].push(a.nps_geral);
    });
    return grid.map(row => row.map(vals => vals.length ? vals.reduce((s,v) => s+v,0)/vals.length : null));
  }, [avaliacoes]);

  // ── Heatmap 2: NPS médio por Mês × Nº Convidados ─────────────────
  const heatMesConvidados = useMemo(() => {
    const normalize = (v) => {
      if (!v) return "Não informado";
      const n = parseInt(v.replace(/[^0-9]/g, ""));
      if (isNaN(n)) return v;
      if (n < 20) return "<20";
      if (n < 50) return "20-50";
      if (n < 100) return "50-100";
      if (n < 150) return "100-150";
      return "150+";
    };
    // grid[mes][convidadosIdx]
    const grid = Array.from({ length: 12 }, () =>
      CONVIDADOS_ORDER.reduce((acc, k) => { acc[k] = []; return acc; }, {})
    );
    avaliacoes.forEach(a => {
      if (!a.data_festa || a.nps_geral == null) return;
      const d = new Date(a.data_festa + "T12:00:00");
      const mes = d.getMonth();
      const grp = normalize(a.numero_convidados);
      if (grid[mes][grp]) grid[mes][grp].push(a.nps_geral);
    });
    return grid.map(row =>
      CONVIDADOS_ORDER.map(k => row[k].length ? row[k].reduce((s,v) => s+v,0)/row[k].length : null)
    );
  }, [avaliacoes]);

  // ── Sazonalidade mensal (vol + nps) ──────────────────────────────
  const sazonalidade = useMemo(() => {
    return MESES.map((mes, i) => {
      const items = avaliacoes.filter(a => {
        if (!a.data_festa) return false;
        return new Date(a.data_festa + "T12:00:00").getMonth() === i;
      });
      const avg = items.length ? items.reduce((s,a) => s+(a.nps_geral||0), 0)/items.length : null;
      return { mes, count: items.length, avg };
    });
  }, [avaliacoes]);

  const allValsMesDia = heatMesDia.flat().filter(v => v !== null);
  const minMD = allValsMesDia.length ? Math.min(...allValsMesDia) : 0;
  const maxMD = allValsMesDia.length ? Math.max(...allValsMesDia) : 10;

  const allValsMesConv = heatMesConvidados.flat().filter(v => v !== null);
  const minMC = allValsMesConv.length ? Math.min(...allValsMesConv) : 0;
  const maxMC = allValsMesConv.length ? Math.max(...allValsMesConv) : 10;

  const sazonVals = sazonalidade.map(s => s.avg).filter(v => v !== null);
  const minS = sazonVals.length ? Math.min(...sazonVals) : 0;
  const maxS = sazonVals.length ? Math.max(...sazonVals) : 10;

  if (!avaliacoes.length) return null;

  return (
    <div className="space-y-6">

      {/* Legenda */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="font-semibold">Mapa de Calor — NPS Médio</span>
        <div className="flex items-center gap-1 ml-4">
          <div className="w-3 h-3 rounded bg-red-400" /> Crítico
          <div className="w-3 h-3 rounded bg-orange-200 ml-2" /> Baixo
          <div className="w-3 h-3 rounded bg-green-200 ml-2" /> Bom
          <div className="w-3 h-3 rounded bg-green-500 ml-2" /> Excelente
        </div>
      </div>

      {/* Sazonalidade Mensal */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h3 className="font-heading font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
          Sazonalidade — NPS por Mês
        </h3>
        <div className="grid grid-cols-12 gap-1.5">
          {sazonalidade.map((s, i) => {
            const { bg, text } = getColor(s.avg, minS, maxS);
            return (
              <div key={i} className={`${bg} ${text} rounded-lg p-2 text-center`}>
                <p className="text-xs font-bold">{s.mes}</p>
                <p className="text-sm font-bold mt-1">{s.avg !== null ? s.avg.toFixed(1) : "—"}</p>
                <p className="text-xs opacity-75">{s.count}f</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Cada célula: NPS médio / quantidade de festas (f)</p>
      </div>

      {/* Heatmap Mês × Dia da Semana */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm overflow-x-auto">
        <h3 className="font-heading font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
          NPS por Mês × Dia da Semana
        </h3>
        <div className="min-w-[600px]">
          {/* Header dias */}
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
            <div />
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>
          {heatMesDia.map((row, mesIdx) => (
            <div key={mesIdx} className="grid gap-1 mb-1" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
              <div className="text-xs font-semibold text-muted-foreground flex items-center">{MESES[mesIdx]}</div>
              {row.map((val, diaIdx) => (
                <Cell key={diaIdx} value={val} min={minMD} max={maxMD} size="sm" />
              ))}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Células cinzas = sem dados suficientes</p>
      </div>

      {/* Heatmap Mês × Nº Convidados */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm overflow-x-auto">
        <h3 className="font-heading font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
          NPS por Mês × Nº de Convidados
        </h3>
        <div className="min-w-[600px]">
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: "60px repeat(6, 1fr)" }}>
            <div />
            {CONVIDADOS_ORDER.map(k => (
              <div key={k} className="text-center text-xs font-semibold text-muted-foreground truncate px-1">{k}</div>
            ))}
          </div>
          {heatMesConvidados.map((row, mesIdx) => (
            <div key={mesIdx} className="grid gap-1 mb-1" style={{ gridTemplateColumns: "60px repeat(6, 1fr)" }}>
              <div className="text-xs font-semibold text-muted-foreground flex items-center">{MESES[mesIdx]}</div>
              {row.map((val, idx) => (
                <Cell key={idx} value={val} min={minMC} max={maxMC} size="sm" />
              ))}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Identifica se festas maiores/menores em certos meses têm notas mais baixas</p>
      </div>

    </div>
  );
}