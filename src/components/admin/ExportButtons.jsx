import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { jsPDF } from "jspdf";

export default function ExportButtons({ avaliacoes }) {
  const [generatingPDF, setGeneratingPDF] = useState(false);

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

  const exportPDF = async () => {
    setGeneratingPDF(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const margin = 15;
      let y = 20;

      // Cabeçalho
      doc.setFillColor(108, 40, 160);
      doc.rect(0, 0, pageW, 32, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório Mulekada Buffet", margin, 14);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")} | Total: ${avaliacoes.length} avaliações`, margin, 22);
      doc.text("Desenvolvido por Leonardo Alves | Mulekada 2026", margin, 28);
      y = 42;

      // Stats resumo
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Estatísticas Gerais", margin, y); y += 7;

      const total = avaliacoes.length;
      const avgNps = total ? (avaliacoes.reduce((s,a) => s+(a.nps_geral||0), 0) / total).toFixed(2) : "N/A";
      const promoters = avaliacoes.filter(a => a.nps_geral >= 9).length;
      const detractors = avaliacoes.filter(a => a.nps_geral <= 6).length;
      const npsScore = total ? Math.round(((promoters - detractors) / total) * 100) : 0;
      const indica = avaliacoes.filter(a => a.indica).length;

      const stats = [
        ["Total Avaliações", total, "NPS Médio", avgNps],
        ["Promotores (9-10)", promoters, "Detratores (0-6)", detractors],
        ["Score NPS", `${npsScore}`, "Indicariam", `${indica} (${total ? Math.round(indica/total*100) : 0}%)`],
      ];

      doc.setFontSize(9);
      stats.forEach(row => {
        doc.setFont("helvetica", "bold"); doc.text(`${row[0]}:`, margin, y);
        doc.setFont("helvetica", "normal"); doc.text(`${row[1]}`, margin + 45, y);
        doc.setFont("helvetica", "bold"); doc.text(`${row[2]}:`, margin + 75, y);
        doc.setFont("helvetica", "normal"); doc.text(`${row[3]}`, margin + 120, y);
        y += 6;
      });
      y += 5;

      // Médias por categoria
      doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text("Médias por Categoria", margin, y); y += 7;

      const cats = { reserva_contato:"Reserva/Contato", monitores:"Monitores", garconetes:"Garçonetes", supervisora:"Supervisora", recepcao:"Recepção", buffet:"Buffet", climatizacao:"Climatização", limpeza:"Limpeza", alimentos:"Alimentos", brinquedos:"Brinquedos" };
      const catEntries = Object.entries(cats);
      doc.setFontSize(8);

      for (let i = 0; i < catEntries.length; i += 2) {
        const [k1, l1] = catEntries[i];
        const vals1 = avaliacoes.map(a => a.notas_json?.[k1]).filter(v => v !== undefined);
        const avg1 = vals1.length ? (vals1.reduce((s,v)=>s+v,0)/vals1.length).toFixed(2) : "N/A";
        doc.setFont("helvetica", "bold"); doc.text(`${l1}:`, margin, y);
        doc.setFont("helvetica", "normal"); doc.text(`${avg1}`, margin + 40, y);

        if (i + 1 < catEntries.length) {
          const [k2, l2] = catEntries[i + 1];
          const vals2 = avaliacoes.map(a => a.notas_json?.[k2]).filter(v => v !== undefined);
          const avg2 = vals2.length ? (vals2.reduce((s,v)=>s+v,0)/vals2.length).toFixed(2) : "N/A";
          doc.setFont("helvetica", "bold"); doc.text(`${l2}:`, margin + 90, y);
          doc.setFont("helvetica", "normal"); doc.text(`${avg2}`, margin + 130, y);
        }
        y += 6;
      }
      y += 6;

      // Tabela avaliações
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text("Listagem de Avaliações", margin, y); y += 8;

      // Header tabela
      doc.setFillColor(240, 235, 250);
      doc.rect(margin, y - 5, pageW - margin * 2, 8, "F");
      doc.setFontSize(7); doc.setFont("helvetica", "bold");
      doc.text("Nome", margin + 1, y);
      doc.text("Data", margin + 38, y);
      doc.text("Tema", margin + 58, y);
      doc.text("NPS", margin + 90, y);
      doc.text("Indica", margin + 102, y);
      doc.text("Refaz", margin + 118, y);
      doc.text("Melhoria", margin + 133, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      avaliacoes.slice(0, 80).forEach((a, i) => {
        if (y > 275) { doc.addPage(); y = 20; }
        if (i % 2 === 0) { doc.setFillColor(250, 250, 255); doc.rect(margin, y - 4, pageW - margin*2, 7, "F"); }
        doc.text((a.nome || "").slice(0, 20), margin + 1, y);
        doc.text((a.data_festa || "").slice(0, 10), margin + 38, y);
        doc.text((a.tema || "").slice(0, 14), margin + 58, y);
        doc.text(`${a.nps_geral ?? ""}`, margin + 90, y);
        doc.text(a.indica ? "Sim" : "Não", margin + 102, y);
        doc.text(a.refaz ? "Sim" : "Não", margin + 118, y);
        doc.text((a.texto_melhorar || "").slice(0, 28), margin + 133, y);
        y += 7;
      });

      if (avaliacoes.length > 80) {
        y += 3;
        doc.setFontSize(8); doc.setTextColor(120, 120, 120);
        doc.text(`... e mais ${avaliacoes.length - 80} registros (use CSV para exportação completa)`, margin, y);
      }

      // Footer em todas as páginas
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7); doc.setTextColor(150, 150, 150);
        doc.text(`Desenvolvido por Leonardo Alves | Mulekada 2026 | Página ${p}/${totalPages}`, margin, 290);
      }

      doc.save(`relatorio_mulekada_${new Date().toISOString().split("T")[0]}_${avaliacoes.length}reg.pdf`);
    } finally {
      setGeneratingPDF(false);
    }
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
      <Button variant="outline" size="sm" onClick={exportPDF} disabled={generatingPDF} className="gap-2">
        {generatingPDF ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</> : <><FileText className="w-4 h-4" /> PDF ({avaliacoes.length})</>}
      </Button>
    </div>
  );
}