import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const categories = [
  { key: 'reserva_contato', label: 'Reserva/Contato' },
  { key: 'monitores', label: 'Monitores' },
  { key: 'garconetes', label: 'Garçonetes' },
  { key: 'supervisora', label: 'Supervisora' },
  { key: 'recepcao', label: 'Recepção' },
  { key: 'buffet', label: 'Buffet' },
  { key: 'climatizacao', label: 'Climatização' },
  { key: 'limpeza', label: 'Limpeza' },
  { key: 'alimentos', label: 'Alimentos' },
  { key: 'brinquedos', label: 'Brinquedos' },
];

function pearsonCorrelation(x, y) {
  const n = x.length;
  if (n === 0) return 0;
  
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  
  const stdX = Math.sqrt(x.reduce((a, val) => a + Math.pow(val - meanX, 2), 0) / n);
  const stdY = Math.sqrt(y.reduce((a, val) => a + Math.pow(val - meanY, 2), 0) / n);
  
  if (stdX === 0 || stdY === 0) return 0;
  
  const covariance = x.reduce((a, val, i) => a + (val - meanX) * (y[i] - meanY), 0) / n;
  return covariance / (stdX * stdY);
}

export default function CorrelationsInsights({ avaliacoes }) {
  const insights = useMemo(() => {
    if (!avaliacoes || avaliacoes.length < 3) {
      return { correlations: [], insights: [], recommendations: [] };
    }

    // Extrair dados
    const npsValues = avaliacoes.map(a => a.nps_geral || 0);
    const correlations = [];

    categories.forEach((cat) => {
      const catValues = avaliacoes.map(a => a.notas_json?.[cat.key] || 0);
      const corr = pearsonCorrelation(npsValues, catValues);
      correlations.push({ ...cat, correlation: corr, abs: Math.abs(corr) });
    });

    // Ordenar por correlação absoluta
    const sorted = [...correlations].sort((a, b) => b.abs - a.abs);

    // Gerar insights
    const insights_list = [];
    const recommendations = [];

    // Correlações positivas fortes (> 0.7)
    const strongPositive = sorted.filter(c => c.correlation > 0.7);
    if (strongPositive.length > 0) {
      insights_list.push({
        type: 'positive',
        title: 'Pontos Fortes',
        message: `${strongPositive.map(c => c.label).join(', ')} têm forte impacto no NPS geral.`,
        icon: CheckCircle2,
      });
      strongPositive.forEach(c => {
        recommendations.push({
          priority: 'high',
          text: `✅ Manter excelência em "${c.label}" - é um diferencial chave`,
        });
      });
    }

    // Correlações negativas fortes (< -0.5)
    const strongNegative = sorted.filter(c => c.correlation < -0.5);
    if (strongNegative.length > 0) {
      insights_list.push({
        type: 'critical',
        title: 'Áreas Críticas',
        message: `Problemas em ${strongNegative.map(c => c.label).join(', ')} reduzem significativamente a satisfação.`,
        icon: AlertCircle,
      });
      strongNegative.forEach(c => {
        recommendations.push({
          priority: 'critical',
          text: `🚨 URGENTE: Melhorar "${c.label}" - forte impacto negativo no NPS`,
        });
      });
    }

    // Correlações neutras (próximas a 0)
    const neutral = sorted.filter(c => Math.abs(c.correlation) < 0.3);
    if (neutral.length > 0) {
      recommendations.push({
        priority: 'medium',
        text: `📊 Investigar por que ${neutral.slice(0, 2).map(c => c.label).join(', ')} não afetam o NPS - possível oportunidade de otimizar recursos`,
      });
    }

    return { correlations: sorted, insights: insights_list, recommendations };
  }, [avaliacoes]);

  if (!avaliacoes || avaliacoes.length < 3) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Insuficientes dados para gerar insights (mín. 3 avaliações)
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Insights */}
      {insights.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              📌 Insights dos Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    insight.type === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      insight.type === 'critical' ? 'text-red-600' : 'text-green-600'
                    }`} />
                    <div>
                      <p className={`font-semibold text-sm ${
                        insight.type === 'critical' ? 'text-red-900' : 'text-green-900'
                      }`}>
                        {insight.title}
                      </p>
                      <p className={`text-sm mt-1 ${
                        insight.type === 'critical' ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      {insights.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💡 Recomendações de Ação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.recommendations
                .sort((a, b) => {
                  const priority = { critical: 0, high: 1, medium: 2 };
                  return priority[a.priority] - priority[b.priority];
                })
                .map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-sm ${
                      rec.priority === 'critical'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : rec.priority === 'high'
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {rec.text}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking de Impacto */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Ranking de Impacto no NPS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.correlations.slice(0, 10).map((cat, idx) => (
              <div key={cat.key} className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50">
                <span className="font-medium">{idx + 1}. {cat.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded h-2">
                    <div
                      className={`h-full rounded transition-all ${
                        cat.correlation > 0.5
                          ? 'bg-green-500'
                          : cat.correlation > 0
                          ? 'bg-blue-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.abs(cat.correlation) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                    {cat.correlation.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}