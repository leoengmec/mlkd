import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AvaliacoesTable({ avaliacoes, onDelete }) {
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      await base44.functions.invoke("deleteAvaliacaoWithLog", {
        avaliacaoId: deleteId,
      });
      setDeleteId(null);
      if (onDelete) onDelete(deleteId);
    } catch (error) {
      console.error("Erro ao deletar:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (!avaliacoes.length) {
    return (
      <div className="bg-card rounded-2xl p-8 border border-border/50 text-center">
        <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-left font-semibold">Tel</th>
                <th className="px-4 py-3 text-left font-semibold">Data</th>
                <th className="px-4 py-3 text-left font-semibold">Tema</th>
                <th className="px-4 py-3 text-center font-semibold">NPS</th>
                <th className="px-4 py-3 text-center font-semibold">Próxima</th>
                <th className="px-4 py-3 text-center font-semibold">Ação</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoes.map((a) => (
                <tr key={a.id} className="border-b border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3">{a.nome}</td>
                  <td className="px-4 py-3">{a.telefone || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {a.data_festa ? new Date(a.data_festa).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="px-4 py-3">{a.tema || "—"}</td>
                  <td className="px-4 py-3 text-center font-bold text-primary">{a.nps_geral}</td>
                  <td className="px-4 py-3 text-center text-xs">
                    {a.proxima_festa === "3m" && "3m"}
                    {a.proxima_festa === "6m" && "6m"}
                    {a.proxima_festa === "12m" && "12m"}
                    {a.proxima_festa === "nao_sei" && "?"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(a.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Avaliação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Um log de auditoria será registrado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {deleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}