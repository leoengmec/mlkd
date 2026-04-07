import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AvaliacoesTimelineChart({ avaliacoes }) {
  if (!avaliacoes || avaliacoes.length === 0) {
    return <Card><CardContent className="p-4">Nenhuma avaliação disponível</CardContent></Card>;
  }

  // Agrupar por data e calcular média de NPS diária
  const dataByDate = {};
  avaliacoes.forEach((a) => {
    const date = a.data_envio ? a.data_envio.split('T')[0] : 'N/A';
    if (!dataByDate[date]) {
      dataByDate[date] = { nps: [], count: 0 };
    }
    if (a.nps_geral) {
      dataByDate[date].nps.push(a.nps_geral);
      dataByDate[date].count += 1;
    }
  });

  // Converter para array e calcular média
  const chartData = Object.keys(dataByDate)
    .sort()
    .map((date) => ({
      date: new Date(date).toLocaleDateString('pt-BR'),
      npsMedia: Math.round((dataByDate[date].nps.reduce((a, b) => a + b, 0) / dataByDate[date].nps.length) * 10) / 10,
      quantidade: dataByDate[date].count,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 Evolução de Avaliações (NPS Médio)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
            <YAxis domain={[0, 10]} />
            <Tooltip formatter={(value) => value.toFixed(1)} />
            <Legend />
            <Line type="monotone" dataKey="npsMedia" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 5 }} name="NPS Médio" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}