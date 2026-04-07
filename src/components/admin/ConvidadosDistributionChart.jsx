import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ConvidadosDistributionChart({ avaliacoes }) {
  if (!avaliacoes || avaliacoes.length === 0) {
    return <Card><CardContent className="p-4">Nenhuma avaliação disponível</CardContent></Card>;
  }

  // Contar avaliações por faixa de convidados
  const distribution = {};
  avaliacoes.forEach((a) => {
    const range = a.numero_convidados || 'N/A';
    distribution[range] = (distribution[range] || 0) + 1;
  });

  // Converter para array e ordenar
  const chartData = Object.keys(distribution)
    .sort()
    .map((range) => ({
      faixa: range,
      quantidade: distribution[range],
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>👥 Distribuição de Festas por Número de Convidados</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="faixa" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantidade" fill="#10b981" name="Quantidade de Festas" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}