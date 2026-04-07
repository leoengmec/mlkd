import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    <TooltipProvider>
      <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-bold text-foreground">Promotores / Detratores</h3>
          <TooltipUI>
            <TooltipTrigger asChild>
              <span className="text-sm font-heading font-bold text-primary bg-primary/10 px-3 py-1 rounded-full cursor-help hover:bg-primary/20 transition-colors">
                NPS {npsScore}
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-card border border-border text-foreground text-xs max-w-xs">
              Net Promoter Score: métrica que mede a lealdade dos clientes. Varia de -100 a +100. Acima de 50 é excelente.
            </TooltipContent>
          </TooltipUI>
        </div>
        {total === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-10">Sem dados</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data} cx="50%" cy="40%" outerRadius={70} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: "11px" }} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-3 mt-6">
              {data.map((d, i) => {
                const descriptions = [
                  "Clientes muito satisfeitos (nota 9-10) que indicariam a empresa",
                  "Clientes satisfeitos (nota 7-8) mas com potencial de melhoria",
                  "Clientes insatisfeitos (nota 0-6) que podem desencorajar outros"
                ];
                return (
                  <TooltipUI key={d.name}>
                    <TooltipTrigger asChild>
                      <div className="rounded-xl p-4 cursor-help transition-all hover:scale-105" style={{ background: `${COLORS[i]}20` }}>
                        <p className="text-3xl font-bold font-heading" style={{ color: COLORS[i] }}>{d.value}</p>
                        <p className="text-xs font-heading text-foreground mt-2 leading-snug">{d.name.split(" ")[0]}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-card border border-border text-foreground text-xs max-w-xs">
                      {descriptions[i]}
                    </TooltipContent>
                  </TooltipUI>
                );
              })}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}