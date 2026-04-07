import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function NpsBarChart({ avaliacoes }) {
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

  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(272 68% 60%)',
    'hsl(130 60% 60%)',
  ];

  const data = categorias.map((cat, idx) => {
    const notas = avaliacoes.map((a) => a.notas_json?.[cat.key] || 0);
    const media = notas.length > 0 ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : 0;
    return { name: cat.label, media: parseFloat(media), fill: colors[idx % colors.length] };
  });

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <h3 className="font-heading font-bold text-lg mb-6">Média por Categoria</h3>
      {avaliacoes.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Nenhuma avaliação</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="media" dataKey="fill" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}