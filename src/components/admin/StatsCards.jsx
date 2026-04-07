import { motion } from "framer-motion";
import { TrendingUp, Users, ThumbsUp, ThumbsDown } from "lucide-react";

export default function StatsCards({ avaliacoes }) {
  const total = avaliacoes.length;
  const npsMedia = total > 0
    ? (avaliacoes.reduce((s, a) => s + (a.nps_geral || 0), 0) / total).toFixed(1)
    : "—";

  const promotores = avaliacoes.filter((a) => a.nps_geral >= 9).length;
  const detratores = avaliacoes.filter((a) => a.nps_geral <= 6).length;
  const passivos = avaliacoes.filter((a) => a.nps_geral >= 7 && a.nps_geral <= 8).length;
  const npsScore = total > 0 ? Math.round(((promotores - detratores) / total) * 100) : 0;

  const cards = [
    { label: "Avaliações", value: total, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "NPS Médio", value: npsMedia, icon: TrendingUp, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Promotores", value: `${total > 0 ? Math.round((promotores / total) * 100) : 0}%`, icon: ThumbsUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "NPS Score", value: `${npsScore}`, icon: ThumbsDown, color: "text-accent-foreground", bg: "bg-accent/20" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm"
        >
          <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
            <c.icon className={`w-5 h-5 ${c.color}`} />
          </div>
          <p className="text-2xl font-extrabold font-heading text-foreground">{c.value}</p>
          <p className="text-xs text-muted-foreground font-body mt-1">{c.label}</p>
        </motion.div>
      ))}
    </div>
  );
}