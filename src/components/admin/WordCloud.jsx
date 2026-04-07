import { useMemo } from "react";

export default function WordCloud({ avaliacoes }) {
  const words = useMemo(() => {
    const texts = avaliacoes
      .map((a) => a.texto_melhorar || "")
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const stopwords = new Set([
      "a", "o", "e", "que", "de", "para", "com", "um", "uma", "os", "as",
      "em", "é", "muito", "mais", "quando", "foi", "ser", "são", "foi",
      "mas", "seu", "sua", "ou", "esse", "essa", "este", "esse", "nós",
      "tenho", "temos", "você", "vocês", "ele", "ela", "eles", "elas",
      "por", "porque", "foi", "fomos", "vamos"
    ]);

    const wordList = texts
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopwords.has(w))
      .slice(0, 50);

    const frequency = {};
    wordList.forEach((w) => {
      frequency[w] = (frequency[w] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word, count]) => ({ word, count }));
  }, [avaliacoes]);

  const maxCount = words.length > 0 ? words[0].count : 1;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <h3 className="font-heading font-bold text-lg mb-4">Palavras-chave nas Sugestões</h3>
      {words.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Sem dados</p>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          {words.map((item) => {
            const size = 12 + (item.count / maxCount) * 20;
            const opacity = 0.6 + (item.count / maxCount) * 0.4;
            return (
              <span
                key={item.word}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold transition-all hover:bg-primary/20"
                style={{ fontSize: `${size}px`, opacity }}
                title={`${item.count} menções`}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}