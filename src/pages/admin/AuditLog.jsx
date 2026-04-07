import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";

export default function AuditLog() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) {
      navigate("/admin/login");
    } else {
      setAdminData(JSON.parse(stored));
      base44.asServiceRole.entities.auditoria
        .list("-timestamp", 500)
        .then((data) => {
          setLogs(data);
          setLoading(false);
        });
    }
  }, []);

  const filtered = logs.filter(
    (log) =>
      log.admin_email?.toLowerCase().includes(search.toLowerCase()) ||
      log.acao?.toLowerCase().includes(search.toLowerCase()) ||
      log.tabela?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="font-heading font-bold text-lg">Audit Log</h1>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por admin, ação, tabela..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{filtered.length} registros</p>

          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-left font-semibold">Data/Hora</th>
                    <th className="px-4 py-3 text-left font-semibold">Admin</th>
                    <th className="px-4 py-3 text-left font-semibold">Ação</th>
                    <th className="px-4 py-3 text-left font-semibold">Tabela</th>
                    <th className="px-4 py-3 text-left font-semibold">Registro</th>
                    <th className="px-4 py-3 text-left font-semibold">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-sm">{log.admin_email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.acao === "delete" ? "bg-red-100 text-red-700" :
                          log.acao === "create" ? "bg-green-100 text-green-700" :
                          log.acao === "update" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {log.acao?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{log.tabela}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{log.record_id}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                        {log.detalhes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}