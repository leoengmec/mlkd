import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function OpcoesCconvidados() {
  const navigate = useNavigate();
  const [opcoes, setOpcoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [novaOpcao, setNovaOpcao] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) {
      navigate("/admin/login");
    } else {
      setAdminData(JSON.parse(stored));
      base44.entities.opcoes_convidados.list().then((data) => {
        if (data.length === 0) {
          // Seed padrão
          const padrao = [
            { nome: "<20", ativo: true },
            { nome: "20-50", ativo: true },
            { nome: "50+", ativo: true },
          ];
          base44.entities.opcoes_convidados.bulkCreate(padrao).then(() => {
            setOpcoes(padrao);
            setLoading(false);
          });
        } else {
          setOpcoes(data);
          setLoading(false);
        }
      });
    }
  }, []);

  const handleAdd = async () => {
    if (!novaOpcao) return;
    setSaving(true);

    try {
      const created = await base44.entities.opcoes_convidados.create({
        nome: novaOpcao,
        ativo: true,
      });
      setOpcoes([...opcoes, created]);
      setNovaOpcao("");
      setShowForm(false);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, ativo) => {
    try {
      await base44.entities.opcoes_convidados.update(id, { ativo: !ativo });
      setOpcoes((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ativo: !ativo } : o))
      );
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await base44.entities.opcoes_convidados.delete(deleteId);
      setOpcoes((prev) => prev.filter((o) => o.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
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
      <div className="flex-1">
        <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-heading font-bold text-lg">Opções Nº Convidados</h1>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{opcoes.length} opção(ões)</p>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="w-4 h-4" /> Nova Opção
            </Button>
          </div>

          {showForm && (
            <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-2">Nome da Opção</label>
                <Input
                  placeholder="Ex: <20, 20-50, 50+..."
                  value={novaOpcao}
                  onChange={(e) => setNovaOpcao(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={saving || !novaOpcao}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {saving ? "Adicionando..." : "Adicionar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setNovaOpcao("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold">Opção</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {opcoes.map((opcao) => (
                  <tr key={opcao.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3">{opcao.nome}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(opcao.id, opcao.ativo)}
                        className={`text-xs px-2 py-1 rounded-full transition-colors ${
                          opcao.ativo
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {opcao.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(opcao.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar Opção?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Deletar
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}