import { useHighContrast } from "../hooks/useHighContrast";
import { Sun, Moon } from "lucide-react";

export default function HighContrastToggle({ variant = "default" }) {
  const { enabled, toggle } = useHighContrast();

  if (variant === "sidebar") {
    return (
      <button
        onClick={toggle}
        title={enabled ? "Desativar alto contraste" : "Ativar alto contraste (WCAG AA)"}
        aria-label={enabled ? "Desativar alto contraste" : "Ativar alto contraste"}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-heading font-semibold transition-all text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      >
        {enabled ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
        {enabled ? "Contraste Normal" : "Alto Contraste"}
      </button>
    );
  }

  // Floating button for public pages
  return (
    <button
      onClick={toggle}
      title={enabled ? "Desativar alto contraste" : "Ativar alto contraste (WCAG AA)"}
      aria-label={enabled ? "Desativar alto contraste" : "Ativar alto contraste"}
      className="fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full bg-gray-800 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
    >
      {enabled ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}