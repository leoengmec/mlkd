import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function FiltersBar({ filters, onChange, avaliacoes }) {
  const temas = [...new Set(avaliacoes.map((a) => a.tema).filter(Boolean))];
  const convidados = [...new Set(avaliacoes.map((a) => a.numero_convidados).filter(Boolean))];
  const proximas = ["3m", "6m", "12m", "nao_sei"];

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onChange({ dataInicio: "", dataFim: "", tema: "", convidados: "", proxima: "", pergunta: "" });
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold">Filtros</h3>
        {Object.values(filters).some(v => v) && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
            <X className="w-3 h-3 mr-1" /> Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        <div>
          <label className="text-xs font-semibold block mb-2">Data Início</label>
          <Input
            type="date"
            value={filters.dataInicio || ""}
            onChange={(e) => handleChange("dataInicio", e.target.value)}
            className="rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold block mb-2">Data Fim</label>
          <Input
            type="date"
            value={filters.dataFim || ""}
            onChange={(e) => handleChange("dataFim", e.target.value)}
            className="rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold block mb-2">Tema</label>
          <select
            value={filters.tema || ""}
            onChange={(e) => handleChange("tema", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background"
          >
            <option value="">Todos</option>
            {temas.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold block mb-2">Convidados</label>
          <select
            value={filters.convidados || ""}
            onChange={(e) => handleChange("convidados", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background"
          >
            <option value="">Todos</option>
            {convidados.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold block mb-2">Próxima Festa</label>
          <select
            value={filters.proxima || ""}
            onChange={(e) => handleChange("proxima", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background"
          >
            <option value="">Todos</option>
            <option value="3m">3 meses</option>
            <option value="6m">6 meses</option>
            <option value="12m">12 meses</option>
            <option value="nao_sei">Não sei</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold block mb-2">Mês</label>
          <Input
            type="month"
            value={filters.mes || ""}
            onChange={(e) => handleChange("mes", e.target.value)}
            className="rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  );
}