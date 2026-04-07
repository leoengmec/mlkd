import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Trash2, Edit2, ArrowUp, ArrowDown, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ADMINS SECTION
export function AdminsSection() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: "", senha: "", nome: "" });
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    base44.entities.admins.list().then((data) => {
      setAdmins(data);
      setLoading(false);
    }).catch((e) => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!form.email || !form.nome || (!editingId && !form.senha)) {
      toast.error("Preencha todos os campos");
      return;
    }
    try {
      if (editingId) {
        await base44.entities.admins.update(editingId, { email: form.email, nome: form.nome });
        setAdmins(admins.map(a => a.id === editingId ? { ...a, ...form } : a));
      } else {
        const hash = await hashPassword(form.senha);
        const newAdmin = await base44.entities.admins.create({ email: form.email, nome: form.nome, senha_hash: hash });
        setAdmins([...admins, newAdmin]);
      }
      toast.success(editingId ? "Admin atualizado" : "Admin criado");
      setForm({ email: "", senha: "", nome: "" });
      setEditingId(null);
      setShowForm(false);
    } catch (e) {
      toast.error("Erro ao salvar");
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.admins.delete(deleteId);
      setAdmins(admins.filter(a => a.id !== deleteId));
      toast.success("Admin deletado");
      setDeleteId(null);
    } catch (e) {
      toast.error("Erro ao deletar");
    }
  };

  const handleEdit = (admin) => {
    setForm({ email: admin.email, nome: admin.nome, senha: "" });
    setEditingId(admin.id);
    setShowForm(true);
  };

  const handleDeactivate = async (id, ativo) => {
    try {
      await base44.entities.admins.update(id, { ativo: !ativo });
      setAdmins(admins.map(a => a.id === id ? { ...a, ativo: !ativo } : a));
      toast.success(!ativo ? "Admin ativado" : "Admin desativado");
    } catch (e) {
      toast.error("Erro");
    }
  };

  if (loading) return <Loader2 className="w-8 h-8 animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-heading font-bold text-xl">👥 Gerenciar Admins</h2>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({ email: "", senha: "", nome: "" }); }}>Novo Admin</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>{admin.email}</TableCell>
              <TableCell>{admin.nome}</TableCell>
              <TableCell>{admin.ativo ? <span className="text-green-600 text-sm">✓ Ativo</span> : <span className="text-red-600 text-sm">✗ Inativo</span>}</TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(admin)}><Edit2 className="w-3 h-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDeactivate(admin.id, admin.ativo)}>
                  {admin.ativo ? "Desativar" : "Ativar"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteId(admin.id)}><Trash2 className="w-3 h-3" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Admin" : "Novo Admin"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            {!editingId && <Input type="password" placeholder="Senha" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Admin?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação é irreversível.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive">Deletar</AlertDialogAction>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// PERGUNTAS SECTION (existing + enhanced with modal edit)
export function PerguntasSection() {
  const [perguntas, setPerguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ titulo: "", tipo: "slider", obrigatorio: false, ordem: 1 });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    base44.entities.perguntas.list("ordem").then((data) => {
      setPerguntas(data);
      setLoading(false);
    }).catch((e) => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      if (editingId) {
        await base44.entities.perguntas.update(editingId, form);
        setPerguntas(perguntas.map(p => p.id === editingId ? { ...p, ...form } : p));
        toast.success("Pergunta atualizada");
      } else {
        const newQ = await base44.entities.perguntas.create(form);
        setPerguntas([...perguntas, newQ]);
        toast.success("Pergunta criada");
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ titulo: "", tipo: "slider", obrigatorio: false, ordem: 1 });
    } catch (e) {
      toast.error("Erro ao salvar");
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.perguntas.delete(id);
      setPerguntas(perguntas.filter(p => p.id !== id));
      toast.success("Pergunta deletada");
    } catch (e) {
      toast.error("Erro");
    }
  };

  const moveQuestion = async (id, direction) => {
    const idx = perguntas.findIndex(p => p.id === id);
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === perguntas.length - 1)) return;
    
    const newPerguntas = [...perguntas];
    const temp = newPerguntas[idx];
    newPerguntas[idx] = newPerguntas[idx + direction];
    newPerguntas[idx + direction] = temp;
    
    await base44.entities.perguntas.update(newPerguntas[idx].id, { ordem: newPerguntas[idx].ordem });
    await base44.entities.perguntas.update(newPerguntas[idx + direction].id, { ordem: newPerguntas[idx + direction].ordem });
    setPerguntas(newPerguntas);
  };

  if (loading) return <Loader2 className="w-8 h-8 animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-heading font-bold text-xl">❓ Gerenciar Perguntas</h2>
        <Button onClick={() => { setShowModal(true); setEditingId(null); setForm({ titulo: "", tipo: "slider", obrigatorio: false, ordem: perguntas.length + 1 }); }}>Nova Pergunta</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ordem</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Obrigatório</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {perguntas.map((p, idx) => (
            <TableRow key={p.id}>
              <TableCell>{p.ordem}</TableCell>
              <TableCell>{p.titulo}</TableCell>
              <TableCell>{p.tipo}</TableCell>
              <TableCell>{p.obrigatorio ? "✓" : "✗"}</TableCell>
              <TableCell className="space-x-1 flex items-center">
                <Button size="sm" variant="outline" onClick={() => { setEditingId(p.id); setForm(p); setShowModal(true); }}><Edit2 className="w-3 h-3" /></Button>
                <Button size="sm" variant="outline" onClick={() => moveQuestion(p.id, -1)} disabled={idx === 0}><ArrowUp className="w-3 h-3" /></Button>
                <Button size="sm" variant="outline" onClick={() => moveQuestion(p.id, 1)} disabled={idx === perguntas.length - 1}><ArrowDown className="w-3 h-3" /></Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-3 h-3" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Pergunta" : "Nova Pergunta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="border rounded px-3 py-2 w-full">
              <option value="slider">Slider</option>
              <option value="texto">Texto</option>
              <option value="checkbox">Checkbox</option>
              <option value="dropdown">Dropdown</option>
              <option value="multipla">Múltipla Escolha</option>
            </select>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.obrigatorio} onChange={(e) => setForm({ ...form, obrigatorio: e.target.checked })} />
              <span>Obrigatório</span>
            </label>
            <Input type="number" placeholder="Ordem" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: parseInt(e.target.value) })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// GERAR AVALIACAO LINK
export function GerarAvaliacaoSection() {
  const baseUrl = window.location.origin;
  const link = `${baseUrl}/avaliacao`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
  const whatsappText = `Deixe sua avaliação da festa aqui: ${link}`;

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-xl">🔗 Gerar Link/QR Avaliação</h2>
      <div className="bg-card rounded-2xl p-6 border border-border space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Link de Avaliação</label>
          <div className="flex gap-2">
            <Input readOnly value={link} className="flex-1" />
            <Button onClick={() => { navigator.clipboard.writeText(link); toast.success("Copiado!"); }}><Copy className="w-4 h-4" /></Button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">QR Code</label>
          <img src={qrUrl} alt="QR" className="w-64 h-64 border rounded" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Compartilhar WhatsApp</label>
          <Button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`); }}>
            💬 Copiar para WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}