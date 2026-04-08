import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, TrendingUp, TrendingDown, Minus, Users, Star, RefreshCw, Calendar } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Footer from "../../components/Footer";
import HeatMapCalor from "../../components/admin/HeatMapCalor";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

function KPICard({ title, value, subtitle, trend, trendLabel, icon: Icon, color = "primary" }) {
  const trendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const TrendIcon = trendIcon;
  const trendColor = trend > 0 ? "text-green-600" : trend < 0 ? "text-red-500" : "text-muted-foreground";

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-heading font-semibold text-muted-foreground">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10`}>
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="text-4xl font-heading font-bold text-foreground">{value}</div>
      {trendLabel && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          {trendLabel}
        </div>
      )}
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export default function DashboardExecutivo() {
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadData = async () => {
    setLoading(true);
    const data = await base44.entities.avaliacoes.list("-data_envio", 500);
    setAvaliacoes(data);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) navigate("/admin/login");
    else loadData();
  }, []);

  // ── KPIs calculados ──────────────────────────────────────────────
  const kpis = useMemo(() => {
    if (!avaliacoes.length) return null;

    const total = avaliacoes.length;

    // NPS Geral
    const avgNps = (avaliacoes.reduce((s, a) => s + (a.nps_geral || 0), 0) / total).toFixed(1);
    const promoters = avaliacoes.filter(a => a.nps_geral >= 9).length;
    const detractors = avaliacoes.filter(a => a.nps_geral <= 6).length;
    const npsScore = Math.round(((promoters - detractors) / total) * 100);

    // Mês atual vs anterior
    const now = new Date();
    const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

    const festasEssMes = avaliacoes.filter(a => a.data_festa?.startsWith(curMonth)).length;
    const festasMesAnt = avaliacoes.filter(a => a.data_festa?.startsWith(prevMonth)).length;
    const volumeTrend = festasMesAnt > 0 ? Math.round(((festasEssMes - festasMesAnt) / festasMesAnt) * 100) : 0;

    // Taxa de retenção (refaz = true)
    const refazCount = avaliacoes.filter(a => a.refaz === true).length;
    const retencao = Math.round((refazCount / total) * 100);

    // Taxa de indicação
    const indicaCount = avaliacoes.filter(a => a.indica === true).length;
    const indicacao = Math.round((indicaCount / total) * 100);

    return { avgNps, npsScore, festasEssMes, festasMesAnt, volumeTrend, retencao, refazCount, indicacao, indicaCount, total, promoters, detractors };
  }, [avaliacoes]);

  // ── Volume mensal (últimos 6 meses) ──────────────────────────────
  const volumeMensal = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      const count = avaliacoes.filter(a => a.data_festa?.startsWith(key)).length;
      const avgNpsMonth = (() => {
        const items = avaliacoes.filter(a => a.data_festa?.startsWith(key));
        return items.length ? parseFloat((items.reduce((s, a) => s + (a.nps_geral || 0), 0) / items.length).toFixed(1)) : 0;
      })();
      months.push({ mes: label, festas: count, nps: avgNpsMonth });
    }
    return months;
  }, [avaliacoes]);

  // ── NPS por categoria de convidados ──────────────────────────────
  const npsPorConvidados = useMemo(() => {
    const groups = {};
    avaliacoes.forEach(a => {
      const g = a.numero_convidados || "Não informado";
      if (!groups[g]) groups[g] = [];
      groups[g].push(a.nps_geral || 0);
    });
    return Object.entries(groups)
      .map(([name, vals]) => ({ name, nps: parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1)) }))
      .sort((a, b) => b.nps - a.nps)
      .slice(0, 6);
  }, [avaliacoes]);

  // ── Distribuição promotores/passivos/detratores ───────────────────
  const pieData = useMemo(() => {
    if (!avaliacoes.length) return [];
    const promoters = avaliacoes.filter(a => a.nps_geral >= 9).length;
    const passives = avaliacoes.filter(a => a.nps_geral >= 7 && a.nps_geral <= 8).length;
    const detractors = avaliacoes.filter(a => a.nps_geral <= 6).length;
    return [
      { name: "Promotores", value: promoters },
      { name: "Passivos", value: passives },
      { name: "Detratores", value: detractors },
    ];
  }, [avaliacoes]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard Executivo</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Atualizado: {lastRefresh.toLocaleTimeString("pt-BR")} · {avaliacoes.length} avaliações
              </p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 transition-colors bg-card"
            >
              <RefreshCw className="w-4 h-4" /> Atualizar
            </button>
          </div>

          {/* KPI Cards */}
          {kpis && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="NPS Score"
                value={kpis.npsScore}
                subtitle={`Média: ${kpis.avgNps} / 10`}
                trend={kpis.npsScore >= 50 ? 1 : kpis.npsScore >= 0 ? 0 : -1}
                trendLabel={kpis.npsScore >= 50 ? "Excelente" : kpis.npsScore >= 0 ? "Bom" : "Crítico"}
                icon={Star}
              />
              <KPICard
                title="Festas este Mês"
                value={kpis.festasEssMes}
                subtitle={`Mês anterior: ${kpis.festasMesAnt}`}
                trend={kpis.volumeTrend}
                trendLabel={`${kpis.volumeTrend > 0 ? "+" : ""}${kpis.volumeTrend}% vs mês ant.`}
                icon={Calendar}
              />
              <KPICard
                title="Taxa de Retenção"
                value={`${kpis.retencao}%`}
                subtitle={`${kpis.refazCount} clientes repetiram`}
                trend={kpis.retencao >= 50 ? 1 : kpis.retencao >= 30 ? 0 : -1}
                trendLabel={kpis.retencao >= 50 ? "Acima da meta" : kpis.retencao >= 30 ? "Na média" : "Abaixo da meta"}
                icon={RefreshCw}
              />
              <KPICard
                title="Taxa de Indicação"
                value={`${kpis.indicacao}%`}
                subtitle={`${kpis.indicaCount} indicariam amigos`}
                trend={kpis.indicacao >= 70 ? 1 : kpis.indicacao >= 50 ? 0 : -1}
                trendLabel={kpis.indicacao >= 70 ? "Muito forte" : kpis.indicacao >= 50 ? "Regular" : "Fraca"}
                icon={Users}
              />
            </div>
          )}

          {/* Volume mensal + NPS trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Volume de Festas Mensal
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={volumeMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="festas" name="Festas" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> NPS Médio por Mês
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={volumeMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip formatter={(v) => `${v} / 10`} />
                  <Line type="monotone" dataKey="nps" name="NPS" stroke="hsl(var(--chart-2))" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Promotores Pie + NPS por convidados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" /> Distribuição NPS
              </h2>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v, name) => [`${v} (${avaliacoes.length ? Math.round(v / avaliacoes.length * 100) : 0}%)`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.value} · {avaliacoes.length ? Math.round(item.value / avaliacoes.length * 100) : 0}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> NPS por Nº de Convidados
              </h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={npsPorConvidados} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip formatter={(v) => `${v} / 10`} />
                  <Bar dataKey="nps" name="NPS Médio" fill="hsl(var(--chart-3))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mapa de Calor */}
          <HeatMapCalor avaliacoes={avaliacoes} />

          </main>
          <Footer />
      </div>
    </div>
  );
}