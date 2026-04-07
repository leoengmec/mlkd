import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";

export default function ConfigsGerais() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [configs, setConfigs] = useState({
    texto_confirmacao: "",
    email_alertas: "",
    smtp_host: "",
    smtp_port: "587",
    smtp_user: "",
    smtp_pass: "",
    nps_alerta_threshold: "5",
  });

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) {
      navigate("/admin/login");
    } else {
      setAdminData(JSON.parse(stored));
      base44.asServiceRole.entities.configs
        .list()
        .then((data) => {
          const configMap = {};
          data.forEach((c) => {
            configMap[c.chave] = c.valor;
          });
          setConfigs((prev) => ({ ...prev, ...configMap }));
          setLoading(false);
        });
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(configs)) {
        const existing = await base44.asServiceRole.entities.configs.filter(
          { chave: key },
          "",
          1
        );

        if (existing.length > 0) {
          await base44.asServiceRole.entities.configs.update(existing[0].id, { valor: String(value) });
        } else {
          await base44.asServiceRole.entities.configs.create({
            chave: key,
            valor: String(value),
            tipo: ["smtp_port", "nps_alerta_threshold"].includes(key) ? "numero" : "texto",
          });
        }
      }
      alert("Configurações salvas!");
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar");
    } finally {
      setSaving(false);
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
          <h1 className="font-heading font-bold text-lg">Configs Gerais</h1>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-6">
            <div>
              <label className="text-sm font-semibold block mb-2">Texto de Confirmação</label>
              <Textarea
                placeholder="Mensagem exibida após envio..."
                value={configs.texto_confirmacao}
                onChange={(e) => setConfigs({ ...configs, texto_confirmacao: e.target.value })}
                rows={3}
                className="rounded-lg"
              />
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-heading font-bold mb-4">Alertas por Email</h3>

              <div>
                <label className="text-sm font-semibold block mb-2">Email para Alertas</label>
                <Input
                  type="email"
                  placeholder="admin@mulekada.com"
                  value={configs.email_alertas}
                  onChange={(e) => setConfigs({ ...configs, email_alertas: e.target.value })}
                  className="rounded-lg mb-4"
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">Threshold NPS para Alerta</label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={configs.nps_alerta_threshold}
                  onChange={(e) => setConfigs({ ...configs, nps_alerta_threshold: e.target.value })}
                  className="rounded-lg mb-4"
                />
                <p className="text-xs text-muted-foreground">Alerta quando NPS for menor que este valor</p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-heading font-bold mb-4">SMTP (Opcional)</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">Host</label>
                  <Input
                    placeholder="smtp.gmail.com"
                    value={configs.smtp_host}
                    onChange={(e) => setConfigs({ ...configs, smtp_host: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Port</label>
                  <Input
                    type="number"
                    placeholder="587"
                    value={configs.smtp_port}
                    onChange={(e) => setConfigs({ ...configs, smtp_port: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Usuário</label>
                  <Input
                    placeholder="seu@email.com"
                    value={configs.smtp_user}
                    onChange={(e) => setConfigs({ ...configs, smtp_user: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Senha</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={configs.smtp_pass}
                    onChange={(e) => setConfigs({ ...configs, smtp_pass: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}