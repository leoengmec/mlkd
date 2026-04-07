import { useState, useEffect } from "react";
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
import SelectDropdown from "../components/SelectDropdown";
import MultiSelect from "../components/MultiSelect";

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

const TEMAS_PADRAO = [
  "Princesa", "Super-heróis", "Fazendinha", "Minecraft", "Unicórnio",
  "Dinos", "Paw Patrol", "Frozen", "Carros", "Jurassic World",
  "Meninas Poderosas", "Bob Esponja", "Peppa Pig", "Turma da Mônica", "Futebol"
];

const MOTIVOS = [
  { label: "Preço", value: "preco" },
  { label: "Local", value: "local" },
  { label: "Amigos recomendaram", value: "amigos" },
  { label: "Rede social", value: "rede_social" },
  { label: "Animação", value: "animacao" }
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
  const [telefone, setTelefone] = useState("");
  const [idadeC, setIdadeC] = useState("");
  const [nConvidados, setNConvidados] = useState("");
  const [motivoEscolha, setMotivoEscolha] = useState([]);
  const [precoValor, setPrecoValor] = useState(5);
  const [proximaFesta, setProximaFesta] = useState("");
  const [temas, setTemas] = useState([]);
  const [errors, setErrors] = useState({});
  const [aceitaLGPD, setAceitaLGPD] = useState(false);

  const updateNota = (key, value) => {
    setNotas((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    base44.entities.temas.list().then((data) => {
      const nomes = data.filter((t) => t.ativo).map((t) => t.nome);
      setTemas(nomes.length ? nomes : TEMAS_PADRAO);
    }).catch(() => setTemas(TEMAS_PADRAO));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (nome.length > 100) newErrors.nome = "Máximo 100 caracteres";
    if (!aceitaLGPD) newErrors.lgpd = "Você deve aceitar a Política de Privacidade";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSending(true);
    localStorage.setItem("clientEmail", nome);
    await base44.entities.avaliacoes.create({
      nome: nome || "Anônimo",
      telefone,
      data_festa: dataFesta,
      tema,
      nps_geral: npsGeral,
      notas_json: notas,
      indica: indica ?? false,
      refaz: refaz ?? false,
      texto_melhorar: textoMelhorar,
      idade_crianca: idadeC,
      numero_convidados: nConvidados,
      motivo_escolha: motivoEscolha,
      preco_valor: precoValor,
      proxima_festa: proximaFesta,
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
                Seu nome *
              </label>
              <Input
                placeholder="Ex: Maria Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value.slice(0, 100))}
                maxLength="100"
                className={`rounded-xl ${errors.nome ? "border-red-500" : ""}`}
              />
              {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold font-heading text-foreground">
                Telefone para contato
              </label>
              <Input
                type="tel"
                placeholder="Ex: (11) 9999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value.slice(0, 15))}
                maxLength="15"
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">Opcional - apenas para contato pós-festa</p>
            </div>

            <SelectDropdown
              label="Tema da festa"
              icon="🎭"
              value={tema}
              onChange={setTema}
              options={[...temas.map((t) => ({ label: t, value: t })), { label: "Outro (especifique)", value: "outro" }]}
            />

            <SelectDropdown
              label="Idade da criança"
              icon="👧"
              value={idadeC}
              onChange={setIdadeC}
              options={[
                { label: "1-3 anos", value: "1-3" },
                { label: "4-6 anos", value: "4-6" },
                { label: "7+ anos", value: "7+" }
              ]}
            />

            <SelectDropdown
              label="Número de convidados"
              icon="👥"
              value={nConvidados}
              onChange={setNConvidados}
              options={[
                { label: "Menos de 20", value: "<20" },
                { label: "20 a 50", value: "20-50" },
                { label: "Mais de 50", value: "50+" }
              ]}
            />
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

          {/* Novos campos */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm space-y-5"
          >
            <h2 className="font-heading font-bold text-lg flex items-center gap-2">
              📍 Informações Adicionais
            </h2>

            <MultiSelect
              label="Por que escolheu o Mulekada?"
              icon="🎯"
              value={motivoEscolha}
              onChange={setMotivoEscolha}
              options={MOTIVOS}
            />

            <RatingSlider
              label="Preço x Valor"
              value={precoValor}
              onChange={setPrecoValor}
              icon="💰"
            />

            <SelectDropdown
              label="Quando faria a próxima festa?"
              icon="🎪"
              value={proximaFesta}
              onChange={setProximaFesta}
              options={[
                { label: "Em 3 meses", value: "3m" },
                { label: "Em 6 meses", value: "6m" },
                { label: "Em 12 meses", value: "12m" },
                { label: "Não sei", value: "nao_sei" }
              ]}
            />
          </motion.section>

          {/* LGPD Consent */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm space-y-3"
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aceitaLGPD}
                onChange={(e) => setAceitaLGPD(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-input"
              />
              <span className="text-sm text-foreground">
                Aceito a <Link to="/privacidade" className="text-primary font-semibold hover:underline" target="_blank">Política de Privacidade</Link> e autorizo o processamento dos meus dados conforme a LGPD *
              </span>
            </label>
            {errors.lgpd && <p className="text-xs text-red-500">{errors.lgpd}</p>}
          </motion.section>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={sending}
              size="lg"
              className="w-full font-heading font-bold text-lg py-6 rounded-xl bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
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