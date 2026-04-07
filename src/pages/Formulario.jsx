import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import RatingSlider from "../components/RatingSlider";
import BooleanToggle from "../components/BooleanToggle";

const categorias = [
  { key: "reserva_contato", label: "Reserva / Contato", icon: "📞" },
  { key: "monitores", label: "Monitores", icon: "🧑‍🏫" },
  { key: "garconetes", label: "Garçonetes", icon: "🍽️" },
  { key: "supervisora", label: "Supervisora", icon: "👩‍💼" },
  { key: "recepcao", label: "Recepção", icon: "🏠" },
  { key: "buffet", label: "Buffet", icon: "🍕" },
  { key: "climatizacao", label: "Climatização", icon: "❄️" },
  { key: "limpeza", label: "Limpeza", icon: "✨" },
  { key: "alimentos", label: "Alimentos", icon: "🥗" },
  { key: "brinquedos", label: "Brinquedos", icon: "🎠" },
];

export default function Formulario() {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);

  const [nome, setNome] = useState("");
  const [dataFesta, setDataFesta] = useState("");
  const [tema, setTema] = useState("");
  const [npsGeral, setNpsGeral] = useState(7);
  const [notas, setNotas] = useState(
    Object.fromEntries(categorias.map((c) => [c.key, 7]))
  );
  const [indica, setIndica] = useState(null);
  const [refaz, setRefaz] = useState(null);
  const [textoMelhorar, setTextoMelhorar] = useState("");

  const updateNota = (key, value) => {
    setNotas((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSending(true);
    await base44.entities.avaliacoes.create({
      nome: nome || "Anônimo",
      data_festa: dataFesta,
      tema,
      nps_geral: npsGeral,
      notas_json: notas,
      indica: indica ?? false,
      refaz: refaz ?? false,
      texto_melhorar: textoMelhorar,
      data_envio: new Date().toISOString(),
    });
    navigate("/confirmacao");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Avaliação 🎉
            </h1>
            <p className="text-sm text-muted-foreground">
              Conte como foi a festa!
            </p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Info section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm space-y-4"
          >
            <h2 className="font-heading font-bold text-lg flex items-center gap-2">
              📋 Dados da Festa
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold font-heading text-foreground">
                Seu nome (opcional)
              </label>
              <Input
                placeholder="Ex: Maria Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold font-heading text-foreground">
                Data da festa
              </label>
              <Input
                type="date"
                value={dataFesta}
                onChange={(e) => setDataFesta(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold font-heading text-foreground">
                Tema da festa
              </label>
              <Input
                placeholder="Ex: Princesas, Super-heróis..."
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </motion.section>

          {/* NPS Geral */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm"
          >
            <h2 className="font-heading font-bold text-lg flex items-center gap-2 mb-4">
              ⭐ Nota Geral
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              De 0 a 10, qual nota você dá para o Mulekada?
            </p>
            <RatingSlider
              label="NPS Geral"
              value={npsGeral}
              onChange={setNpsGeral}
              icon="🏆"
            />
          </motion.section>

          {/* Category ratings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm space-y-5"
          >
            <h2 className="font-heading font-bold text-lg flex items-center gap-2">
              📊 Avalie cada área
            </h2>
            {categorias.map((cat) => (
              <RatingSlider
                key={cat.key}
                label={cat.label}
                value={notas[cat.key]}
                onChange={(v) => updateNota(cat.key, v)}
                icon={cat.icon}
              />
            ))}
          </motion.section>

          {/* Boolean questions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm space-y-5"
          >
            <h2 className="font-heading font-bold text-lg flex items-center gap-2">
              💬 Mais sobre você
            </h2>
            <BooleanToggle
              label="Indicaria o Mulekada para amigos?"
              value={indica}
              onChange={setIndica}
              icon="🤝"
            />
            <BooleanToggle
              label="Faria outra festa conosco?"
              value={refaz}
              onChange={setRefaz}
              icon="🎂"
            />
          </motion.section>

          {/* Open text */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm space-y-3"
          >
            <h2 className="font-heading font-bold text-lg flex items-center gap-2">
              💡 O que podemos melhorar?
            </h2>
            <Textarea
              placeholder="Sua sugestão é muito importante para nós..."
              value={textoMelhorar}
              onChange={(e) => setTextoMelhorar(e.target.value)}
              rows={4}
              className="rounded-xl resize-none"
            />
          </motion.section>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={sending}
              size="lg"
              className="w-full font-heading font-bold text-lg py-6 rounded-xl bg-gradient-to-r from-primary to-pink-400 hover:from-primary/90 hover:to-pink-400/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              {sending ? "Enviando..." : "Enviar Avaliação 🚀"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}