import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function PromotersChart({ avaliacoes }) {
  const total = avaliacoes.length;
  const promotores = avaliacoes.filter((a) => a.nps_geral >= 9).length;
  const passivos = avaliacoes.filter((a) => a.nps_geral >= 7 && a.nps_geral <= 8).length;
  const detratores = avaliacoes.filter((a) => a.nps_geral <= 6).length;

  const data = [
    { name: "Promotores (9-10)", value: promotores },
    { name: "Passivos (7-8)", value: passivos },
    { name: "Detratores (0-6)", value: detratores },
  ];

  const npsScore = total > 0 ? Math.round(((promotores - detratores) / total) * 100) : 0;

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading font-bold text-foreground">Promotores / Detratores</h3>
        <span className="text-sm font-heading font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
          NPS {npsScore}
        </span>
      </div>
      {total === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-10">Sem dados</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            {data.map((d, i) => (
              <div key={d.name} className="rounded-xl p-2" style={{ background: `${COLORS[i]}20` }}>
                <p className="text-lg font-bold font-heading" style={{ color: COLORS[i] }}>{d.value}</p>
                <p className="text-xs text-muted-foreground">{d.name.split(" ")[0]}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}