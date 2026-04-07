import { useMemo } from "react";

const STOP_WORDS = new Set([
  "de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "é", "com", "uma", "os",
  "no", "se", "na", "por", "mais", "as", "dos", "mas", "ao", "ele", "das", "à", "seu",
  "sua", "ou", "ser", "quando", "muito", "há", "nos", "já", "está", "eu", "também",
  "só", "pelo", "pela", "até", "isso", "ela", "entre", "era", "depois", "sem", "mesmo",
  "aos", "ter", "seus", "foi", "não", "como", "sobre", "num", "que", "foi", "são"
]);

function getWords(avaliacoes) {
  const freq = {};
  avaliacoes.forEach((a) => {
    if (!a.texto_melhorar) return;
    a.texto_melhorar
      .toLowerCase()
      .replace(/[^a-záàâãéèêíïóôõöúçñ\s]/gi, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
      .forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40);
}

const COLORS = [
  "text-primary", "text-secondary", "text-accent-foreground", "text-green-600",
  "text-violet-600", "text-pink-500", "text-orange-500", "text-teal-600"
];

export default function WordCloud({ avaliacoes }) {
  const words = useMemo(() => getWords(avaliacoes), [avaliacoes]);
  const max = words[0]?.[1] || 1;

  const textos = avaliacoes
    .filter((a) => a.texto_melhorar && a.texto_melhorar.length > 5)
    .slice(0, 10);

  if (words.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-8 border border-border/50 text-center text-muted-foreground">
        Nenhum texto de melhoria encontrado ainda.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
        <h3 className="font-heading font-bold text-foreground mb-4">☁️ Palavras mais citadas</h3>
        <div className="flex flex-wrap gap-3 items-center justify-center py-4">
          {words.map(([word, count], i) => {
            const size = 0.75 + (count / max) * 1.5;
            return (
              <span
                key={word}
                className={`font-heading font-bold cursor-default transition-transform hover:scale-110 ${COLORS[i % COLORS.length]}`}
                style={{ fontSize: `${size}rem` }}
                title={`${count} menção${count > 1 ? "ões" : ""}`}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
        <h3 className="font-heading font-bold text-foreground mb-4">💬 Sugestões recentes</h3>
        <div className="space-y-3">
          {textos.map((a, i) => (
            <div key={a.id} className="bg-muted/40 rounded-xl p-4">
              <p className="text-sm text-foreground font-body leading-relaxed">"{a.texto_melhorar}"</p>
              <p className="text-xs text-muted-foreground mt-2">
                {a.nome || "Anônimo"} • {a.data_festa || "—"} {a.tema ? `• ${a.tema}` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}