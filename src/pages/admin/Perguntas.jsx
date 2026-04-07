import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import { Checkbox } from "@/components/ui/checkbox";

const TIPOS = [
  { value: "slider", label: "Slider" },
  { value: "texto", label: "Texto" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Data" },
  { value: "dropdown_temas", label: "Dropdown Temas" },
  { value: "dropdown", label: "Dropdown" },
  { value: "multipla", label: "Múltipla Escolha" },
];

export default function AdminPerguntas() {
  const navigate = useNavigate();
  const [perguntas, setPerguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [novaP, setNovaP] = useState({ titulo: "", tipo: "slider", ordem: 1, obrigatorio: false });

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) navigate("/admin/login");
    else setAdminData(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (adminData) {
      base44.entities.perguntas.list("ordem", 100).then((data) => {
        setPerguntas(data);
        setLoading(false);
      });
    }
  }, [adminData]);

  const handleCreate = async () => {
    if (!novaP.titulo.trim()) return;
    await base44.entities.perguntas.create({
      ...novaP,
      ativo: true,
      ordem: perguntas.length + 1,
    });
    setNovaP({ titulo: "", tipo: "slider", ordem: 1, obrigatorio: false });
    const updated = await base44.entities.perguntas.list("ordem", 100);
    setPerguntas(updated);
  };

  const handleDelete = async (id) => {
    if (confirm("Deseja excluir esta pergunta?")) {
      await base44.entities.perguntas.delete(id);
      setPerguntas(perguntas.filter((p) => p.id !== id));
    }
  };

  const handleReorder = async (id, novaOrdem) => {
    if (novaOrdem > 0 && novaOrdem <= perguntas.length) {
      await base44.entities.perguntas.update(id, { ordem: novaOrdem });
      const updated = await base44.entities.perguntas.list("ordem", 100);
      setPerguntas(updated);
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
      <main className="flex-1 p-6 max-w-5xl">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
          Gerenciar Perguntas
        </h1>

        {/* Form criar pergunta */}
        <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm mb-6 space-y-4">
          <h2 className="font-heading font-bold text-lg">Nova Pergunta</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Título"
              value={novaP.titulo}
              onChange={(e) => setNovaP({ ...novaP, titulo: e.target.value })}
              className="rounded-xl"
            />
            <select
              value={novaP.tipo}
              onChange={(e) => setNovaP({ ...novaP, tipo: e.target.value })}
              className="px-4 py-2 rounded-xl border border-input bg-background"
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={novaP.obrigatorio}
                onCheckedChange={(checked) =>
                  setNovaP({ ...novaP, obrigatorio: checked })
                }
              />
              <label className="text-sm font-heading">Obrigatório</label>
            </div>
          </div>
          <Button onClick={handleCreate} className="gap-2 w-full md:w-auto">
            <Plus className="w-4 h-4" />
            Criar
          </Button>
        </div>

        {/* Tabela perguntas */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-heading font-semibold">Ordem</th>
                <th className="px-4 py-3 text-left font-heading font-semibold">Título</th>
                <th className="px-4 py-3 text-left font-heading font-semibold">Tipo</th>
                <th className="px-4 py-3 text-center font-heading font-semibold">Obrigatório</th>
                <th className="px-4 py-3 text-right font-heading font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {perguntas.map((p) => (
                <tr key={p.id} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(p.id, p.ordem - 1)}
                        disabled={p.ordem <= 1}
                      >
                        ↑
                      </Button>
                      <span className="px-2 py-1 text-center min-w-8">{p.ordem}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(p.id, p.ordem + 1)}
                        disabled={p.ordem >= perguntas.length}
                      >
                        ↓
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body">{p.titulo}</td>
                  <td className="px-4 py-3 text-xs bg-muted/30 rounded px-2 py-1 w-fit">
                    {TIPOS.find((t) => t.value === p.tipo)?.label}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.obrigatorio ? "✓" : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {perguntas.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma pergunta cadastrada
            </div>
          )}
        </div>
      </main>
    </div>
  );
}