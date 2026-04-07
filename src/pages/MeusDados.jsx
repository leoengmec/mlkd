import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Download, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

export default function MeusDados() {
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = localStorage.getItem("clientEmail");
        if (!stored) {
          setLoading(false);
          return;
        }
        setEmail(stored);
        const data = await base44.entities.avaliacoes.filter({ created_by: stored }, "-created_date", 100);
        setAvaliacoes(data || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja deletar? Esta ação não pode ser desfeita.")) return;
    setDeleting(id);
    try {
      await base44.functions.invoke('deleteAvaliacao', { id });
      setAvaliacoes(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      alert("Erro ao deletar: " + error.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = () => {
    const csv = "DATA,TEMA,NPS,MELHORAR\n" +
      avaliacoes.map(a => 
        `"${a.created_date}","${a.tema}","${a.nps_geral}","${(a.texto_melhorar || "").replace(/"/g, '""')}"`
      ).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meus-dados.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-foreground">Meus Dados</h1>
        </div>

        {/* Info */}
        <div className="bg-card rounded-xl p-4 border border-border mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-foreground mb-1">Seus Direitos LGPD</p>
            <p className="text-muted-foreground">
              Você pode visualizar, exportar ou deletar suas avaliações. 
              Os dados são retidos por 2 anos e então automaticamente deletados.
            </p>
          </div>
        </div>

        {!email ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhum dado registrado. Você ainda não enviou uma avaliação.
            </p>
            <Link to="/formulario">
              <Button>Ir para Formulário</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Export */}
            {avaliacoes.length > 0 && (
              <div className="mb-6 flex gap-2">
                <Button onClick={handleExport} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
              </div>
            )}

            {/* Lista */}
            {avaliacoes.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Nenhuma avaliação registrada com este email.
              </p>
            ) : (
              <div className="space-y-3">
                {avaliacoes.map((a) => (
                  <div key={a.id} className="bg-card rounded-lg p-4 border border-border flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {a.tema || "Sem tema"} • NPS {a.nps_geral}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.created_date).toLocaleDateString("pt-BR")}
                      </p>
                      {a.texto_melhorar && (
                        <p className="text-sm text-foreground mt-2 italic">
                          "{a.texto_melhorar.substring(0, 100)}..."
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting === a.id}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      {deleting === a.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}