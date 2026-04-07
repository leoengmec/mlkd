import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";

export default function AdminConfig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [configs, setConfigs] = useState({
    texto_confirmacao: "Obrigado! Sua avaliação foi registrada com sucesso.",
    alerta_email: "",
    alerta_nps_minimo: "7",
  });

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) navigate("/admin/login");
    else setAdminData(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (adminData) {
      base44.entities.configs.list().then((data) => {
        const conf = {};
        data.forEach((c) => {
          conf[c.chave] = c.valor;
        });
        setConfigs((prev) => ({ ...prev, ...conf }));
        setLoading(false);
      });
    }
  }, [adminData]);

  const handleSave = async (chave) => {
    const configs_list = await base44.entities.configs.filter({ chave });
    if (configs_list.length > 0) {
      await base44.entities.configs.update(configs_list[0].id, {
        valor: configs[chave],
      });
    } else {
      await base44.entities.configs.create({
        chave,
        valor: configs[chave],
        tipo: "texto",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex">
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
      <main className="flex-1 p-6 max-w-4xl">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
          Configurações Gerais
        </h1>

        <div className="space-y-6">
          {/* Texto confirmação */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h2 className="font-heading font-bold text-lg mb-4">
              Mensagem de Confirmação
            </h2>
            <Textarea
              value={configs.texto_confirmacao}
              onChange={(e) =>
                setConfigs({ ...configs, texto_confirmacao: e.target.value })
              }
              rows={3}
              className="rounded-xl mb-4"
              placeholder="Texto exibido após enviar avaliação"
            />
            <Button onClick={() => handleSave("texto_confirmacao")}>
              Salvar
            </Button>
          </div>

          {/* Email alertas */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h2 className="font-heading font-bold text-lg mb-4">
              Email para Alertas
            </h2>
            <input
              type="email"
              value={configs.alerta_email}
              onChange={(e) =>
                setConfigs({ ...configs, alerta_email: e.target.value })
              }
              placeholder="seu@email.com"
              className="w-full px-4 py-2 rounded-xl border border-input bg-background mb-4"
            />
            <p className="text-xs text-muted-foreground mb-4">
              Será usado para enviar alertas de feedback crítico
            </p>
            <Button onClick={() => handleSave("alerta_email")}>
              Salvar
            </Button>
          </div>

          {/* NPS mínimo alerta */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h2 className="font-heading font-bold text-lg mb-4">
              NPS Mínimo para Alerta
            </h2>
            <input
              type="number"
              value={configs.alerta_nps_minimo}
              onChange={(e) =>
                setConfigs({ ...configs, alerta_nps_minimo: e.target.value })
              }
              min="0"
              max="10"
              className="w-full px-4 py-2 rounded-xl border border-input bg-background mb-4"
            />
            <p className="text-xs text-muted-foreground mb-4">
              Enviar alerta quando NPS for menor que este valor
            </p>
            <Button onClick={() => handleSave("alerta_nps_minimo")}>
              Salvar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}