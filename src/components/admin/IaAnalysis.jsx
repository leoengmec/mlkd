import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

export default function IaAnalysis({ avaliacoes, userEmail }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const lowScores = avaliacoes
        .flatMap((a) =>
          Object.entries(a.notas_json || {})
            .filter(([_, score]) => score <= 5)
            .map(([cat, score]) => `${cat}: ${score}`)
        )
        .slice(0, 20)
        .join(", ");

      const suggestions = avaliacoes
        .map((a) => a.texto_melhorar)
        .filter(Boolean)
        .slice(0, 10)
        .join("; ");

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise este feedback de cliente (Mulekada Buffet) e sugira 3 ações prioritárias:\n\nNotas baixas: ${lowScores}\n\nSugestões: ${suggestions}`,
        response_json_schema: {
          type: "object",
          properties: {
            acoes: {
              type: "array",
              items: { type: "string" },
            },
            tendencias: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      });

      setResult(response.data);
    } catch (error) {
      console.error("Erro ao analisar:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> Análise IA
        </h3>
        <Button onClick={handleAnalyze} disabled={analyzing} size="sm">
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {analyzing ? "Analisando..." : "Gerar Análise"}
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Ações Prioritárias:</h4>
            <ul className="space-y-2">
              {result.acoes?.map((acao, i) => (
                <li key={i} className="text-sm text-foreground flex gap-2">
                  <span className="text-primary font-bold">•</span> {acao}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Tendências Identificadas:</h4>
            <ul className="space-y-2">
              {result.tendencias?.map((tend, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-secondary font-bold">•</span> {tend}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}