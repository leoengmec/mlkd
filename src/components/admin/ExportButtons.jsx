import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";

const CATEGORIAS = [
  "reserva_contato", "monitores", "garconetes", "supervisora", "recepcao",
  "buffet", "climatizacao", "limpeza", "alimentos", "brinquedos"
];

function toCSV(avaliacoes) {
  const headers = ["Nome", "Data Festa", "Tema", "NPS Geral", ...CATEGORIAS, "Indica", "Refaz", "Melhoria", "Enviado"];
  const rows = avaliacoes.map((a) => [
    a.nome || "",
    a.data_festa || "",
    a.tema || "",
    a.nps_geral ?? "",
    ...CATEGORIAS.map((k) => a.notas_json?.[k] ?? ""),
    a.indica ? "Sim" : "Não",
    a.refaz ? "Sim" : "Não",
    `"${(a.texto_melhorar || "").replace(/"/g, "'")}"`,
    a.data_envio ? new Date(a.data_envio).toLocaleDateString("pt-BR") : "",
  ]);
  return [headers, ...rows].map((r) => r.join(";")).join("\n");
}

export default function ExportButtons({ avaliacoes }) {
  const exportCSV = () => {
    const blob = new Blob(["\uFEFF" + toCSV(avaliacoes)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "avaliacoes_mulekada.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Mulekada Buffet - Relatório de Avaliações", 14, 20);
    doc.setFontSize(11);
    doc.text(`Total: ${avaliacoes.length} avaliações`, 14, 30);

    const npsMedia = avaliacoes.length > 0
      ? (avaliacoes.reduce((s, a) => s + (a.nps_geral || 0), 0) / avaliacoes.length).toFixed(1)
      : "—";
    doc.text(`NPS Médio: ${npsMedia}`, 14, 38);

    let y = 50;
    doc.setFontSize(10);
    doc.text("Nome", 14, y);
    doc.text("Data", 70, y);
    doc.text("Tema", 110, y);
    doc.text("NPS", 175, y);
    y += 4;
    doc.line(14, y, 196, y);
    y += 5;

    avaliacoes.slice(0, 50).forEach((a) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text((a.nome || "Anônimo").substring(0, 25), 14, y);
      doc.text(a.data_festa || "—", 70, y);
      doc.text((a.tema || "—").substring(0, 20), 110, y);
      doc.text(String(a.nps_geral ?? "—"), 175, y);
      y += 7;
    });

    doc.save("avaliacoes_mulekada.pdf");
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
        <Download className="w-4 h-4" /> CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportPDF} className="gap-2">
        <FileText className="w-4 h-4" /> PDF
      </Button>
    </div>
  );
}