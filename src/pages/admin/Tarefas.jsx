import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Loader2, Plus, Trash2, Edit2, MessageSquare, ChevronDown, ChevronUp,
  CheckCircle2, Clock, PlayCircle, AlertTriangle, Sparkles, Zap
} from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Footer from "../../components/Footer";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pendente:     { label: "Pendente",     icon: Clock,         bg: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  em_andamento: { label: "Em Andamento", icon: PlayCircle,    bg: "bg-blue-100 text-blue-700 border-blue-200" },
  concluida:    { label: "Concluída",    icon: CheckCircle2,  bg: "bg-green-100 text-green-700 border-green-200" },
};

const PRIORIDADE_CONFIG = {
  baixa: { label: "Baixa",  bg: "bg-slate-100 text-slate-600" },
  media: { label: "Média",  bg: "bg-orange-100 text-orange-600" },
  alta:  { label: "Alta",   bg: "bg-red-100 text-red-600" },
};

const ORIGEM_CONFIG = {
  manual: { label: "Manual",  icon: Edit2 },
  ia:     { label: "IA",      icon: Sparkles },
  alerta: { label: "Alerta",  icon: AlertTriangle },
};

function logAudit(adminData, acao, recordId, detalhes) {
  base44.entities.auditoria.create({
    admin_id: adminData?.id || "admin",
    admin_email: adminData?.email || "",
    acao,
    tabela: "tarefas",
    record_id: recordId || "",
    detalhes: typeof detalhes === "object" ? JSON.stringify(detalhes) : detalhes,
    timestamp: new Date().toISOString(),
  }).catch(() => {});
}

const EMPTY_FORM = { titulo: "", descricao: "", status: "pendente", prioridade: "media", prazo: "", responsavel: "", origem: "manual", origem_detalhe: "" };

export default function Tarefas() {
  const navigate = useNavigate();
  const [tarefas, setTarefas] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

  // Modal criar/editar
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Expanded task (comments)
  const [expanded, setExpanded] = useState(null);
  const [novoComentario, setNovoComentario] = useState({});
  const [loadingComents, setLoadingComents] = useState({});

  // Delete
  const [deleteId, setDeleteId] = useState(null);

  // Filtro
  const [filtroStatus, setFiltroStatus] = useState("todos");

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) { navigate("/admin/login"); return; }
    const admin = JSON.parse(stored);
    setAdminData(admin);
    base44.entities.tarefas.list("-created_date", 200).then(data => {
      setTarefas(data);
      setLoading(false);
    });
  }, []);

  const loadComentarios = async (tarefaId) => {
    if (comentarios[tarefaId]) return;
    setLoadingComents(prev => ({ ...prev, [tarefaId]: true }));
    const data = await base44.entities.comentarios_tarefas.filter({ tarefa_id: tarefaId }, "created_date");
    setComentarios(prev => ({ ...prev, [tarefaId]: data }));
    setLoadingComents(prev => ({ ...prev, [tarefaId]: false }));
  };

  const toggleExpand = (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    loadComentarios(id);
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) { toast.error("Título obrigatório"); return; }
    try {
      if (editingId) {
        await base44.entities.tarefas.update(editingId, form);
        setTarefas(prev => prev.map(t => t.id === editingId ? { ...t, ...form } : t));
        logAudit(adminData, "update", editingId, { titulo: form.titulo, status: form.status });
        toast.success("Tarefa atualizada");
      } else {
        const nova = await base44.entities.tarefas.create(form);
        setTarefas(prev => [nova, ...prev]);
        logAudit(adminData, "create", nova.id, { titulo: form.titulo, origem: form.origem });
        toast.success("Tarefa criada");
      }
      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      toast.error("Erro ao salvar");
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.tarefas.delete(deleteId);
      setTarefas(prev => prev.filter(t => t.id !== deleteId));
      logAudit(adminData, "delete", deleteId, "Tarefa deletada");
      toast.success("Tarefa deletada");
      setDeleteId(null);
    } catch (e) {
      toast.error("Erro ao deletar");
    }
  };

  const handleStatusChange = async (id, novoStatus) => {
    await base44.entities.tarefas.update(id, { status: novoStatus });
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, status: novoStatus } : t));
    logAudit(adminData, "update", id, { status: novoStatus });
  };

  const handleAddComentario = async (tarefaId) => {
    const texto = novoComentario[tarefaId]?.trim();
    if (!texto) return;
    const c = await base44.entities.comentarios_tarefas.create({
      tarefa_id: tarefaId,
      texto,
      autor_email: adminData?.email || "",
    });
    setComentarios(prev => ({ ...prev, [tarefaId]: [...(prev[tarefaId] || []), c] }));
    setNovoComentario(prev => ({ ...prev, [tarefaId]: "" }));
    logAudit(adminData, "create", tarefaId, { comentario: texto });
  };

  const filtered = filtroStatus === "todos" ? tarefas : tarefas.filter(t => t.status === filtroStatus);

  const counts = tarefas.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

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
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Gerenciamento de Tarefas</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{tarefas.length} tarefas no total</p>
            </div>
            <Button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowModal(true); }} className="gap-2">
              <Plus className="w-4 h-4" /> Nova Tarefa
            </Button>
          </div>

          {/* Status summary */}
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  onClick={() => setFiltroStatus(filtroStatus === key ? "todos" : key)}
                  className={`rounded-2xl p-4 border text-left transition-all ${filtroStatus === key ? cfg.bg + " border-current shadow-sm" : "bg-card border-border hover:bg-muted/40"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-heading font-semibold">{cfg.label}</span>
                  </div>
                  <p className="text-2xl font-bold font-heading">{counts[key] || 0}</p>
                </button>
              );
            })}
          </div>

          {/* Lista */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="bg-card rounded-2xl p-10 border border-border text-center text-muted-foreground">
                Nenhuma tarefa encontrada
              </div>
            )}
            {filtered.map(tarefa => {
              const statusCfg = STATUS_CONFIG[tarefa.status] || STATUS_CONFIG.pendente;
              const prioCfg = PRIORIDADE_CONFIG[tarefa.prioridade] || PRIORIDADE_CONFIG.media;
              const origemCfg = ORIGEM_CONFIG[tarefa.origem] || ORIGEM_CONFIG.manual;
              const OrigemIcon = origemCfg.icon;
              const isExpanded = expanded === tarefa.id;
              const vencida = tarefa.prazo && tarefa.status !== "concluida" && new Date(tarefa.prazo) < new Date();

              return (
                <div key={tarefa.id} className={`bg-card rounded-2xl border shadow-sm transition-all ${vencida ? "border-red-300" : "border-border"}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${statusCfg.bg}`}>{statusCfg.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${prioCfg.bg}`}>{prioCfg.label}</span>
                          <span className="text-xs flex items-center gap-1 text-muted-foreground">
                            <OrigemIcon className="w-3 h-3" /> {origemCfg.label}
                          </span>
                          {vencida && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Vencida</span>}
                        </div>
                        <h3 className="font-heading font-bold text-foreground">{tarefa.titulo}</h3>
                        {tarefa.descricao && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{tarefa.descricao}</p>}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          {tarefa.prazo && <span>📅 {new Date(tarefa.prazo).toLocaleDateString("pt-BR")}</span>}
                          {tarefa.responsavel && <span>👤 {tarefa.responsavel}</span>}
                          {tarefa.origem_detalhe && <span className="italic">"{tarefa.origem_detalhe}"</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <select
                          value={tarefa.status}
                          onChange={e => handleStatusChange(tarefa.id, e.target.value)}
                          className="text-xs border border-input rounded-lg px-2 py-1 bg-background"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="em_andamento">Em Andamento</option>
                          <option value="concluida">Concluída</option>
                        </select>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingId(tarefa.id); setForm({ titulo: tarefa.titulo, descricao: tarefa.descricao || "", status: tarefa.status, prioridade: tarefa.prioridade || "media", prazo: tarefa.prazo || "", responsavel: tarefa.responsavel || "", origem: tarefa.origem || "manual", origem_detalhe: tarefa.origem_detalhe || "" }); setShowModal(true); }}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toggleExpand(tarefa.id)}>
                          <MessageSquare className="w-3.5 h-3.5" />
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(tarefa.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Comentários */}
                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                      <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide">Histórico de Comentários</p>
                      {loadingComents[tarefa.id] && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                      {(comentarios[tarefa.id] || []).length === 0 && !loadingComents[tarefa.id] && (
                        <p className="text-xs text-muted-foreground">Nenhum comentário ainda.</p>
                      )}
                      {(comentarios[tarefa.id] || []).map(c => (
                        <div key={c.id} className="bg-muted/40 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-foreground">{c.autor_email || "Admin"}</span>
                            <span className="text-xs text-muted-foreground">{new Date(c.created_date).toLocaleString("pt-BR")}</span>
                          </div>
                          <p className="text-sm text-foreground">{c.texto}</p>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Adicionar comentário..."
                          value={novoComentario[tarefa.id] || ""}
                          onChange={e => setNovoComentario(prev => ({ ...prev, [tarefa.id]: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && handleAddComentario(tarefa.id)}
                          className="text-sm"
                        />
                        <Button size="sm" onClick={() => handleAddComentario(tarefa.id)}>Enviar</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
        <Footer />
      </div>

      {/* Modal criar/editar */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Título *" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
            <Textarea placeholder="Descrição" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Prioridade</label>
                <select value={form.prioridade} onChange={e => setForm(f => ({ ...f, prioridade: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Prazo</label>
                <Input type="date" value={form.prazo} onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Responsável</label>
                <Input placeholder="email@exemplo.com" value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Origem</label>
              <select value={form.origem} onChange={e => setForm(f => ({ ...f, origem: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                <option value="manual">Manual</option>
                <option value="ia">Sugestão IA</option>
                <option value="alerta">Alerta</option>
              </select>
            </div>
            {form.origem !== "manual" && (
              <Input placeholder="Detalhe da origem (ex: categoria com baixa nota)" value={form.origem_detalhe} onChange={e => setForm(f => ({ ...f, origem_detalhe: e.target.value }))} />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Tarefa?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação é irreversível.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive">Deletar</AlertDialogAction>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}