import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCards from "../../components/admin/StatsCards";
import NpsBarChart from "../../components/admin/NpsBarChart";
import PromotersChart from "../../components/admin/PromotersChart";
import AvaliacoesTable from "../../components/admin/AvaliacoesTable";
import WordCloud from "../../components/admin/WordCloud";
import FiltersBar from "../../components/admin/FiltersBar";
import ExportButtons from "../../components/admin/ExportButtons";

export default function Dashboard() {
  const { user, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ dataInicio: "", dataFim: "", tema: "", mes: "" });

  useEffect(() => {
    if (!isLoadingAuth && user?.role !== "admin") {
      navigate("/");
    }
  }, [user, isLoadingAuth]);

  useEffect(() => {
    if (user?.role === "admin") {
      base44.entities.avaliacoes.list("-data_envio", 500).then((data) => {
        setAvaliacoes(data);
        setLoading(false);
      });
    }
  }, [user]);

  const filtered = avaliacoes.filter((a) => {
    if (filters.tema && !a.tema?.toLowerCase().includes(filters.tema.toLowerCase())) return false;
    if (filters.dataInicio && a.data_festa && a.data_festa < filters.dataInicio) return false;
    if (filters.dataFim && a.data_festa && a.data_festa > filters.dataFim) return false;
    if (filters.mes && a.data_festa && !a.data_festa.startsWith(filters.mes)) return false;
    return true;
  });

  if (isLoadingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
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
          <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={() => base44.auth.logout("/")}>
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
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
          </TabsList>

          <TabsContent value="quantitativo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NpsBarChart avaliacoes={filtered} />
              <PromotersChart avaliacoes={filtered} />
            </div>
            <AvaliacoesTable avaliacoes={filtered} />
          </TabsContent>

          <TabsContent value="qualitativo" className="space-y-6">
            <WordCloud avaliacoes={filtered} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}