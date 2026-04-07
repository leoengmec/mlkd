import { TrendingUp, Users, Star, ThumbsUp } from "lucide-react";

export default function StatsCards({ avaliacoes }) {
  const total = avaliacoes.length;
  const npsMedia = total > 0 ? (avaliacoes.reduce((sum, a) => sum + a.nps_geral, 0) / total).toFixed(1) : 0;
  const promotores = avaliacoes.filter((a) => a.nps_geral >= 9).length;
  const percentualPromotor = total > 0 ? ((promotores / total) * 100).toFixed(0) : 0;
  const indica = avaliacoes.filter((a) => a.indica).length;

  const cards = [
    {
      label: "Total Respostas",
      value: total,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "NPS Médio",
      value: npsMedia,
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "Promotores %",
      value: `${percentualPromotor}%`,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Indica Amigos",
      value: indica,
      icon: ThumbsUp,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold opacity-90">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <Icon className="w-12 h-12 opacity-30" />
            </div>
          </div>
        );
      })}
    </div>
  );
}