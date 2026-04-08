import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, BarChart2, TrendingUp } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Footer from "../../components/Footer";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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

  const statsData = useMemo(() => {
    if (!avaliacoes.length) return null;
    console.log(`[Análises IA] Dataset size: ${avaliacoes.length}`);
    const cats = ["reserva_contato","monitores","garconetes","supervisora","recepcao","buffet","climatizacao","limpeza","alimentos","brinquedos"];
    const labels = { reserva_contato:"Reserva", monitores:"Monitores", garconetes:"Garçonetes", supervisora:"Supervisora", recepcao:"Recepção", buffet:"Buffet", climatizacao:"Climatização", limpeza:"Limpeza", alimentos:"Alimentos", brinquedos:"Brinquedos" };
    return cats.map(cat => {
      const vals = avaliacoes.map(a => a.notas_json?.[cat]).filter(v => v !== undefined && v !== null);
      const avg = vals.length ? (vals.reduce((s,v) => s+v, 0) / vals.length).toFixed(2) : 0;
      return { cat: labels[cat], media: parseFloat(avg) };
    });
  }, [avaliacoes]);

  const handleAnalise = async () => {
    if (avaliacoes.length === 0) return;
    setAnalisando(true);
    console.log(`[Análises IA] Iniciando análise com dataset size: ${avaliacoes.length}`);

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

    const avgNps = (avaliacoes.reduce((s,a) => s+(a.nps_geral||0), 0) / avaliacoes.length).toFixed(1);
    const temasDist = avaliacoes.reduce((acc,a) => { if(a.tema) acc[a.tema]=(acc[a.tema]||0)+1; return acc; }, {});
    const topTemas = Object.entries(temasDist).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([t,c])=>`${t}(${c})`).join(", ");

    const prompt = `Analise os dados de satisfação de um buffet infantil com ${avaliacoes.length} avaliações:
    
Feedback dos clientes (resumo):
${resumo}

Categorias com notas baixas (<7):
${baixas.map((b) => `${b[0]}: ${b[1]} reclamações`).join("\n")}

Estatísticas gerais: NPS médio=${avgNps} | Top temas: ${topTemas}

Forneça 5 ações concretas de melhoria com impacto estimado (baixo/médio/alto) e custo aproximado (R$ 0-1000/1000-5000/5000+). Seja específico para buffet infantil.`;

    try {
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
      console.log("[Análises IA] Resposta recebida:", response);
      setResultados(response);
    } catch (e) {
      console.error("[Análises IA] Erro:", e);
    } finally {
      setAnalisando(false);
    }
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
      <div className="flex-1 flex flex-col">
      <main className="flex-1 p-6 max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> Análises Avançadas
          </h1>
          <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
            Dataset: {avaliacoes.length} avaliações
          </span>
        </div>

        {/* Médias por categoria */}
        {statsData && (
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Médias por Categoria (Dataset completo)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cat" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} />
                <Tooltip formatter={(v) => v.toFixed(2)} />
                <Bar dataKey="media" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <Button onClick={handleAnalise} disabled={analisando || avaliacoes.length === 0} className="gap-2" size="lg">
          {analisando ? <><Loader2 className="w-4 h-4 animate-spin" /> Analisando {avaliacoes.length} registros...</> : <><Sparkles className="w-4 h-4" /> Gerar Análises IA ({avaliacoes.length} avaliações)</>}
        </Button>

        {resultados && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
              <h2 className="font-heading font-bold text-lg mb-4">5 Ações Recomendadas</h2>
              <div className="space-y-3">
                {resultados.acoes?.map((acao, i) => (
                  <div key={i} className="p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-body font-semibold text-foreground">{i+1}. {acao.acao}</p>
                      <div className="flex gap-2 shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          acao.impacto === 'alto' ? 'bg-green-100 text-green-700' :
                          acao.impacto === 'médio' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                        }`}>{acao.impacto}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">{acao.custo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {resultados.tendencias && (
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
                <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Tendências Identificadas</h2>
                <ul className="space-y-2">
                  {resultados.tendencias.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground text-sm p-3 bg-muted/30 rounded-lg"><span className="text-primary font-bold shrink-0">•</span>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!resultados && avaliacoes.length > 0 && (
          <div className="bg-card rounded-2xl p-8 border border-border/50 text-center text-muted-foreground">Clique em "Gerar Análises IA" para começar</div>
        )}
        {avaliacoes.length === 0 && (
          <div className="bg-card rounded-2xl p-8 border border-border/50 text-center text-muted-foreground">Nenhuma avaliação para analisar</div>
        )}
      </main>
      <Footer />
      </div>
    </div>
  );
}