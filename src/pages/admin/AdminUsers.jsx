import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";
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

export default function AdminUsers() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ email: "", senha: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) {
      navigate("/admin/login");
    } else {
      setAdminData(JSON.parse(stored));
      base44.asServiceRole.entities.admins.list().then((data) => {
        setAdmins(data);
        setLoading(false);
      });
    }
  }, []);

  const handleSave = async () => {
    if (!formData.email) return;
    setSaving(true);

    try {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(formData.senha));
      const senhaHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (editingId) {
        await base44.asServiceRole.entities.admins.update(editingId, {
          email: formData.email,
          senha_hash: senhaHash,
        });
      } else {
        await base44.asServiceRole.entities.admins.create({
          email: formData.email,
          senha_hash: senhaHash,
          nome: formData.email.split("@")[0],
          ativo: true,
        });
      }

      const updated = await base44.asServiceRole.entities.admins.list();
      setAdmins(updated);
      setShowForm(false);
      setEditingId(null);
      setFormData({ email: "", senha: "" });
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await base44.asServiceRole.entities.admins.delete(deleteId);
      setAdmins((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Erro ao deletar:", error);
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
          <h1 className="font-heading font-bold text-lg">Gerenciar Admins</h1>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{admins.length} admin(s)</p>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="w-4 h-4" /> Novo Admin
            </Button>
          </div>

          {showForm && (
            <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
              <h3 className="font-heading font-bold">{editingId ? "Editar Admin" : "Novo Admin"}</h3>
              <div>
                <label className="text-sm font-semibold block mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="admin@mulekada.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">Senha</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving || !formData.email || !formData.senha}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ email: "", senha: "" });
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
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Cadastro</th>
                  <th className="px-4 py-3 text-left font-semibold">Último Acesso</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3">{admin.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(admin.created_date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {admin.ultimo_acesso ? new Date(admin.ultimo_acesso).toLocaleString("pt-BR") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${admin.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {admin.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center flex gap-2 justify-center">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingId(admin.id);
                        setFormData({ email: admin.email, senha: "" });
                        setShowForm(true);
                      }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(admin.id)}
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
            <AlertDialogTitle>Deletar Admin?</AlertDialogTitle>
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