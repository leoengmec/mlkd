import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExportButtons({ avaliacoes }) {
  const exportCSV = () => {
    const headers = ["Nome", "Telefone", "Data", "Tema", "NPS", "Indica", "Refaz", "Próxima"];
    const rows = avaliacoes.map((a) => [
      a.nome,
      a.telefone || "",
      a.data_festa ? new Date(a.data_festa).toLocaleDateString("pt-BR") : "",
      a.tema || "",
      a.nps_geral,
      a.indica ? "Sim" : "Não",
      a.refaz ? "Sim" : "Não",
      a.proxima_festa || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `avaliacoes_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const exportPDF = () => {
    alert("Export PDF em desenvolvimento");
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportCSV}
        className="gap-2"
      >
        <Download className="w-4 h-4" /> CSV ({avaliacoes.length})
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportPDF}
        className="gap-2"
      >
        <FileText className="w-4 h-4" /> PDF
      </Button>
    </div>
  );
}