import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "../../components/admin/Sidebar";
import StatsCards from "../../components/admin/StatsCards";
import NpsBarChart from "../../components/admin/NpsBarChart";
import PromotersChart from "../../components/admin/PromotersChart";
import AvaliacoesTimelineChart from "../../components/admin/AvaliacoesTimelineChart";
import ConvidadosDistributionChart from "../../components/admin/ConvidadosDistributionChart";
import AvaliacoesTable from "../../components/admin/AvaliacoesTable";
import WordCloud from "../../components/admin/WordCloud";
import FiltersBar from "../../components/admin/FiltersBar";
import ExportButtons from "../../components/admin/ExportButtons";
import IaAnalysis from "../../components/admin/IaAnalysis";
import CorrelationsTable from "../../components/admin/CorrelationsTable";
import { AdminsSection, PerguntasSection, GerarAvaliacaoSection } from "../../components/admin/AdminDashboardSections";
import Footer from "../../components/Footer";
import NotificationCenter from "../../components/admin/NotificationCenter";
import { useNotifications } from "../../hooks/useNotifications";
import { useAvaliacaoListener } from "../../hooks/useAvaliacaoListener";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section");

  useEffect(() => {
    const pathname = location.pathname;
    const sectionParam = searchParams.get("section");
    console.log("📊 [DASHBOARD] Route Updated:", { pathname, section: sectionParam });
  }, [location.pathname, location.search, searchParams]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ dataInicio: "", dataFim: "", tema: "", mes: "" });
  const [adminData, setAdminData] = useState(null);
  const { notifications, addNotification, removeNotification } = useNotifications();

  const handleNewAvaliacao = (data) => {
    setAvaliacoes((prev) => [data, ...prev]);
    addNotification(
      `✨ Nova avaliação de ${data.nome} - NPS: ${data.nps || 'N/A'}`,
      'success'
    );
  };

  const handleMetaReached = (data) => {
    addNotification(
      `🎯 Meta atingida! ${data.count} avaliações recebidas!`,
      'success',
      7000
    );
  };

  useAvaliacaoListener(handleNewAvaliacao, handleMetaReached, 10);

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) {
      navigate("/admin/login");
    } else {
      setAdminData(JSON.parse(stored));
      base44.entities.avaliacoes.list("-data_envio", 500).then((data) => {
        setAvaliacoes(data);
        setLoading(false);
      });
    }
  }, []);

  const filtered = avaliacoes.filter((a) => {
    if (filters.tema && !a.tema?.toLowerCase().includes(filters.tema.toLowerCase())) return false;
    if (filters.dataInicio && a.data_festa && a.data_festa < filters.dataInicio) return false;
    if (filters.dataFim && a.data_festa && a.data_festa > filters.dataFim) return false;
    if (filters.mes && a.data_festa && !a.data_festa.startsWith(filters.mes)) return false;
    if (filters.convidados && a.numero_convidados !== filters.convidados) return false;
    if (filters.proxima && a.proxima_festa !== filters.proxima) return false;
    return true;
  });

  const handleDeleteAvaliacao = (id) => {
    setAvaliacoes((prev) => prev.filter((a) => a.id !== id));
    addNotification('Avaliação deletada com sucesso', 'info');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminData) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <NotificationCenter notifications={notifications} onRemove={removeNotification} />
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/69d5512a4585ccb7cb7b0fd6/8ae34c042_mlkd.jpg"
            alt="Mulekada"
            className="w-10 h-10 rounded-full object-contain"
          />
          <div>
            <h1 className="font-heading font-bold text-foreground text-lg flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              Dashboard Admin
            </h1>
            <p className="text-xs text-muted-foreground">Mulekada Buffet</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">{adminData?.email}</span>
          <Button variant="ghost" size="sm" onClick={() => {
          localStorage.removeItem("adminData");
          navigate("/admin/login");
        }}>
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>
      </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6 animate-fade-in">
          {section === "admins" && <AdminsSection />}
          {section === "perguntas" && <PerguntasSection />}
          {section === "gerar-link" && <GerarAvaliacaoSection />}
          {!section && (
            <>
              {/* Filters */}
              <FiltersBar filters={filters} onChange={setFilters} avaliacoes={avaliacoes} />

            {/* KPI Cards */}
            <StatsCards avaliacoes={filtered} />

            {/* Export */}
            <div className="flex justify-end">
              <ExportButtons avaliacoes={filtered} />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="quantitativo">
              <TabsList className="mb-4">
                <TabsTrigger value="quantitativo">📊 Quantitativo</TabsTrigger>
                <TabsTrigger value="qualitativo">💬 Qualitativo</TabsTrigger>
                <TabsTrigger value="ia"><span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> IA & Ações</span></TabsTrigger>
              </TabsList>

              <TabsContent value="quantitativo" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <NpsBarChart avaliacoes={filtered} />
                  <PromotersChart avaliacoes={filtered} />
                </div>
                <AvaliacoesTimelineChart avaliacoes={filtered} />
                <ConvidadosDistributionChart avaliacoes={filtered} />
                <CorrelationsTable avaliacoes={filtered} />
                <AvaliacoesTable avaliacoes={filtered} onDelete={handleDeleteAvaliacao} />
              </TabsContent>

              <TabsContent value="qualitativo" className="space-y-6">
                <WordCloud avaliacoes={filtered} />
              </TabsContent>

              <TabsContent value="ia" className="space-y-6">
                <IaAnalysis avaliacoes={filtered} userEmail={adminData?.email} />
              </TabsContent>
            </Tabs>
          </>
        )}
        </main>
        <Footer />
      </div>
    </div>
  );
}