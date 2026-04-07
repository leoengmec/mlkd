import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";

export default function AdminEscala() {
  const navigate = useNavigate();
  const [perguntas, setPerguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [escalas, setEscalas] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) navigate("/admin/login");
    else setAdminData(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (adminData) {
      base44.entities.perguntas.list("ordem", 100).then((data) => {
        const sliders = data.filter((p) => p.tipo === "slider");
        setPerguntas(sliders);
        const initEscalas = {};
        sliders.forEach((p) => {
          initEscalas[p.id] = {
            min: p.escala_min ?? 0,
            max: p.escala_max ?? 10,
          };
        });
        setEscalas(initEscalas);
        setLoading(false);
      });
    }
  }, [adminData]);

  const handleSave = async (id) => {
    const escala = escalas[id];
    await base44.entities.perguntas.update(id, {
      escala_min: escala.min,
      escala_max: escala.max,
    });
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
          Configurar Escala de Sliders
        </h1>

        <div className="space-y-4">
          {perguntas.map((p) => (
            <div key={p.id} className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
              <h2 className="font-heading font-bold text-lg mb-4">{p.titulo}</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-heading font-semibold">Mínimo</label>
                  <input
                    type="number"
                    value={escalas[p.id]?.min ?? 0}
                    onChange={(e) =>
                      setEscalas({
                        ...escalas,
                        [p.id]: { ...escalas[p.id], min: parseInt(e.target.value) },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-heading font-semibold">Máximo</label>
                  <input
                    type="number"
                    value={escalas[p.id]?.max ?? 10}
                    onChange={(e) =>
                      setEscalas({
                        ...escalas,
                        [p.id]: { ...escalas[p.id], max: parseInt(e.target.value) },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-input bg-background"
                  />
                </div>
              </div>
              <Button onClick={() => handleSave(p.id)} className="w-full md:w-auto">
                Salvar Escala
              </Button>
            </div>
          ))}
        </div>

        {perguntas.length === 0 && (
          <div className="bg-card rounded-2xl p-8 border border-border/50 text-center text-muted-foreground">
            Nenhuma pergunta do tipo slider cadastrada
          </div>
        )}
      </main>
    </div>
  );
}