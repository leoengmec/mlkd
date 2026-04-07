import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function FiltersBar({ filters, onChange, avaliacoes }) {
  const temas = useMemo(() => {
    const set = new Set(avaliacoes.map((a) => a.tema).filter(Boolean));
    return [...set].sort();
  }, [avaliacoes]);

  const update = (key, value) => onChange({ ...filters, [key]: value });
  const clear = () => onChange({ dataInicio: "", dataFim: "", tema: "", mes: "" });
  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-heading font-semibold text-muted-foreground">Data início</label>
          <Input type="date" value={filters.dataInicio} onChange={(e) => update("dataInicio", e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-heading font-semibold text-muted-foreground">Data fim</label>
          <Input type="date" value={filters.dataFim} onChange={(e) => update("dataFim", e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-heading font-semibold text-muted-foreground">Mês (AAAA-MM)</label>
          <Input type="month" value={filters.mes} onChange={(e) => update("mes", e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-heading font-semibold text-muted-foreground">Tema</label>
          <select
            value={filters.tema}
            onChange={(e) => update("tema", e.target.value)}
            className="h-8 text-sm rounded-md border border-input bg-background px-2 font-body"
          >
            <option value="">Todos os temas</option>
            {temas.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={clear} className="h-8 gap-1">
            <X className="w-3 h-3" /> Limpar
          </Button>
        )}
      </div>
    </div>
  );
}