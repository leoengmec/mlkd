import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("lgpdConsent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("lgpdConsent", "accepted");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg">
      <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
        <div className="flex-1 text-sm">
          <p className="font-semibold text-foreground mb-1">🍪 Cookies e Privacidade</p>
          <p className="text-muted-foreground text-xs">
            Usamos cookies para consentimento LGPD e segurança. Ao continuar, você aceita nossa{" "}
            <Link to="/privacidade" className="text-primary hover:underline font-semibold">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleAccept}
            size="sm"
            className="rounded-lg"
          >
            Aceitar
          </Button>
          <button
            onClick={() => setShow(false)}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}