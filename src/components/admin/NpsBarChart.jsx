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

  const data = categorias.map((cat) => {
    const notas = avaliacoes.map((a) => a.notas_json?.[cat.key] || 0);
    const media = notas.length > 0 ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : 0;
    return { name: cat.label, media: parseFloat(media) };
  });

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50">
      <h3 className="font-heading font-bold text-lg mb-4">Média por Categoria</h3>
      {avaliacoes.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Nenhuma avaliação</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="media" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}