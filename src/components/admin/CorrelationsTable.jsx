import { useMemo } from "react";

function pearsonCorrelation(x, y) {
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
  const denomX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
  const denomY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));

  if (denomX === 0 || denomY === 0) return 0;
  return numerator / (denomX * denomY);
}

export default function CorrelationsTable({ avaliacoes }) {
  const correlations = useMemo(() => {
    if (!avaliacoes.length) return [];

    const nps = avaliacoes.map((a) => a.nps_geral);
    const categorias = [
      { key: "reserva_contato", label: "Reserva/Contato" },
      { key: "monitores", label: "Monitores" },
      { key: "garconetes", label: "Garçonetes" },
      { key: "supervisora", label: "Supervisora" },
      { key: "recepcao", label: "Recepção" },
      { key: "buffet", label: "Buffet" },
      { key: "climatizacao", label: "Climatização" },
      { key: "limpeza", label: "Limpeza" },
      { key: "alimentos", label: "Alimentos" },
      { key: "brinquedos", label: "Brinquedos" },
    ];

    const results = categorias
      .map((cat) => {
        const notas = avaliacoes.map((a) => a.notas_json?.[cat.key] || 0);
        const r = pearsonCorrelation(nps, notas);
        return { label: cat.label, r: r.toFixed(3), strength: Math.abs(r) };
      })
      .sort((a, b) => b.strength - a.strength);

    return results;
  }, [avaliacoes]);

  const getColor = (r) => {
    const abs = Math.abs(parseFloat(r));
    if (abs > 0.7) return "text-green-600 font-bold";
    if (abs > 0.5) return "text-blue-600";
    return "text-muted-foreground";
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <h3 className="font-heading font-bold text-lg mb-4">Correlações NPS vs Categorias</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Coeficiente de Pearson (-1 a +1). Valores próximos a +1 = forte correlação positiva.
      </p>
      <div className="space-y-3">
        {correlations.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="font-semibold text-sm">{item.label}</span>
            <span className={`font-mono text-sm ${getColor(item.r)}`}>{item.r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}