import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";

export default function AdminAnalises() {
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analisando, setAnalisando] = useState(false);
  const [resultados, setResultados] = useState(null);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) navigate("/admin/login");
    else setAdminData(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (adminData) {
      base44.entities.avaliacoes.list("-data_envio", 500).then((data) => {
        setAvaliacoes(data);
        setLoading(false);
      });
    }
  }, [adminData]);

  const handleAnalise = async () => {
    if (avaliacoes.length === 0) return;
    setAnalisando(true);

    const resumo = avaliacoes
      .filter((a) => a.texto_melhorar)
      .map((a) => `${a.nome}: ${a.texto_melhorar}`)
      .slice(0, 20)
      .join("\n");

    const baixas = Object.entries(
      avaliacoes.reduce((acc, a) => {
        if (!a.notas_json) return acc;
        for (const [cat, nota] of Object.entries(a.notas_json)) {
          if (nota < 7) {
            acc[cat] = (acc[cat] || 0) + 1;
          }
        }
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]);

    const prompt = `Analise os dados de satisfação de um buffet infantil:
    
Feedback dos clientes (resumo):
${resumo}

Categorias com notas baixas (<7):
${baixas.map((b) => `${b[0]}: ${b[1]} reclamações`).join("\n")}

Forneça 5 ações concretas de melhoria com impacto estimado (baixo/médio/alto) e custo aproximado (R$ 0-1000/1000-5000/5000+).`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          acoes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                acao: { type: "string" },
                impacto: { type: "string", enum: ["baixo", "médio", "alto"] },
                custo: { type: "string", enum: ["R$ 0-1000", "R$ 1000-5000", "R$ 5000+"] },
              },
            },
          },
          tendencias: { type: "array", items: { type: "string" } },
        },
      },
    });

    setResultados(response.data);
    setAnalisando(false);
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 max-w-4xl">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
          <Sparkles className="inline-block w-6 h-6 mr-2" />
          Análises Avançadas
        </h1>

        <Button
          onClick={handleAnalise}
          disabled={analisando || avaliacoes.length === 0}
          className="gap-2 mb-6"
        >
          {analisando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Gerar Análises IA
            </>
          )}
        </Button>

        {resultados && (
          <div className="space-y-6">
            {/* Ações */}
            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
              <h2 className="font-heading font-bold text-lg mb-4">5 Ações Recomendadas</h2>
              <div className="space-y-3">
                {resultados.acoes?.map((acao, i) => (
                  <div key={i} className="p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="font-body font-semibold text-foreground">{acao.acao}</p>
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {acao.impacto}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                          {acao.custo}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tendências */}
            {resultados.tendencias && (
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
                <h2 className="font-heading font-bold text-lg mb-4">Tendências Identificadas</h2>
                <ul className="space-y-2">
                  {resultados.tendencias.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 font-body text-foreground">
                      <span className="text-primary font-bold">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!resultados && avaliacoes.length > 0 && (
          <div className="bg-card rounded-2xl p-8 border border-border/50 text-center text-muted-foreground">
            Clique em "Gerar Análises IA" para começar
          </div>
        )}

        {avaliacoes.length === 0 && (
          <div className="bg-card rounded-2xl p-8 border border-border/50 text-center text-muted-foreground">
            Nenhuma avaliação para analisar
          </div>
        )}
      </main>
    </div>
  );
}