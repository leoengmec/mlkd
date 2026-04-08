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
  CheckCircle2, Clock, PlayCircle, AlertTriangle, Sparkles, Filter, X
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Sidebar from "../../components/admin/Sidebar";
import Footer from "../../components/Footer";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pendente:     { label: "Pendente",     icon: Clock,         col: "bg-yellow-50 border-yellow-200", header: "bg-yellow-100 text-yellow-800" },
  em_andamento: { label: "Em Andamento", icon: PlayCircle,    col: "bg-blue-50 border-blue-200",     header: "bg-blue-100 text-blue-800" },
  concluida:    { label: "Concluída",    icon: CheckCircle2,  col: "bg-green-50 border-green-200",   header: "bg-green-100 text-green-800" },
};

const PRIORIDADE_CONFIG = {
  baixa: { label: "Baixa",  bg: "bg-slate-100 text-slate-600",    dot: "bg-slate-400" },
  media: { label: "Média",  bg: "bg-orange-100 text-orange-600",  dot: "bg-orange-400" },
  alta:  { label: "Alta",   bg: "bg-red-100 text-red-600",        dot: "bg-red-500" },
};

const ORIGEM_CONFIG = {
  manual: { label: "Manual",      icon: Edit2 },
  ia:     { label: "IA",          icon: Sparkles },
  alerta: { label: "Alerta",      icon: AlertTriangle },
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

const EMPTY_FORM = {
  titulo: "", descricao: "", status: "pendente", prioridade: "media",
  prazo: "", nome_responsavel: "", responsavel: "", origem: "manual", origem_detalhe: ""
};

function TarefaCard({ tarefa, index, onEdit, onDelete, onToggleExpand, expanded, comentarios, loadingComents, novoComentario, setNovoComentario, onAddComentario }) {
  const prioCfg = PRIORIDADE_CONFIG[tarefa.prioridade] || PRIORIDADE_CONFIG.media;
  const origemCfg = ORIGEM_CONFIG[tarefa.origem] || ORIGEM_CONFIG.manual;
  const OrigemIcon = origemCfg.icon;
  const vencida = tarefa.prazo && tarefa.status !== "concluida" && new Date(tarefa.prazo) < new Date();
  const isExpanded = expanded === tarefa.id;

  return (
    <Draggable draggableId={tarefa.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-xl border shadow-sm mb-2 transition-all select-none ${snapshot.isDragging ? "shadow-lg rotate-1 opacity-90" : ""} ${vencida ? "border-red-300" : "border-border"}`}
        >
          <div className="p-3">
            {/* Prioridade dot + badges */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className={`w-2 h-2 rounded-full ${prioCfg.dot}`} />
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${prioCfg.bg}`}>{prioCfg.label}</span>
              <span className="text-xs flex items-center gap-0.5 text-muted-foreground">
                <OrigemIcon className="w-3 h-3" /> {origemCfg.label}
              </span>
              {vencida && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Vencida</span>}
            </div>

            <h3 className="font-heading font-bold text-sm text-foreground leading-tight mb-1">{tarefa.titulo}</h3>
            {tarefa.descricao && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{tarefa.descricao}</p>}

            {/* Meta info */}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
              {tarefa.prazo && <span>📅 {new Date(tarefa.prazo + "T12:00:00").toLocaleDateString("pt-BR")}</span>}
              {tarefa.nome_responsavel && <span>👤 {tarefa.nome_responsavel}</span>}
              {tarefa.responsavel && <span>✉️ {tarefa.responsavel}</span>}
            </div>

            {/* Datas automáticas */}
            <div className="text-xs text-muted-foreground/70 flex gap-3 border-t border-border pt-2 mt-1">
              <span>Criado: {new Date(tarefa.created_date).toLocaleDateString("pt-BR")}</span>
              {tarefa.updated_date && tarefa.updated_date !== tarefa.created_date && (
                <span>Atualizado: {new Date(tarefa.updated_date).toLocaleDateString("pt-BR")}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1 mt-2">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onToggleExpand(tarefa.id)}>
                <MessageSquare className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onEdit(tarefa)}>
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => onDelete(tarefa.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Comentários */}
          {isExpanded && (
            <div className="border-t border-border px-3 pb-3 pt-2 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Comentários</p>
              {loadingComents[tarefa.id] && <Loader2 className="w-3 h-3 animate-spin" />}
              {(comentarios[tarefa.id] || []).length === 0 && !loadingComents[tarefa.id] && (
                <p className="text-xs text-muted-foreground">Nenhum comentário ainda.</p>
              )}
              {(comentarios[tarefa.id] || []).map(c => (
                <div key={c.id} className="bg-muted/40 rounded px-2 py-1.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-semibold">{c.autor_email || "Admin"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(c.created_date).toLocaleString("pt-BR")}</span>
                  </div>
                  <p className="text-xs">{c.texto}</p>
                </div>
              ))}
              <div className="flex gap-1.5 mt-1">
                <Input
                  placeholder="Comentário..."
                  value={novoComentario[tarefa.id] || ""}
                  onChange={e => setNovoComentario(prev => ({ ...prev, [tarefa.id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && onAddComentario(tarefa.id)}
                  className="text-xs h-7"
                />
                <Button size="sm" className="h-7 text-xs" onClick={() => onAddComentario(tarefa.id)}>OK</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default function Tarefas() {
  const navigate = useNavigate();
  const [tarefas, setTarefas] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [expanded, setExpanded] = useState(null);
  const [novoComentario, setNovoComentario] = useState({});
  const [loadingComents, setLoadingComents] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  // Filtros
  const [filtroResponsavel, setFiltroResponsavel] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");

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
    if (editingId) {
      const updated = await base44.entities.tarefas.update(editingId, form);
      setTarefas(prev => prev.map(t => t.id === editingId ? { ...t, ...form, updated_date: new Date().toISOString() } : t));
      logAudit(adminData, "update", editingId, { titulo: form.titulo, status: form.status });
      toast.success("Tarefa atualizada");
    } else {
      const nova = await base44.entities.tarefas.create(form);
      setTarefas(prev => [nova, ...prev]);
      logAudit(adminData, "create", nova.id, { titulo: form.titulo });
      toast.success("Tarefa criada");
    }
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = async () => {
    await base44.entities.tarefas.delete(deleteId);
    setTarefas(prev => prev.filter(t => t.id !== deleteId));
    logAudit(adminData, "delete", deleteId, "Tarefa deletada");
    toast.success("Tarefa deletada");
    setDeleteId(null);
  };

  const handleEdit = (tarefa) => {
    setEditingId(tarefa.id);
    setForm({
      titulo: tarefa.titulo, descricao: tarefa.descricao || "",
      status: tarefa.status, prioridade: tarefa.prioridade || "media",
      prazo: tarefa.prazo || "", nome_responsavel: tarefa.nome_responsavel || "",
      responsavel: tarefa.responsavel || "",
      origem: tarefa.origem || "manual", origem_detalhe: tarefa.origem_detalhe || ""
    });
    setShowModal(true);
  };

  const handleAddComentario = async (tarefaId) => {
    const texto = novoComentario[tarefaId]?.trim();
    if (!texto) return;
    const c = await base44.entities.comentarios_tarefas.create({
      tarefa_id: tarefaId, texto, autor_email: adminData?.email || "",
    });
    setComentarios(prev => ({ ...prev, [tarefaId]: [...(prev[tarefaId] || []), c] }));
    setNovoComentario(prev => ({ ...prev, [tarefaId]: "" }));
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const novoStatus = destination.droppableId;
    await base44.entities.tarefas.update(draggableId, { status: novoStatus });
    setTarefas(prev => prev.map(t =>
      t.id === draggableId ? { ...t, status: novoStatus, updated_date: new Date().toISOString() } : t
    ));
    logAudit(adminData, "update", draggableId, { status: novoStatus, via: "kanban_drag" });
    toast.success(`Tarefa movida para "${STATUS_CONFIG[novoStatus]?.label}"`);
  };

  // Responsáveis únicos
  const responsaveis = [...new Set(tarefas.map(t => t.responsavel).filter(Boolean))];

  // Filtro aplicado
  const filtered = tarefas.filter(t => {
    if (filtroResponsavel && t.responsavel !== filtroResponsavel) return false;
    if (filtroPrioridade && t.prioridade !== filtroPrioridade) return false;
    return true;
  });

  const counts = tarefas.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
  const hasFilters = filtroResponsavel || filtroPrioridade;

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
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-6 space-y-5 overflow-auto">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Kanban de Tarefas</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{tarefas.length} tarefas · arraste para mover entre colunas</p>
            </div>
            <Button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowModal(true); }} className="gap-2">
              <Plus className="w-4 h-4" /> Nova Tarefa
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filtroResponsavel}
              onChange={e => setFiltroResponsavel(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm bg-background"
            >
              <option value="">Todos responsáveis</option>
              {responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={filtroPrioridade}
              onChange={e => setFiltroPrioridade(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm bg-background"
            >
              <option value="">Todas prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={() => { setFiltroResponsavel(""); setFiltroPrioridade(""); }}>
                <X className="w-3 h-3" /> Limpar filtros
              </Button>
            )}
            <span className="text-xs text-muted-foreground ml-auto">{filtered.length} de {tarefas.length} tarefas</span>
          </div>

          {/* Kanban Board */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                const Icon = cfg.icon;
                const columnTasks = filtered.filter(t => t.status === status);
                return (
                  <div key={status} className={`rounded-2xl border-2 ${cfg.col} flex flex-col min-h-[400px]`}>
                    {/* Column header */}
                    <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${cfg.header}`}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-heading font-bold text-sm">{cfg.label}</span>
                      </div>
                      <span className="text-xs font-bold bg-white/60 px-2 py-0.5 rounded-full">{counts[status] || 0}</span>
                    </div>

                    {/* Droppable area */}
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 transition-colors rounded-b-2xl ${snapshot.isDraggingOver ? "bg-white/60" : ""}`}
                        >
                          {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                            <p className="text-xs text-center text-muted-foreground mt-6 opacity-60">Nenhuma tarefa</p>
                          )}
                          {columnTasks.map((tarefa, index) => (
                            <TarefaCard
                              key={tarefa.id}
                              tarefa={tarefa}
                              index={index}
                              onEdit={handleEdit}
                              onDelete={setDeleteId}
                              onToggleExpand={toggleExpand}
                              expanded={expanded}
                              comentarios={comentarios}
                              loadingComents={loadingComents}
                              novoComentario={novoComentario}
                              setNovoComentario={setNovoComentario}
                              onAddComentario={handleAddComentario}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
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
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nome do Responsável</label>
                <Input placeholder="Ex: João Silva" value={form.nome_responsavel} onChange={e => setForm(f => ({ ...f, nome_responsavel: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email do Responsável</label>
                <Input placeholder="email@exemplo.com" value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Prazo</label>
                <Input type="date" value={form.prazo} onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))} />
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
              <Input placeholder="Detalhe da origem" value={form.origem_detalhe} onChange={e => setForm(f => ({ ...f, origem_detalhe: e.target.value }))} />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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