import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";

export default function AdminMaxChars() {
  const navigate = useNavigate();
  const [perguntas, setPerguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [maxChars, setMaxChars] = useState({});
  const [globalMax, setGlobalMax] = useState(500);

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) navigate("/admin/login");
    else setAdminData(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (adminData) {
      base44.entities.perguntas.list("ordem", 100).then((data) => {
        const textos = data.filter((p) => p.tipo === "texto");
        setPerguntas(textos);
        const initMax = {};
        textos.forEach((p) => {
          initMax[p.id] = p.max_chars ?? 500;
        });
        setMaxChars(initMax);
        setLoading(false);
      });

      base44.entities.configs.filter({ chave: "max_chars_default" }).then((data) => {
        if (data.length > 0) {
          setGlobalMax(parseInt(data[0].valor));
        }
      });
    }
  }, [adminData]);

  const handleSaveGlobal = async () => {
    const configs = await base44.entities.configs.filter({ chave: "max_chars_default" });
    if (configs.length > 0) {
      await base44.entities.configs.update(configs[0].id, {
        valor: globalMax.toString(),
      });
    } else {
      await base44.entities.configs.create({
        chave: "max_chars_default",
        valor: globalMax.toString(),
        tipo: "numero",
        descricao: "Limite padrão de caracteres para campos de texto",
      });
    }
  };

  const handleSavePerguntas = async () => {
    for (const [id, valor] of Object.entries(maxChars)) {
      await base44.entities.perguntas.update(id, { max_chars: valor });
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
          Tamanho Máximo de Textos
        </h1>

        {/* Global */}
        <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm mb-6">
          <h2 className="font-heading font-bold text-lg mb-4">Padrão Global</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-heading font-semibold">
                Máximo de caracteres (padrão)
              </label>
              <input
                type="number"
                value={globalMax}
                onChange={(e) => setGlobalMax(parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-xl border border-input bg-background"
              />
            </div>
            <Button onClick={handleSaveGlobal}>Salvar</Button>
          </div>
        </div>

        {/* Por pergunta */}
        {perguntas.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-lg">Por Pergunta</h2>
            {perguntas.map((p) => (
              <div key={p.id} className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
                <label className="text-sm font-heading font-semibold block mb-2">
                  {p.titulo}
                </label>
                <input
                  type="number"
                  value={maxChars[p.id] ?? 500}
                  onChange={(e) =>
                    setMaxChars({
                      ...maxChars,
                      [p.id]: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-input bg-background"
                />
              </div>
            ))}
            <Button onClick={handleSavePerguntas} className="w-full">
              Salvar Todas
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}