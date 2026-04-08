import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, MessageCircle, X, Check, Link2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function GerarLinkModal({ open, onClose, adminEmail }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [telefone, setTelefone] = useState("");

  const ref = encodeURIComponent(adminEmail || "admin");
  const baseUrl = window.location.origin;
  const link = `${baseUrl}/avaliacao?ref=${ref}`;
  const mensagem = `Oi! Avalie nossa festa no Mulekada 🎉\n${link}\n\n_Desenvolvido por Leonardo Alves_`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}&color=000000&bgcolor=ffffff&margin=10`;

  useEffect(() => {
    if (open && !saved && adminEmail) {
      base44.functions.invoke("adminCrudProxy", {
        entity: "links_avaliacao",
        operation: "create",
        data: { admin_email: adminEmail, link, ref: adminEmail, qr_url: qrUrl }
      }).catch(() => {});
      setSaved(true);
    }
    if (!open) setSaved(false);
  }, [open]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode_mulekada_${adminEmail?.split("@")[0] || "avaliacao"}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(qrUrl, "_blank");
    }
  };

  const handleWhatsApp = () => {
    const tel = telefone.replace(/\D/g, "");
    const url = tel
      ? `https://wa.me/55${tel}?text=${encodeURIComponent(mensagem)}`
      : `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Link2 className="w-5 h-5 text-primary" />
            Gerar Link de Avaliação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Link */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Link personalizado</label>
            <div className="flex gap-2">
              <Input value={link} readOnly className="text-xs font-mono bg-muted" />
              <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0 gap-1">
                {copied ? <><Check className="w-3.5 h-3.5 text-green-600" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 bg-muted/30 rounded-xl p-4">
            <img
              src={qrUrl}
              alt="QR Code Mulekada"
              className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg border border-border shadow-sm"
            />
            <p className="text-xs text-muted-foreground text-center">
              Escaneie para acessar o formulário de avaliação
            </p>
            <Button variant="outline" size="sm" onClick={handleDownloadQR} className="gap-2 w-full">
              <Download className="w-4 h-4" /> Download QR Code (PNG)
            </Button>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Enviar via WhatsApp (opcional: número do cliente)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: 84999999999 (sem +55)"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                className="text-sm"
                type="tel"
              />
              <Button
                size="sm"
                onClick={handleWhatsApp}
                className="shrink-0 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="w-4 h-4" /> Enviar Zap
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Deixe vazio para copiar mensagem sem número destino
            </p>
          </div>

          {/* Mensagem preview */}
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <p className="text-xs text-green-800 font-semibold mb-1">Mensagem enviada:</p>
            <p className="text-xs text-green-700 whitespace-pre-line">{mensagem}</p>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full gap-2">
            <X className="w-4 h-4" /> Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}