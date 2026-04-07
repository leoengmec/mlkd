import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle, Loader2, Mail, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIAS = {
  reserva_contato: "Reserva/Contato",
  monitores: "Monitores",
  garconetes: "Garçonetes",
  supervisora: "Supervisora",
  recepcao: "Recepção",
  buffet: "Buffet",
  climatizacao: "Climatização",
  limpeza: "Limpeza",
  alimentos: "Alimentos",
  brinquedos: "Brinquedos",
};

function calcMedias(avaliacoes) {
  return Object.entries(CATEGORIAS).map(([key, label]) => {
    const vals = avaliacoes.map((a) => a.notas_json?.[key]).filter((v) => v != null);
    const media = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
    return { key, label, media: media !== null ? parseFloat(media.toFixed(1)) : null };
  }).filter((c) => c.media !== null);
}

function getBadge(v) {
  if (v < 6.5) return "bg-red-100 text-red-700";
  if (v < 7) return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-600";
}

export default function IaAnalysis({ avaliacoes, userEmail }) {
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [expanded, setExpanded] = useState({});

  const medias = calcMedias(avaliacoes);
  const ruins = medias.filter((c) => c.media < 7);
  const npsMedia = avaliacoes.length
    ? (avaliacoes.reduce((s, a) => s + (a.nps_geral || 0), 0) / avaliacoes.length).toFixed(1)
    : null;
  const npsAlerta = npsMedia && parseFloat(npsMedia) < 7;

  const textos = avaliacoes
    .filter((a) => a.texto_melhorar?.trim())
    .slice(0, 20)
    .map((a) => `[${a.tema || "s/tema"}] ${a.texto_melhorar}`)
    .join("\n");

  const analisar = async () => {
    setLoading(true);
    setResult(null);

    const ruinsTexto = ruins.map((r) => `${r.label}: ${r.media}/10`).join(", ");

    const prompt = `Você é consultor de qualidade de um buffet infantil chamado Mulekada Buffet.

DADOS:
- NPS médio: ${npsMedia}/10
- Itens com nota abaixo de 7: ${ruinsTexto || "Nenhum"}
- Comentários dos clientes (últimos): 
${textos || "Nenhum comentário disponível"}

Análise solicitada:
1. Identifique os 3 principais pontos fracos
2. Resuma os temas mais recorrentes nos comentários
3. Gere 3 a 5 sugestões de ação concretas para cada item ruim, incluindo custo estimado (R$) e impacto esperado (baixo/médio/alto)

Responda em JSON com o schema abaixo.`;

    const schema = {
      type: "object",
      properties: {
        pontos_fracos: {
          type: "array",
          items: { type: "string" }
        },
        temas_comentarios: {
          type: "array",
          items: { type: "string" }
        },
        acoes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              categoria: { type: "string" },
              nota: { type: "number" },
              sugestoes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    acao: { type: "string" },
                    custo_estimado: { type: "string" },
                    impacto: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
    });

    setResult(res);
    setLoading(false);
  };

  const enviarAlerta = async () => {
    setEmailLoading(true);
    const ruinsTexto = ruins.map((r) => `• ${r.label}: ${r.media}/10`).join("\n");
    const body = `⚠️ ALERTA DE QUALIDADE — Mulekada Buffet

NPS Médio atual: ${npsMedia}/10 ${npsAlerta ? "⚠️ ABAIXO DE 7" : ""}

Itens com nota abaixo de 7:
${ruinsTexto || "Nenhum item crítico"}

Itens com nota crítica (<6.5):
${ruins.filter((r) => r.media < 6.5).map((r) => `• ${r.label}: ${r.media}/10 🔴`).join("\n") || "Nenhum"}

Total de avaliações analisadas: ${avaliacoes.length}

Acesse o dashboard para ver a análise completa de IA.`;

    await base44.integrations.Core.SendEmail({
      to: userEmail,
      subject: `⚠️ Alerta Qualidade Mulekada — NPS ${npsMedia} | ${ruins.length} item(ns) abaixo de 7`,
      body,
    });
    setEmailSent(true);
    setEmailLoading(false);
  };

  const toggle = (i) => setExpanded((e) => ({ ...e, [i]: !e[i] }));

  const hasAlertas = npsAlerta || ruins.some((r) => r.media < 6.5);

  return (
    <div className="space-y-5">
      {/* Alertas visuais */}
      {hasAlertas && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-heading font-bold text-red-700 text-sm">Alertas detectados</p>
            <ul className="text-xs text-red-600 mt-1 space-y-0.5">
              {npsAlerta && <li>• NPS médio {npsMedia}/10 está abaixo de 7</li>}
              {ruins.filter((r) => r.media < 6.5).map((r) => (
                <li key={r.key}>• {r.label} com nota crítica: {r.media}/10</li>
              ))}
            </ul>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100 gap-2 shrink-0"
            onClick={enviarAlerta}
            disabled={emailLoading || emailSent}
          >
            {emailLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : emailSent ? <CheckCircle2 className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
            {emailSent ? "Enviado!" : "Enviar alerta e-mail"}
          </Button>
        </div>
      )}

      {/* Resumo médias por categoria */}
      <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-heading font-bold text-foreground">🔍 Itens abaixo de 7/10</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{ruins.length} item(ns) precisam de atenção</p>
          </div>
          <Button
            onClick={analisar}
            disabled={loading || ruins.length === 0}
            className="gap-2 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 font-heading font-bold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Analisando..." : "Analisar com IA"}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {medias.map((c) => (
            <div key={c.key} className={`rounded-xl px-3 py-2 text-center ${getBadge(c.media)}`}>
              <p className="text-lg font-bold font-heading">{c.media}</p>
              <p className="text-xs font-body">{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resultado IA */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Pontos fracos */}
            {result.pontos_fracos?.length > 0 && (
              <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
                <h4 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                  <span>⚠️</span> Principais Pontos Fracos
                </h4>
                <ul className="space-y-2">
                  {result.pontos_fracos.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Temas comentários */}
            {result.temas_comentarios?.length > 0 && (
              <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
                <h4 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                  <span>💬</span> Temas Recorrentes nos Comentários
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.temas_comentarios.map((t, i) => (
                    <span key={i} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-heading font-semibold">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Ações por categoria */}
            {result.acoes?.length > 0 && (
              <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
                <h4 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Plano de Ação por Categoria
                </h4>
                <div className="space-y-3">
                  {result.acoes.map((item, i) => (
                    <div key={i} className="border border-border/60 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggle(i)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getBadge(item.nota)}`}>
                            {item.nota}/10
                          </span>
                          <span className="font-heading font-semibold text-foreground text-sm">{item.categoria}</span>
                        </div>
                        {expanded[i] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      {expanded[i] && (
                        <div className="px-4 py-3 space-y-2">
                          {item.sugestoes?.map((s, j) => (
                            <div key={j} className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm bg-muted/20 rounded-lg p-3">
                              <span className="flex-1 text-foreground font-body">{s.acao}</span>
                              <div className="flex gap-2 shrink-0">
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">{s.custo_estimado}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.impacto?.toLowerCase() === "alto" ? "bg-primary/10 text-primary" : s.impacto?.toLowerCase() === "médio" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                                  {s.impacto}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}