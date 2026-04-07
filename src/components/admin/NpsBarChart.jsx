import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const CATEGORIAS = [
  { key: "reserva_contato", label: "Reserva" },
  { key: "monitores", label: "Monitores" },
  { key: "garconetes", label: "Garçonetes" },
  { key: "supervisora", label: "Supervisora" },
  { key: "recepcao", label: "Recepção" },
  { key: "buffet", label: "Buffet" },
  { key: "climatizacao", label: "Clima" },
  { key: "limpeza", label: "Limpeza" },
  { key: "alimentos", label: "Alimentos" },
  { key: "brinquedos", label: "Brinquedos" },
];

export default function NpsBarChart({ avaliacoes }) {
  const [tipo, setTipo] = useState("bar");

  const data = CATEGORIAS.map((cat) => {
    const vals = avaliacoes
      .map((a) => a.notas_json?.[cat.key])
      .filter((v) => v !== undefined && v !== null);
    const media = vals.length > 0 ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : 0;
    return { name: cat.label, média: parseFloat(media) };
  });

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-foreground">Médias por Categoria</h3>
        <div className="flex gap-2">
          <Button size="sm" variant={tipo === "bar" ? "default" : "outline"} onClick={() => setTipo("bar")}>Barras</Button>
          <Button size="sm" variant={tipo === "line" ? "default" : "outline"} onClick={() => setTipo("line")}>Linha</Button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        {tipo === "bar" ? (
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-35} textAnchor="end" />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
            <Bar dataKey="média" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-35} textAnchor="end" />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
            <Line type="monotone" dataKey="média" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}