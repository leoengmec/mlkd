import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Footer from "../../components/Footer";

export default function AdminTemas() {
  const navigate = useNavigate();
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoTema, setNovoTema] = useState("");
  const [editando, setEditando] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) navigate("/admin/login");
    else setAdminData(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (adminData) {
      base44.entities.temas.list("-updated_date", 100).then((data) => {
        setTemas(data);
        setLoading(false);
      });
    }
  }, [adminData]);

  const handleCreate = async () => {
    if (!novoTema.trim()) return;
    await base44.entities.temas.create({ nome: novoTema, ativo: true });
    setNovoTema("");
    const updated = await base44.entities.temas.list("-updated_date", 100);
    setTemas(updated);
  };

  const handleDelete = async (id) => {
    if (confirm("Deseja excluir este tema?")) {
      await base44.entities.temas.delete(id);
      setTemas(temas.filter((t) => t.id !== id));
    }
  };

  const handleEdit = (tema) => { setEditando(tema.id); setEditValue(tema.nome); };

  const handleSaveEdit = async (id) => {
    if (!editValue.trim()) return;
    await base44.entities.temas.update(id, { nome: editValue });
    setTemas(temas.map(t => t.id === id ? { ...t, nome: editValue } : t));
    setEditando(null);
  };

  const handleToggleAtivo = async (id, ativo) => {
    await base44.entities.temas.update(id, { ativo: !ativo });
    setTemas(temas.map((t) => (t.id === id ? { ...t, ativo: !ativo } : t)));
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
      <main className="flex-1 p-6 max-w-4xl">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
          Cadastrar Temas
        </h1>

        {/* Form criar tema */}
        <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm mb-6 space-y-4">
          <h2 className="font-heading font-bold text-lg">Novo Tema</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Nome do tema (ex: Princesa)"
              value={novoTema}
              onChange={(e) => setNovoTema(e.target.value)}
              className="rounded-xl"
              onKeyPress={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar
            </Button>
          </div>
        </div>

        {/* Tabela temas */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left font-heading font-semibold text-foreground">
                  Nome
                </th>
                <th className="px-6 py-3 text-left font-heading font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-right font-heading font-semibold text-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {temas.map((tema) => (
                <tr key={tema.id} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="px-6 py-3 font-body">
                     {editando === tema.id ? (
                       <div className="flex gap-2 items-center">
                         <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="h-8 text-sm" onKeyDown={e => e.key === "Enter" && handleSaveEdit(tema.id)} autoFocus />
                         <Button size="sm" variant="ghost" onClick={() => handleSaveEdit(tema.id)}><Check className="w-3 h-3 text-green-600" /></Button>
                         <Button size="sm" variant="ghost" onClick={() => setEditando(null)}><X className="w-3 h-3 text-red-500" /></Button>
                       </div>
                     ) : tema.nome}
                   </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        tema.ativo
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tema.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(tema)} className="text-blue-600 hover:bg-blue-50">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleAtivo(tema.id, tema.ativo)} className="gap-1">
                      {tema.ativo ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(tema.id)} className="text-red-600 hover:bg-red-100">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {temas.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum tema cadastrado
            </div>
          )}
        </div>
      <Footer />
      </main>
    </div>
  );
}