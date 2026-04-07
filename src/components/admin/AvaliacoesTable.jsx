import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const getNpsColor = (v) => {
  if (v >= 9) return "text-green-600 bg-green-100";
  if (v >= 7) return "text-amber-600 bg-amber-100";
  return "text-red-600 bg-red-100";
};

export default function AvaliacoesTable({ avaliacoes }) {
  const [sort, setSort] = useState({ key: "data_envio", dir: "desc" });

  const sorted = [...avaliacoes]
    .sort((a, b) => {
      const va = a[sort.key] ?? "";
      const vb = b[sort.key] ?? "";
      return sort.dir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    })
    .slice(0, 20);

  const toggle = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  const SortIcon = ({ k }) => sort.key === k
    ? sort.dir === "asc" ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />
    : null;

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm overflow-x-auto">
      <h3 className="font-heading font-bold text-foreground mb-4">Últimas 20 Avaliações</h3>
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border">
            {[["nome", "Nome"], ["data_festa", "Data Festa"], ["tema", "Tema"], ["nps_geral", "NPS"], ["data_envio", "Enviado"]].map(([k, label]) => (
              <th key={k} className="pb-2 pr-4 cursor-pointer hover:text-foreground font-heading font-semibold" onClick={() => toggle(k)}>
                {label} <SortIcon k={k} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((a, i) => (
            <tr key={a.id} className={`border-b border-border/40 ${i % 2 === 0 ? "bg-muted/20" : ""}`}>
              <td className="py-2 pr-4 font-body">{a.nome || "—"}</td>
              <td className="py-2 pr-4 text-muted-foreground">{a.data_festa || "—"}</td>
              <td className="py-2 pr-4 text-muted-foreground">{a.tema || "—"}</td>
              <td className="py-2 pr-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getNpsColor(a.nps_geral)}`}>
                  {a.nps_geral}
                </span>
              </td>
              <td className="py-2 text-muted-foreground text-xs">
                {a.data_envio ? new Date(a.data_envio).toLocaleDateString("pt-BR") : "—"}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma avaliação encontrada</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}